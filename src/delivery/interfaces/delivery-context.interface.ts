import { RecipientDto } from '../../common/dtos/recipient.dto';

export interface DeliveryContext {
  recipient: RecipientDto;
  reportBuffer: Buffer;
  reportDownloadUrl?: string;
  reportDate?: string;
}
