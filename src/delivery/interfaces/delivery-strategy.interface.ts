import { DeliveryContext } from './delivery-context.interface';

export interface DeliveryStrategy {
  deliver(context: DeliveryContext): Promise<void>;
}
