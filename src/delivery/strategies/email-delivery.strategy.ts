import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeliveryContext } from '../interfaces/delivery-context.interface';
import { DeliveryStrategy } from '../interfaces/delivery-strategy.interface';
import { EmailDeliveryService } from '../../email-delivery/email-delivery.service';
import { loadFile, resolvePath } from '../../common/utils/file.util';
import { renderTemplate } from '../../common/utils/table-renderer.util';

@Injectable()
export class EmailDeliveryStrategy implements DeliveryStrategy {
  private readonly templatePath = 'templates/email';
  constructor(private readonly emailDeliveryService: EmailDeliveryService) {}

  async deliver(context: DeliveryContext): Promise<void> {
    // NOTE we can use reportDownloadUrl as well
    const { recipient, reportBuffer, reportDate } = context;
    const resolvedDate = reportDate || new Date().toISOString().split('T')[0];
    const subject = `Your Daily Email Usage Report - ${resolvedDate}`;

    try {
      const templateHtmlPath = resolvePath(
        'templates/email',
        'daily-report.html',
      );
      const templateTxtPath = resolvePath(
        this.templatePath,
        'daily-report.txt',
      );

      const [htmlTemplate, txtTemplate] = await Promise.all([
        loadFile(templateHtmlPath),
        loadFile(templateTxtPath),
      ]);

      const bodyHtml = renderTemplate(htmlTemplate, {
        recipientEmail: recipient.email,
        reportDate: resolvedDate,
      });

      const bodyText = renderTemplate(txtTemplate, {
        recipientEmail: recipient.email,
        reportDate: resolvedDate,
      });

      await this.emailDeliveryService.sendEmail({
        to: recipient.email,
        subject,
        bodyText,
        bodyHtml,
        attachmentPdfBuffer: reportBuffer,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate or send email: ${error.message}`,
      );
    }
  }
}
