import { Injectable, Logger } from '@nestjs/common';
import { DeliveryStrategy } from './interfaces/delivery-strategy.interface';
import { EmailDeliveryStrategy } from './strategies/email-delivery.strategy';
import { WebhookDeliveryStrategy } from './strategies/webhook-delivery.strategy';

export enum DeliveryChannel {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  // Add other channels here as needed
}

@Injectable()
export class DeliveryStrategyFactory {
  private readonly logger = new Logger(DeliveryStrategyFactory.name);
  private strategies: Map<DeliveryChannel, DeliveryStrategy>;

  constructor(
    private readonly emailStrategy: EmailDeliveryStrategy,
    private readonly webhookStrategy: WebhookDeliveryStrategy,
  ) {
    this.strategies = new Map<DeliveryChannel, DeliveryStrategy>();
    this.strategies.set(DeliveryChannel.EMAIL, this.emailStrategy);
    this.strategies.set(DeliveryChannel.WEBHOOK, this.webhookStrategy);
    // Register other strategies here
  }

  getStrategy(channel: DeliveryChannel): DeliveryStrategy {
    const strategy = this.strategies.get(channel);
    if (!strategy) {
      this.logger.error(`No delivery strategy found for channel: ${channel}`);
      throw new Error(`Unsupported delivery channel: ${channel}`);
    }
    return strategy;
  }
}