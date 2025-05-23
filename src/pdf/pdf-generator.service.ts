import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { DomainVolumeUsageDto } from '../common/dtos/volume-usage.dto';
import { format } from 'date-fns';
import {
  loadFile,
  resolvePath,
  saveToDirectory,
} from '../common/utils/file.util';
import {
  renderTemplate,
  renderUsageDataRows,
} from '../common/utils/table-renderer.util';
import { defaultPdfOptions } from './pdf.config';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private htmlTemplate: string;

  constructor(
    @Inject('PUPPETEER') private readonly puppeteer: typeof import('puppeteer'),
  ) {}

  async onModuleInit() {
    try {
      // TODO: remove hardcoded template name, and remove from onModuleInit
      // Now it's done this way to cache the template
      const templatePath = resolvePath(
        'templates/pdf',
        'daily-usage-report.html',
      );
      this.htmlTemplate = await loadFile(templatePath);
      this.logger.log('PDF report HTML template loaded successfully.');
    } catch (error) {
      this.logger.error(
        'Failed to load PDF report HTML template:',
        error.message,
      );
      // TODO: throw an error or handle fallback based on importance level
      throw new InternalServerErrorException(
        'Missing HTML template. Cannot generate PDF.',
      );
    }
  }

  async generateReport(
    recipientId: string,
    recipientEmail: string,
    usageData: DomainVolumeUsageDto[],
    reportDate: Date,
  ): Promise<Buffer> {
    this.logger.log(
      `Generating PDF for recipient ${recipientId} (${recipientEmail}) for report date ${reportDate.toDateString()}...`,
    );

    if (!this.htmlTemplate) {
      throw new InternalServerErrorException(
        'PDF template not loaded. Service not initialized correctly.',
      );
    }

    const usageDataRows = renderUsageDataRows(usageData);
    const finalHtml = renderTemplate(this.htmlTemplate, {
      recipientEmail,
      reportDate: reportDate.toDateString(),
      usageDataRows,
      generationTimestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    });

    let browser;
    try {
      browser = await this.puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

      const pdfData = await page.pdf(defaultPdfOptions);

      // Puppeteer may actually return a Uint8Array, so we wrap it as a Buffer if needed
      const pdfBuffer = Buffer.isBuffer(pdfData)
        ? pdfData
        : Buffer.from(pdfData);

      this.logger.log(`PDF generated successfully`, PdfGeneratorService.name);
      const fileName = `${recipientId}-${reportDate.toISOString().split('T')[0]}.pdf`;
      const filePath = await saveToDirectory('samples', fileName, pdfBuffer);
      this.logger.log(`Sample PDF saved to: ${filePath}`);

      return pdfBuffer;
    } catch (error) {
      this.logger.error(
        `Failed to generate PDF for ${recipientEmail}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `PDF generation failed: ${error.message}`,
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
