import { Module } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  providers: [
    PdfGeneratorService,
    {
      provide: 'PUPPETEER',
      useValue: puppeteer, // Provide the puppeteer library itself
    },
  ],
  exports: [PdfGeneratorService, 'PUPPETEER'],
})
export class PdfModule {}
