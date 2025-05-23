// src/queue/report.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { addDays, formatISO } from 'date-fns';
import { RecipientService } from '../recipient/recipient.service';
import { DomainService } from '../domain/domain.service';
import { VolumeUsageService } from '../volume-usage/volume-usage.service';
import { PdfGeneratorService } from '../pdf/pdf-generator.service';
import { VolumeUsageSearchRequestDto } from '../common/dtos/volume-usage.dto';
import { RecipientDto } from '../common/dtos/recipient.dto';
import  {DeliveryContext} from '../delivery/interfaces/delivery-context.interface'
import {
  DeliveryStrategyFactory,
  DeliveryChannel,
} from '../delivery/delivery-strategy.factory';

export interface ReportJobData {
  recipientId: string;
  reportDate: string; // the report generation date (e.g., '2023-10-26')
}

@Processor('report_generation')
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(
    private readonly recipientService: RecipientService,
    private readonly domainService: DomainService,
    private readonly volumeUsageService: VolumeUsageService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly deliveryFactory: DeliveryStrategyFactory,
  ) {}

  @Process()
  async processReport(job: Job<ReportJobData>): Promise<void> {
    const { recipientId, reportDate } = job.data;
    this.logger.log(
      `Processing report for recipient ${recipientId} for date ${reportDate}`,
    );

    let recipient: RecipientDto;
    let reportBuffer: Buffer;

    try {
      // Get Recipient Details
      recipient = await this.recipientService.getRecipientById(recipientId);

      if (!recipient) {
        this.logger.warn(
          `Recipient ${recipientId} not found, skipping report generation.`,
        );
        return;
      }

      // 2. Data Gathering
      // The reportDate from job.data is for "today" for which the report is being run.
      // Data often refers to the day *before* the report date.
      const reportDateAsDate = new Date(reportDate); // Convert job date string to Date object
      const dataForDate = addDays(reportDateAsDate, -1); // Calculate date for data (yesterday)
      const fromDate = formatISO(dataForDate, { representation: 'date' }); // Get YYYY-MM-DD format for API
      const toDate = formatISO(reportDateAsDate, { representation: 'date' }); // Use report date as end for current daily data

      const volumeUsageRequest: VolumeUsageSearchRequestDto = {
        from: fromDate,
        to: toDate, // Use the "today" for which the report is run, or adjust based on API exact range logic
        domainIds: recipient.associatedDomains,
      };

      const volumeUsageData =
        await this.volumeUsageService.getVolumeUsage(volumeUsageRequest);

      // Report Generation
      reportBuffer = await this.pdfGeneratorService.generateReport(
        recipient.id,
        recipient.email,
        volumeUsageData.data,
        dataForDate,
      );
      this.logger.log(
        `PDF report generated successfully for ${recipient.email}.`,
      );

      // Delivery
      const preferredChannel = recipient.preferredChannel as DeliveryChannel;
      const deliveryStrategy =
        this.deliveryFactory.getStrategy(preferredChannel);

      let reportDownloadUrl: string | undefined;
      if (preferredChannel === DeliveryChannel.WEBHOOK) {
        // In production, this would be a temporary URL after uploading PDF.
        reportDownloadUrl = `https://mock-reports.example.com/${recipient.id}/${reportDate}-report.pdf`;
      }

      // Call the deliver method on the selected strategy
      await deliveryStrategy.deliver({
        recipient,
        reportBuffer,
        reportDownloadUrl,
        reportDate,
      });

      this.logger.log(
        `Report processing completed for recipient ${recipientId} via ${preferredChannel} channel.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process report for recipient ${recipientId}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw to allow BullMQ to handle retries/failures
    }
  }
}
