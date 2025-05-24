import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { RecipientService } from '../recipient/recipient.service';
import { ReportJobData } from '../queue/report.processor';
import { fromZonedTime, toZonedTime, format } from 'date-fns-tz';
import { addHours, format as baseFormat } from 'date-fns';

@Injectable()
export class ReportingService implements OnModuleInit {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectQueue('report_generation') private reportQueue: Queue<ReportJobData>,
    private readonly recipientService: RecipientService,
  ) {}

  async onModuleInit() {
    this.logger.log(
      'ReportingService initialized. Checking for existing jobs and initiating daily schedule...',
    );
    // This call ensures that scheduling runs immediately on application startup,
    // to catch up missed schedules or to set up first time.
    // In a distributed environment, this would ideally be guarded by a distributed lock
    // or rely on a single, dedicated scheduler instance (e.g., a BullMQ repeatable job itself).
    await this.scheduleDailyReports();
  }

  // This cron job ensures that daily reports are scheduled reliably every day.
  // It's set to 07:00 UTC, the actual report generation time for recipients is localized later.
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async handleDailyGlobalSchedule() {
    this.logger.log('Global daily report scheduling triggered by cron.');
    await this.scheduleDailyReports();
  }

  async scheduleDailyReports(): Promise<void> {
    const recipients = await this.recipientService.getRecipients();
    const now = new Date();

    // Determine the report date (e.g., YYYY-MM-DD for yesterday).
    const reportDateForJobs = baseFormat(addHours(now, -24), 'yyyy-MM-dd');

    this.logger.log(
      `Attempting to schedule daily reports for report date: ${reportDateForJobs} for ${recipients.length} recipients.`,
    );

    for (const recipient of recipients) {
      const jobId = `report-generation:${recipient.id}:${reportDateForJobs}`; // Consistent ID for idempotency
      try {
        // Check if a job with this ID already exists in any state (active, waiting, completed, etc.)
        // to avoid duplicate jobs if `scheduleDailyReports` is called multiple times.
        const existingJob = await this.reportQueue.getJob(jobId);
        if (existingJob) {
          this.logger.debug(
            `Job ${jobId} already exists in queue (status: ${await existingJob.getState()}). Skipping re-scheduling.`,
          );
          continue;
        }

        const startHour = 7; // Start of the desired window
        const endHour = 9; // End of the desired window (exclusive for minute 0)
        const totalMinutesInWindow = (endHour - startHour) * 60; // 2 hours * 60 minutes = 120 minutes

        // Generate a random minute offset within the 2-hour window (0 to 119 minutes)
        const randomMinuteOffset = Math.floor(
          Math.random() * totalMinutesInWindow,
        );

        const nowInRecipientTimezone = toZonedTime(now, recipient.timezone);
        let targetTimeInRecipientTimezone = new Date(nowInRecipientTimezone);

        // Set the time to the start of the window (07:00:00)
        targetTimeInRecipientTimezone.setHours(startHour, 0, 0, 0);
        targetTimeInRecipientTimezone.setMinutes(
          targetTimeInRecipientTimezone.getMinutes() + randomMinuteOffset,
        );

        // If the calculated target time has already passed for the current day in their timezone,
        // schedule it for tomorrow at the same local time.
        if (targetTimeInRecipientTimezone < nowInRecipientTimezone) {
          targetTimeInRecipientTimezone = addHours(
            targetTimeInRecipientTimezone,
            24,
          );
        }

        // Convert the target local time back to UTC for scheduling delay in BullMQ
        const targetUtcTime = fromZonedTime(
          targetTimeInRecipientTimezone,
          recipient.timezone,
        );
        const delay = targetUtcTime.getTime() - Date.now();
        if (delay < 0) {
          // Double check if the job was due in the past
          // Ideally should be caught by the `if (targetTimeInRecipientTimezone < nowInRecipientTimezone)` above
          this.logger.warn(
            `Calculated delay is negative (${delay}ms) for recipient ${recipient.id} for report date ${reportDateForJobs}. Scheduling for immediate execution (or minimal delay).`,
          );
          await this.reportQueue.add(
            jobId,
            { recipientId: recipient.id, reportDate: reportDateForJobs },
            {
              delay: 100,
              jobId: jobId,
              removeOnComplete: true,
              removeOnFail: false,
            },
          );
        } else {
          this.logger.log(
            `Scheduling job ${jobId} for recipient ${recipient.id} to run at ${format(targetTimeInRecipientTimezone, 'HH:mm zzz')} local time. Delay: ${Math.round(delay / 1000 / 60)} minutes.`,
          );
          await this.reportQueue.add(
            jobId,
            { recipientId: recipient.id, reportDate: reportDateForJobs },
            {
              delay: delay,
              jobId: jobId,
              removeOnComplete: true,
              removeOnFail: false,
            },
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to schedule job for recipient ${recipient.id} for report date ${reportDateForJobs}: ${error.message}`,
          error.stack,
        );
      }
    }
    this.logger.log(
      `Finished attempting to schedule daily reports for ${recipients.length} recipients.`,
    );
  }
}
