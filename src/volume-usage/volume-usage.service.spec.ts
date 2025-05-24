import { Test, TestingModule } from '@nestjs/testing';
import { VolumeUsageService } from './volume-usage.service';
import { DomainService } from '../domain/domain.service';
import {
  VolumeUsageSearchRequestDto,
  DomainVolumeUsageDto,
} from '../common/dtos/volume-usage.dto';
import { simulateDelay } from '../common/utils/delay.util';
import { DomainDto } from '../common/dtos/domain.dto';

// Mock the simulateDelay util to speed up tests
jest.mock('../common/utils/delay.util', () => ({ simulateDelay: jest.fn() }));

describe('VolumeUsageService', () => {
  let service: VolumeUsageService;
  let mockDomainService: Partial<DomainService>;

  beforeEach(async () => {
    mockDomainService = {
      getDomainById: jest.fn(
        async (id: string) => ({ id, name: `Domain ${id}` }) as DomainDto,
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolumeUsageService,
        { provide: DomainService, useValue: mockDomainService },
      ],
    }).compile();

    service = module.get<VolumeUsageService>(VolumeUsageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return volume usage data for given domainIds', async () => {
    // Arrange: small set of domain IDs
    const request: VolumeUsageSearchRequestDto = {
      domainIds: ['dom-abc-123', 'dom-def-456'],
      from: '2025-05-24T00:00:00Z',
      to: '2025-05-25T00:00:00Z',
    };
    // Act
    const result = await service.getVolumeUsage(request);

    // Assert: data array length matches
    expect(result.data).toHaveLength(2);
    // DomainService.getDomainById called for each
    expect(mockDomainService.getDomainById).toHaveBeenCalledTimes(2);
    // Each entry matches id and name
    result.data.forEach((entry: DomainVolumeUsageDto, idx: number) => {
      expect(entry.domainId).toBe(request.domainIds[idx]);
      expect(entry.domainName).toBe(`Domain ${request.domainIds[idx]}`);
      expect(typeof entry.emailVolume).toBe('number');
      expect(typeof entry.spfPassRatio).toBe('number');
      expect(typeof entry.dmarcPassRatio).toBe('number');
    });
  });

  it('should process in chunks when domainIds exceed chunk size', async () => {
    // Arrange: 120 IDs to force 3 chunks (chunkSize=50)
    const domainIds: string[] = Array.from(
      { length: 120 },
      (_, i) => `dom-${i}`,
    );
    const result = await service.getVolumeUsage({
      domainIds,
      from: '2025-05-24T00:00:00Z',
      to: '2025-05-25T00:00:00Z',
    });
    expect(result.data).toHaveLength(120);
    expect(
      (mockDomainService.getDomainById as jest.Mock).mock.calls.length,
    ).toBe(120);
  });

  it('should await simulateDelay between chunks', async () => {
    const domainIds: string[] = Array.from(
      { length: 60 },
      (_, i) => `dom-${i}`,
    );
    const request: VolumeUsageSearchRequestDto = {
      domainIds,
      from: '2025-05-24T00:00:00Z',
      to: '2025-05-25T00:00:00Z',
    };

    await service.getVolumeUsage(request);

    expect(simulateDelay).toHaveBeenCalled();
    expect(
      (simulateDelay as jest.Mock).mock.calls.some(
        (call) => call[0] === 100 && call[1] === 500,
      ),
    ).toBe(true);
  });
});
