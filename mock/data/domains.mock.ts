import { DomainDto } from '../dtos/domain.dto';

export const MOCK_DOMAINS: DomainDto[] = [
  {
    id: 'dom-abc-123',
    name: 'example.com',
    description: 'Main corporate domain',
  },
  {
    id: 'dom-def-456',
    name: 'another.org',
    description: 'Partner network domain',
  },
  {
    id: 'dom-ghi-789',
    name: 'sub.example.com',
    description: 'Subdomain for specific services',
  },
  {
    id: 'dom-xyz-987',
    name: 'test.net',
    description: 'Internal testing domain',
  },
];
