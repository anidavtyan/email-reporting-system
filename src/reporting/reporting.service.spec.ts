import { Test, TestingModule } from '@nestjs/testing';
import { ReportingService } from './reporting.service';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { RecipientService } from '../recipient/recipient.service';
import { addHours, format as baseFormat } from 'date-fns';

describe('ReportingService', () => {
  let service: ReportingService;
  let mockQueue: Partial<Queue>;
  let mockRecipientService: Partial<RecipientService>;

  beforeEach(async () => {
    mockQueue = {
      getJob: jest.fn().mockResolvedValue(null),
      add: jest.fn().mockResolvedValue(undefined),
    };
    mockRecipientService = {
      getRecipients: jest.fn().mockResolvedValue([
        { id: 'user1', timezone: 'UTC' },
        { id: 'user2', timezone: 'UTC' },
      ] as any),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportingService,
        { provide: getQueueToken('report_generation'), useValue: mockQueue },
        { provide: RecipientService, useValue: mockRecipientService },
      ],
    }).compile();

    service = module.get<ReportingService>(ReportingService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('schedules a job for each recipient when none exist', async () => {
    // Freeze time for reproducible reportDate calculation
    const fixedDate = new Date('2025-05-24T12:00:00Z');
    jest.spyOn(Date, 'now').mockReturnValue(fixedDate.getTime());

    await service.scheduleDailyReports();

    // reportDateForJobs = yesterday in yyyy-MM-dd
    const yesterday = baseFormat(addHours(fixedDate, -24), 'yyyy-MM-dd');

    expect(mockRecipientService.getRecipients).toHaveBeenCalled();
    // Should add two jobs
    expect(mockQueue.add).toHaveBeenCalledTimes(2);

    // Verify correct jobId and payload for first user
    expect(mockQueue.add).toHaveBeenCalledWith(
      `report-generation:user1:${yesterday}`,
      { recipientId: 'user1', reportDate: yesterday },
      expect.objectContaining({
        jobId: `report-generation:user1:${yesterday}`,
      }),
    );
  });

  it('skips scheduling if job already exists', async () => {
    // Mock existing job
    const existingJob = {
      getState: jest.fn().mockResolvedValue('completed'),
    } as any;
    (mockQueue.getJob as jest.Mock).mockResolvedValue(existingJob);

    await service.scheduleDailyReports();

    // Should fetch recipients
    expect(mockRecipientService.getRecipients).toHaveBeenCalled();
    // No new jobs should be added
    expect(mockQueue.add).not.toHaveBeenCalled();
  });
});
