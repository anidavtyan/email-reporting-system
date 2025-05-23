import type { PDFOptions } from 'puppeteer';

export const defaultPdfOptions: PDFOptions = {
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm',
  },
};
