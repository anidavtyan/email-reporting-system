import { Test, TestingModule } from '@nestjs/testing';
import { VolumeUsageService } from './volume-usage.service';
import { DomainService } from '../domain/domain.service';

describe('VolumeUsageService', () => {
  let volumeUsageService: VolumeUsageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VolumeUsageService, DomainService],
    }).compile();

    volumeUsageService = module.get<VolumeUsageService>(VolumeUsageService);
  });

  it('should be defined', () => {
    expect(volumeUsageService).toBeDefined();
  });
});
