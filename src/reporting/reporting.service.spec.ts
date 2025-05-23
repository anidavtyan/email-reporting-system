import { Test, TestingModule } from '@nestjs/testing';
import { ReportingService } from './reporting.service';
import { RecipientService } from '../recipient/recipient.service';
import { getQueueToken } from '@nestjs/bull';

describe('ReportingService', () => {
  let service: ReportingService;
  let mockReportQueue;

  beforeEach(async () => {
    mockReportQueue = {
      add: jest.fn(), // Mock the add method
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ReportingService,
        RecipientService, // RecipientService is a provider
        {
          provide: getQueueToken('report_generation'), // 'report_generation' is the queue name
          useValue: mockReportQueue,
        },
      ],
    }).compile();

    service = module.get<ReportingService>(ReportingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
