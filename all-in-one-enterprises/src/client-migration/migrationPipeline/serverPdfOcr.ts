/** Node-only PDF page rasterization for server OCR (pdf.js + @napi-rs/canvas). */

const MAX_OCR_PAGES = 8;
const OCR_SCALE = 2;

export async function extractPdfTextWithServerOcr(bytes: Uint8Array): Promise<{ text: string; usedOcr: boolean }> {
  const { extractTextFromPdfBytes } = await import('./pdfTextExtract');
  const native = await extractTextFromPdfBytes(bytes);
  const nativeLen = native.replace(/\s+/g, ' ').trim().length;
  if (nativeLen >= 48) {
    return { text: native, usedOcr: false };
  }

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');
  const { ocrImageBytes } = await import('./ocrTextExtraction');

  const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise;
  const pageLimit = Math.min(pdf.numPages, MAX_OCR_PAGES);
  const ocrParts: string[] = [];
  let totalConfidence = 0;
  let pages = 0;

  for (let pageNum = 1; pageNum <= pageLimit; pageNum += 1) {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: OCR_SCALE });
      const width = Math.floor(viewport.width);
      const height = Math.floor(viewport.height);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) break;
      await page.render({
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;
      const pngBytes = new Uint8Array(canvas.toBuffer('image/png'));
      const { text, confidence } = await ocrImageBytes(pngBytes, 'image/png');
      if (text) ocrParts.push(text);
      totalConfidence += confidence;
      pages += 1;
    } catch {
      continue;
    }
  }

  const merged = [native, ...ocrParts].filter(Boolean).join('\n').trim();
  if (!merged) return { text: '', usedOcr: true };
  const avgConf = pages ? totalConfidence / pages : 0;
  if (avgConf < 35 && merged.length < 48) return { text: '', usedOcr: true };
  return { text: merged, usedOcr: true };
}
