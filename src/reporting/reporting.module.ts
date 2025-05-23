import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { RecipientModule } from '../recipient/recipient.module';
import { QueueModule } from '../queue/queue.module';
import { RecipientService } from '../recipient/recipient.service';

@Module({
  imports: [RecipientModule, QueueModule],
  providers: [ReportingService, RecipientService],
  exports: [ReportingService],
})
export class ReportingModule {}
