import { Injectable, Logger } from '@nestjs/common';
import {
  VolumeUsageSearchRequestDto,
  VolumeUsageSearchResponseDto,
  DomainVolumeUsageDto,
} from '../common/dtos/volume-usage.dto';
import { DomainService } from '../domain/domain.service';
import { simulateDelay } from '../common/utils/delay.util';

@Injectable()
export class VolumeUsageService {
  private readonly logger = new Logger(VolumeUsageService.name);
  constructor(private readonly domainService: DomainService) {}

  async getVolumeUsage(
    requestDto: VolumeUsageSearchRequestDto,
  ): Promise<VolumeUsageSearchResponseDto> {
    const { domainIds } = requestDto;
    this.logger.log(
      `Mocking POST /volume-usage/search API call for domains: ${domainIds.join(', ')}`,
    );
    // Simulate network latency
    await simulateDelay(1000, 60000);

    const chunkSize = 50; // fetch 50 domain IDs at a time
    const mockData: DomainVolumeUsageDto[] = [];

    // Chunk the domain IDs and process them in batches
    for (let i = 0; i < domainIds.length; i += chunkSize) {
      const chunk = domainIds.slice(i, i + chunkSize);
      this.logger.log(
        `Processing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(domainIds.length / chunkSize)} with ${chunk.length} domains...`,
      );

      const chunkPromises: Promise<DomainVolumeUsageDto>[] = chunk.map(
        async (domainId) => {
          // Generate mock data for each domain ID
          const emailVolume = Math.floor(Math.random() * 10000) + 100; // 100 to 10100
          const spfPassRatio = Math.floor(Math.random() * 30) + 70; // 70 to 100
          const dmarcPassRatio = Math.floor(Math.random() * 20) + 80; // 80 to 100

          // Fetch the domain name from DomainService based on ID
          // Each getDomainById call will have its own simulated delay
          const domain = await this.domainService.getDomainById(domainId);
          const domainName = domain.name;

          return {
            domainId,
            domainName,
            emailVolume,
            spfPassRatio,
            dmarcPassRatio,
          };
        },
      );

      // Await all promises in the current chunk before moving to the next chunk
      // This limits concurrent domainService.getDomainById calls to `chunkSize`
      const chunkResults = await Promise.all(chunkPromises);
      mockData.push(...chunkResults);

      // Apply small delay between chunks (e.g., 100-500ms)
      if (i + chunkSize < domainIds.length) {
        await simulateDelay(100, 500);
      }
    }

    return { data: mockData };
  }
}
