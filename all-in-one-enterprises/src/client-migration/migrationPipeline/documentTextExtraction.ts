/** Read text from uploaded bytes — PDF text layer + self-hosted OCR for scans/images. */

import { extractPdfTextWithOcrFallback, ocrImageBytes } from './ocrTextExtraction';

export async function extractTextFromDocumentBytes(
  mimeType: string,
  bytes: Uint8Array,
): Promise<{ text: string; usedOcr: boolean }> {
  if (mimeType === 'application/pdf' || mimeType.endsWith('/pdf')) {
    return extractPdfTextWithOcrFallback(bytes);
  }
  if (/^image\/(jpeg|jpg|png|webp)$/i.test(mimeType)) {
    const { text, confidence } = await ocrImageBytes(bytes, mimeType);
    if (confidence < 25 && text.length < 12) return { text: '', usedOcr: true };
    return { text, usedOcr: true };
  }
  return { text: '', usedOcr: false };
}

export { extractTextFromPdfBytes } from './pdfTextExtract';

export function fileToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

export async function readFileAsBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  return fileToBase64(new Uint8Array(buf));
}

export function decodeBase64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}
