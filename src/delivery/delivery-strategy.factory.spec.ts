import { Test, TestingModule } from '@nestjs/testing';
import {
  DeliveryChannel,
  DeliveryStrategyFactory,
} from './delivery-strategy.factory';
import { EmailDeliveryService } from '../email-delivery/email-delivery.service';
import { WebhookDeliveryService } from '../webhook-delivery/webhook-delivery.service';
import { EmailDeliveryStrategy } from './strategies/email-delivery.strategy';
import { WebhookDeliveryStrategy } from './strategies/webhook-delivery.strategy';

describe('DeliveryStrategyFactory', () => {
  let factory: DeliveryStrategyFactory;
  let emailStr: EmailDeliveryStrategy;
  let webhookStr: WebhookDeliveryStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryStrategyFactory,
        EmailDeliveryStrategy,
        WebhookDeliveryStrategy,
        { provide: EmailDeliveryService, useValue: { send: jest.fn() } },
        { provide: WebhookDeliveryService, useValue: { send: jest.fn() } },
      ],
    }).compile();

    factory = module.get(DeliveryStrategyFactory);
    emailStr = module.get(EmailDeliveryStrategy);
    webhookStr = module.get(WebhookDeliveryStrategy);
  });

  it('returns webhook service if channel is webhook', () => {
    const strategy = factory.getStrategy(DeliveryChannel.WEBHOOK);
    expect(strategy).toBe(webhookStr);
  });

  it('returns email service channel is email', () => {
    const strategy = factory.getStrategy(DeliveryChannel.EMAIL);
    expect(strategy).toBe(emailStr);
  });
});
