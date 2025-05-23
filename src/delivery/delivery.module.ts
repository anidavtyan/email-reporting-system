import { Module } from '@nestjs/common';
import { EmailDeliveryService } from '../email-delivery/email-delivery.service';
import { WebhookDeliveryService } from '../webhook-delivery/webhook-delivery.service';
import { EmailDeliveryStrategy } from './strategies/email-delivery.strategy';
import { WebhookDeliveryStrategy } from './strategies/webhook-delivery.strategy';
import { DeliveryStrategyFactory } from './delivery-strategy.factory';

@Module({
  imports: [],
  providers: [
    EmailDeliveryService,
    WebhookDeliveryService,
    EmailDeliveryStrategy,
    WebhookDeliveryStrategy,
    DeliveryStrategyFactory,
  ],
  exports: [DeliveryStrategyFactory],
})
export class DeliveryModule {}
