import { Module } from '@nestjs/common';
import { VolumeUsageService } from './volume-usage.service';
import { DomainService } from '../domain/domain.service';

@Module({
  providers: [VolumeUsageService, DomainService],
  exports: [VolumeUsageService],
})
export class VolumeUsageModule {}
