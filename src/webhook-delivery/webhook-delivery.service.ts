import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { simulateDelay } from '../common/utils/delay.util';
import { retryAsync } from '../common/utils/retry-async.util';
import { WebhookPayload } from './interfaces/webhook-payload.interface';

@Injectable()
export class WebhookDeliveryService {
  private readonly logger = new Logger(WebhookDeliveryService.name);
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_BACKOFF_MS = 1000;

  async sendWebhook(
    callbackUrl: string,
    payload: WebhookPayload,
  ): Promise<void> {
    this.logger.log(`Attempting to send webhook to: ${callbackUrl}`);
    this.logger.log(`Payload: ${JSON.stringify(payload)}`);

    await retryAsync(
      async () => {
        this.logger.log(`Sending webhook to ${callbackUrl}...`);
        await simulateDelay(500, 2500);

        if (Math.random() < 0.5) {
          throw new Error('Mock webhook failure');
        }
        this.logger.log(`Webhook sent to ${callbackUrl}`);
      },
      {
        maxRetries: this.MAX_RETRIES,
        initialBackoffMs: this.INITIAL_BACKOFF_MS,
        operationName: 'sendWebhook',
        logger: this.logger,
      },
    );
    this.logger.error(
      `Failed to send webhook to ${callbackUrl} after ${this.MAX_RETRIES} attempts.`,
    );
    throw new InternalServerErrorException(
      `Failed to send webhook to ${callbackUrl}`,
    );
  }
}
