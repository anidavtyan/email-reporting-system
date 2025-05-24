import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportingModule } from './reporting/reporting.module';
import { RecipientModule } from './recipient/recipient.module';
import { DomainModule } from './domain/domain.module';
import { VolumeUsageModule } from './volume-usage/volume-usage.module';
import { EmailDeliveryModule } from './email-delivery/email-delivery.module';
import { WebhookDeliveryModule } from './webhook-delivery/webhook-delivery.module';
import { PdfModule } from './pdf/pdf.module';
import { DeliveryModule } from './delivery/delivery.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ReportingModule,
    RecipientModule,
    DomainModule,
    VolumeUsageModule,
    EmailDeliveryModule,
    WebhookDeliveryModule,
    PdfModule,
    DeliveryModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
