import { RecipientDto } from '../dtos/recipient.dto';

export const MOCK_RECIPIENTS: RecipientDto[] = [
  {
    id: 'rec-1a2b-3c4d',
    email: 'john.doe@example.com',
    timezone: 'America/New_York',
    preferredChannel: 'email',
    associatedDomains: ['dom-abc-123', 'dom-def-456'],
  },
  {
    id: 'rec-5e6f-7g8h',
    email: 'jane.smith@example.com',
    timezone: 'Europe/London',
    preferredChannel: 'email',
    associatedDomains: ['dom-abc-123', 'dom-ghi-789'],
  },
  {
    id: 'rec-9i0j-1k2l',
    email: 'bob.johnson@example.com',
    timezone: 'Asia/Tokyo',
    preferredChannel: 'webhook',
    associatedDomains: ['dom-xyz-987'],
    callbackUrl: 'https://webhook.site/abc-123',
  },
  {
    id: 'rec-a1b2-c3d4',
    email: 'alice.brown@example.com',
    timezone: 'America/Los_Angeles',
    preferredChannel: 'email',
    associatedDomains: ['dom-abc-123'],
  },
  {
    id: 'rec-e5f6-g7h8',
    email: 'charlie.davis@example.com',
    timezone: 'Australia/Sydney',
    preferredChannel: 'email',
    associatedDomains: ['dom-def-456'],
  },
];
