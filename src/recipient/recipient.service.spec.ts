import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance, AxiosResponse } from 'axios';
import { RecipientService } from './recipient.service';
import { RecipientDto } from '../common/dtos/recipient.dto';
import { createConfiguredAxiosInstance } from '../common/utils/axios-config.util';

jest.mock('../common/utils/axios-config.util');

describe('RecipientService', () => {
  let service: RecipientService;
  let mockConfigService: Partial<ConfigService>;
  let mockAxios: Partial<AxiosInstance>;

  beforeEach(async () => {
    mockAxios = { get: jest.fn() };
    (createConfiguredAxiosInstance as jest.Mock).mockReturnValue(mockAxios);

    mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3005'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipientService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RecipientService>(RecipientService);
  });

  describe('constructor', () => {
    it('throws if RECIPIENT_API_URL is not set', () => {
      (mockConfigService.get as jest.Mock).mockReturnValue(undefined);
      expect(() => new RecipientService(mockConfigService as any)).toThrow(
        'RECIPIENT_API_URL is not defined in configuration.',
      );
    });

    it('calls createConfiguredAxiosInstance with correct args', () => {
      expect(createConfiguredAxiosInstance).toHaveBeenCalledWith(
        RecipientService.name,
        'http://localhost:3005',
        expect.any(Object),
      );
    });
  });

  describe('getRecipients', () => {
    it('returns array on success', async () => {
      const data: RecipientDto[] = [
        {
          id: 'rec-1a2b-3c4d',
          email: 'john.doe@example.com',
          timezone: 'America/New_York',
          preferredChannel: 'email',
          associatedDomains: ['dom-abc-123', 'dom-def-456'],
        },
      ];
      const resp = { data } as AxiosResponse<RecipientDto[]>;
      (mockAxios.get as jest.Mock).mockResolvedValue(resp);

      await expect(service.getRecipients()).resolves.toEqual(data);
      expect(mockAxios.get).toHaveBeenCalledWith('/notifications');
    });

    it('logs and rethrows on error', async () => {
      const err = new Error('fail');
      (mockAxios.get as jest.Mock).mockRejectedValue(err);
      jest.spyOn(service['logger'], 'error');

      await expect(service.getRecipients()).rejects.toThrow(err);
      expect(service['logger'].error).toHaveBeenCalledWith(
        'Fetching recipients failed after retries',
        err.stack || err.message,
      );
    });
  });

  describe('getRecipientById', () => {
    it('returns recipient on success', async () => {
      const recipient: RecipientDto = {
        id: 'rec-1a2b-3c4d',
        email: 'john.doe@example.com',
        timezone: 'America/New_York',
        preferredChannel: 'email',
        associatedDomains: ['dom-abc-123', 'dom-def-456'],
      };
      const resp = { data: recipient } as AxiosResponse<RecipientDto>;
      (mockAxios.get as jest.Mock).mockResolvedValue(resp);

      await expect(service.getRecipientById('rec-1a2b-3c4d')).resolves.toEqual(
        recipient,
      );
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/notifications/rec-1a2b-3c4d',
      );
    });

    it('logs and rethrows on error', async () => {
      const err = new Error('fail-id');
      (mockAxios.get as jest.Mock).mockRejectedValue(err);
      jest.spyOn(service['logger'], 'error');

      await expect(service.getRecipientById('x')).rejects.toThrow(err);
      expect(service['logger'].error).toHaveBeenCalledWith(
        `Fetching recipients by x failed after retries`,
        err.stack || err.message,
      );
    });
  });
});
