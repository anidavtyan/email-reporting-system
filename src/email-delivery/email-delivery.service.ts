import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EmailSendRequestDto } from '../common/dtos/email-send.dto';
import { simulateDelay } from '../common/utils/delay.util';
import { retryAsync } from '../common/utils/retry-async.util';

@Injectable()
export class EmailDeliveryService {
  private readonly logger = new Logger(EmailDeliveryService.name);
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_BACKOFF_MS = 1000;

  async sendEmail(requestDto: EmailSendRequestDto): Promise<void> {
    this.logger.log(`Attempting to send email to: ${requestDto.to}`);
    this.logger.log(`Subject: ${requestDto.subject}`);
    this.logger.log(
      `Body (excerpt): ${requestDto.bodyText.substring(0, 50)}...`,
    );

    if (requestDto.attachmentPdfBuffer) {
      this.logger.log('PDF attachment present (base64 buffer received)');
    } else if (requestDto.attachmentPdfUrl) {
      this.logger.log(`PDF attachment URL: ${requestDto.attachmentPdfUrl}`);
    } else {
      this.logger.log('No PDF attachment.');
    }

    // Simulate an external email provider call with potential failures and retries
    await retryAsync(
      async () => {
        this.logger.log(`Sending email to ${requestDto.to}...`);
        await simulateDelay(500, 2500);

        if (Math.random() < 0.5) {
          throw new Error('Mock email failure');
        }
        this.logger.log(`Email sent to ${requestDto.to}`);
      },
      {
        maxRetries: this.MAX_RETRIES,
        initialBackoffMs: this.INITIAL_BACKOFF_MS,
        operationName: 'sendEmail',
        logger: this.logger,
      },
    );

    this.logger.error(
      `Failed to send email to ${requestDto.to} after ${this.MAX_RETRIES} attempts.`,
    );
    throw new InternalServerErrorException(
      `Failed to send email to ${requestDto.to}`,
    );
  }
}
