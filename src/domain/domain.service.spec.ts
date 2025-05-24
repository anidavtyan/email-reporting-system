import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance, AxiosResponse } from 'axios';
import { DomainService } from './domain.service';
import { DomainDto } from '../common/dtos/domain.dto';
import { createConfiguredAxiosInstance } from '../common/utils/axios-config.util';

jest.mock('../common/utils/axios-config.util');

describe('DomainService', () => {
  let service: DomainService;
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
        DomainService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<DomainService>(DomainService);
  });

  describe('constructor', () => {
    it('throws if DOMAIN_API_URL is not set', () => {
      (mockConfigService.get as jest.Mock).mockReturnValue(undefined);
      expect(() => new DomainService(mockConfigService as any)).toThrow(
        'DOMAIN_API_URL is not defined in configuration.',
      );
    });

    it('calls createConfiguredAxiosInstance with correct args', () => {
      expect(createConfiguredAxiosInstance).toHaveBeenCalledWith(
        DomainService.name,
        'http://localhost:3005',
        expect.any(Object),
      );
    });
  });

  describe('getDomainById', () => {
    it('returns DomainDto on success', async () => {
      const mockDomain: DomainDto = {
        id: 'dom-abc-123',
        name: 'example.com',
        description: 'Main corporate domain',
      };
      const resp = { data: mockDomain } as AxiosResponse<DomainDto>;
      (mockAxios.get as jest.Mock).mockResolvedValue(resp);

      await expect(service.getDomainById('dom-abc-123')).resolves.toEqual(
        mockDomain,
      );
      expect(mockAxios.get).toHaveBeenCalledWith('/domains/dom-abc-123');
    });

    it('logs and rethrows on error', async () => {
      const error = new Error('Network error');
      (mockAxios.get as jest.Mock).mockRejectedValue(error);
      jest.spyOn(service['logger'], 'error');

      await expect(service.getDomainById('x')).rejects.toThrow(error);
      expect(service['logger'].error).toHaveBeenCalledWith(
        `Fetching domains by x failed after retries`,
        error.stack || error.message,
      );
    });
  });
});
