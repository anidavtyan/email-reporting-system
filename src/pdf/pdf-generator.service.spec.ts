import { Test, TestingModule } from '@nestjs/testing';
import { PdfGeneratorService } from './pdf-generator.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { DomainVolumeUsageDto } from '../common/dtos/volume-usage.dto';
import puppeteer from 'puppeteer';

jest.setTimeout(10000);

describe('PdfGeneratorService (Real Puppeteer)', () => {
  let service: PdfGeneratorService;

  const mockUsageData: DomainVolumeUsageDto[] = [
    {
      domainId: 'dom-1',
      domainName: 'example.com',
      emailVolume: 1000,
      spfPassRatio: 99.5,
      dmarcPassRatio: 98.1,
    },
  ];

  const mockRecipientId = 'rec-123';
  const mockRecipientEmail = 'test@example.com';
  const mockReportDate = new Date('2023-01-15T00:00:00.000Z');
  const mockReportDateString = '2023-01-15';
  const outputPath = path.join(process.cwd(), 'test-output');

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfGeneratorService,
        {
          provide: 'PUPPETEER',
          useValue: puppeteer,
        },
      ],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);
    await service.onModuleInit(); // Loads template
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if template is not loaded', async () => {
    // Simulate template missing
    (service as any).htmlTemplate = undefined;

    await expect(
      service.generateReport(
        mockRecipientId,
        mockRecipientEmail,
        mockUsageData,
        mockReportDate,
      ),
    ).rejects.toThrow(
      'PDF template not loaded. Service not initialized correctly.',
    );
  });

  it('should generate a real PDF buffer and save it to disk', async () => {
    await service.onModuleInit();

    const result = await service.generateReport(
      mockRecipientId,
      mockRecipientEmail,
      mockUsageData,
      mockReportDate,
    );

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(500); // Shouldn't be an empty buffer

    const filePath = path.join(
      outputPath,
      `${mockRecipientId}-${mockReportDateString}.pdf`,
    );
    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(filePath, result);

    console.log(`PDF written to ${filePath}`);
  });


});
