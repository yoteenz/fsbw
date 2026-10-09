import { describe, expect, it } from 'vitest';
import { jsPDF } from 'jspdf';
import { contentExtractionAdapter } from './contentExtractionAdapter';
import { fileToBase64 } from './documentTextExtraction';

describe('content extraction adapter', () => {
  it('extracts NORTHLINE HAULING LLC from a real PDF text layer', async () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('LEGAL BUSINESS NAME: NORTHLINE HAULING LLC', 10, 20);
    doc.text('USDOT: 4829103', 10, 30);
    doc.text('MC: 1189024', 10, 40);
    doc.text('EIN: 84-2910456', 10, 50);
    const bytes = new Uint8Array(doc.output('arraybuffer'));
    const fileContentBase64 = fileToBase64(bytes);

    const result = await contentExtractionAdapter.processFile(
      {
        fileName: 'northline-formation.pdf',
        mimeType: 'application/pdf',
        sizeBytes: bytes.length,
        sha256: 'test-hash',
        documentId: 'doc-northline-1',
        fileContentBase64,
      },
      { organizationId: 'org-northline', batchId: 'batch-northline' },
    );

    expect(result.exception).toBeUndefined();
    expect(result.proposedFacts.length).toBeGreaterThanOrEqual(3);
    const legal = result.proposedFacts.find((f) => f.fieldKey === 'legal_name');
    expect(legal?.proposedValue).toContain('NORTHLINE HAULING LLC');
    expect(legal?.sourceReference).toContain('doc-northline-1');
    expect(result.proposedFacts.find((f) => f.fieldKey === 'usdot')?.proposedValue).toBe('4829103');
  });

  it('does not invent values from filename alone', async () => {
    const doc = new jsPDF();
    doc.text('Blank cover sheet.', 10, 20);
    const bytes = new Uint8Array(doc.output('arraybuffer'));
    const result = await contentExtractionAdapter.processFile(
      {
        fileName: 'coi-insurance-certificate.pdf',
        mimeType: 'application/pdf',
        sizeBytes: bytes.length,
        sha256: 'x',
        fileContentBase64: fileToBase64(bytes),
      },
      { organizationId: 'c1', batchId: 'b1' },
    );
    expect(result.exception).toBe('EXTRACTION_FAILED');
    expect(result.proposedFacts).toHaveLength(0);
  });
});
