import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ReportProcessor } from './report.processor';
import { RecipientModule } from '../recipient/recipient.module';
import { DomainModule } from '../domain/domain.module';
import { VolumeUsageModule } from '../volume-usage/volume-usage.module';
import { PdfModule } from '../pdf/pdf.module';
import { EmailDeliveryModule } from '../email-delivery/email-delivery.module';
import { WebhookDeliveryModule } from '../webhook-delivery/webhook-delivery.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'report_generation',
    }),
    RecipientModule,
    DomainModule,
    VolumeUsageModule,
    PdfModule,
    DeliveryModule,
    EmailDeliveryModule,
    WebhookDeliveryModule,
  ],
  providers: [ReportProcessor],
  exports: [BullModule],
})
export class QueueModule {}
