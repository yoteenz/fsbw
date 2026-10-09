import { describe, expect, it } from 'vitest';
import { extractFactsFromDocumentText } from './fieldExtractionFromText';

/** OCR engine smoke test runs in browser/manual QA — tesseract wasm is flaky in headless Node CI. */
describe('OCR post-processing (simulated noisy scan text)', () => {
  it('extracts identity from text that mimics OCR output from a photographed certificate', () => {
    const noisy = [
      'LEGAL BUSINESS NAME: NORTHLINE HAULING LLC',
      'USDOT: 4829103',
      'MC: 1189024',
      'POLICY NUMBER: CA-8829100',
    ].join('\n');
    const facts = extractFactsFromDocumentText(noisy, 'photo-insurance.jpg#ocr');
    expect(facts.find((f) => f.fieldKey === 'legal_name')?.proposedValue).toContain('NORTHLINE');
    expect(facts.find((f) => f.fieldKey === 'usdot')?.proposedValue).toBe('4829103');
    expect(facts.find((f) => f.fieldKey === 'policy_number')?.proposedValue).toBeTruthy();
  });
});
