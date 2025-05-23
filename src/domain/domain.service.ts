import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DomainDto } from '../common/dtos/domain.dto';
import { simulateDelay } from '../common/utils/delay.util';
import { MOCK_DOMAINS } from '../common/mocks/domains.mock';

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);
  private readonly mockDomains: DomainDto[] = MOCK_DOMAINS;

  async getDomainById(id: string): Promise<DomainDto> {
    this.logger.log(`Mocking GET /domains/${id} API call...`);
    // Simulate network latency
    await simulateDelay(50, 200);

    const domain = this.mockDomains.find((d) => d.id === id);
    if (!domain) {
      throw new NotFoundException(`Domain with ID ${id} not found.`);
    }
    return domain;
  }
}
