import { afterAll, describe, expect, it } from 'vitest';
import { terminateOcrWorker } from './ocrTextExtraction';
import { jsPDF } from 'jspdf';
import { extractPdfTextWithServerOcr } from './serverPdfOcr';
import { fileToBase64 } from './documentTextExtraction';
import { contentExtractionAdapter } from './contentExtractionAdapter';

describe.sequential('server PDF OCR path', () => {
  afterAll(async () => {
    await terminateOcrWorker();
  });
  it('reads text-layer PDFs without requiring a browser canvas', async () => {
    const doc = new jsPDF();
    doc.text('LEGAL BUSINESS NAME: NORTHLINE HAULING LLC', 10, 20);
    doc.text('USDOT: 4829103', 10, 30);
    const bytes = new Uint8Array(doc.output('arraybuffer'));
    const { text, usedOcr } = await extractPdfTextWithServerOcr(bytes);
    expect(text).toContain('NORTHLINE HAULING LLC');
    expect(usedOcr).toBe(false);
  });

  it('extracts identifiers through the shared adapter on Node', async () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('LEGAL BUSINESS NAME: NORTHLINE HAULING LLC', 10, 20);
    doc.text('MC: 1189024', 10, 30);
    const bytes = new Uint8Array(doc.output('arraybuffer'));
    const result = await contentExtractionAdapter.processFile(
      {
        fileName: 'authority.pdf',
        mimeType: 'application/pdf',
        sizeBytes: bytes.length,
        sha256: 'hash',
        fileContentBase64: fileToBase64(bytes),
      },
      { organizationId: 'org-1', batchId: 'batch-1' },
    );
    expect(result.proposedFacts.find((f) => f.fieldKey === 'mc_number')?.proposedValue).toBe('1189024');
  });
});
