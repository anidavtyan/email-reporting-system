import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DeliveryStrategy } from '../interfaces/delivery-strategy.interface';
import { WebhookDeliveryService } from '../../webhook-delivery/webhook-delivery.service';
import { DeliveryContext } from '../interfaces/delivery-context.interface';

@Injectable()
export class WebhookDeliveryStrategy implements DeliveryStrategy {
  private readonly logger = new Logger(WebhookDeliveryStrategy.name);

  constructor(
    private readonly webhookDeliveryService: WebhookDeliveryService,
  ) {}

  async deliver(context: DeliveryContext): Promise<void> {
    const { recipient, reportDate, reportDownloadUrl } = context;
    if (!reportDownloadUrl) {
      this.logger.error(
        `Cannot send webhook for recipient ${recipient.id}: No download URL provided for the report.`,
      );
      throw new InternalServerErrorException(
        'Webhook delivery requires a report download URL.',
      );
    }

    // In a real scenario, the 'downloadUrl' would come from an external storage service (e.g., S3).
    // For this mock, we assume 'reportDownloadUrl' would be pre-signed or publicly accessible.
    const payload = {
      recipientId: recipient.id,
      downloadUrl: reportDownloadUrl,
      reportDate,
      generatedAt: new Date().toISOString(),
    };

    await this.webhookDeliveryService.sendWebhook(
      recipient.callbackUrl,
      payload,
    );
  }
}
