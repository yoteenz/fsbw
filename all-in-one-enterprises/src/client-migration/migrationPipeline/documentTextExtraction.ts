/** Read text from uploaded bytes (PDF text layer; images require OCR provider). */

export async function extractTextFromDocumentBytes(mimeType: string, bytes: Uint8Array): Promise<string> {
  if (mimeType === 'application/pdf' || mimeType.endsWith('/pdf')) {
    return extractTextFromPdfBytes(bytes);
  }
  if (/^image\/(jpeg|jpg|png|webp)$/i.test(mimeType)) {
    return '';
  }
  return '';
}

export async function extractTextFromPdfBytes(bytes: Uint8Array): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfjs.getDocument({ data: bytes, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const parts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
      .join(' ');
    parts.push(pageText);
  }
  return parts.join('\n').trim();
}

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
