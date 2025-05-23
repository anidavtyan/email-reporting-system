import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RecipientDto } from '../common/dtos/recipient.dto';
import { simulateDelay } from '../common/utils/delay.util';
import { MOCK_RECIPIENTS } from '../common/mocks/recipients.mock';
import { DomainDto } from '../common/dtos/domain.dto';

@Injectable()
export class RecipientService {
  private readonly logger = new Logger(RecipientService.name);
  private readonly recipients: RecipientDto[] = MOCK_RECIPIENTS;
  async getRecipients(): Promise<RecipientDto[]> {
    this.logger.log('Mocking GET /notifications API call...');
    // Simulate network latency
    await simulateDelay(100, 500);
    return this.recipients;
  }
  async getRecipientsByDomain(domainId: string): Promise<RecipientDto[]> {
    return this.recipients.filter((r) =>
      r.associatedDomains.includes(domainId),
    );
  }
  async getRecipientById(id: string): Promise<RecipientDto> {
    return this.recipients.find((r) => r.id === id);
  }
}
