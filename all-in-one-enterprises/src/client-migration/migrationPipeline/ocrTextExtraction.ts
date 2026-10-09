/** Self-hosted OCR (Tesseract.js) — no third-party document API. */

let workerPromise: Promise<import('tesseract.js').Worker> | null = null;

async function getWorker(): Promise<import('tesseract.js').Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, {
        logger: () => {},
      });
      return worker;
    })();
  }
  return workerPromise;
}

export async function ocrImageBytes(bytes: Uint8Array, mimeType: string): Promise<{ text: string; confidence: number }> {
  try {
    const worker = await getWorker();
    const input =
      typeof Blob !== 'undefined'
        ? new Blob([bytes], { type: mimeType || 'image/png' })
        : Buffer.from(bytes);
    const {
      data: { text, confidence },
    } = await worker.recognize(input);
    return { text: text.trim(), confidence: confidence ?? 0 };
  } catch {
    return { text: '', confidence: 0 };
  }
}

const MIN_PDF_TEXT_CHARS = 48;

/** OCR PDF pages when the text layer is empty or too thin (scanned PDFs). Browser only. */
export async function extractPdfTextWithOcrFallback(bytes: Uint8Array): Promise<{ text: string; usedOcr: boolean }> {
  const { extractTextFromPdfBytes } = await import('./pdfTextExtract');
  const native = await extractTextFromPdfBytes(bytes);
  if (native.replace(/\s+/g, ' ').trim().length >= MIN_PDF_TEXT_CHARS) {
    return { text: native, usedOcr: false };
  }
  if (typeof document === 'undefined') {
    const { extractPdfTextWithServerOcr } = await import('./serverPdfOcr');
    return extractPdfTextWithServerOcr(bytes);
  }

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdf = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;
  const ocrParts: string[] = [];
  let totalConfidence = 0;
  let pages = 0;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const pngBytes = await renderPageToPng(page, viewport);
    const { text, confidence } = await ocrImageBytes(pngBytes, 'image/png');
    if (text) ocrParts.push(text);
    totalConfidence += confidence;
    pages += 1;
  }

  const merged = [native, ...ocrParts].filter(Boolean).join('\n').trim();
  if (!merged) return { text: '', usedOcr: true };
  const avgConf = pages ? totalConfidence / pages : 0;
  if (avgConf < 35 && merged.length < MIN_PDF_TEXT_CHARS) return { text: '', usedOcr: true };
  return { text: merged, usedOcr: true };
}

async function renderPageToPng(
  page: import('pdfjs-dist/types/src/display/api').PDFPageProxy,
  viewport: ReturnType<import('pdfjs-dist/types/src/display/api').PDFPageProxy['getViewport']>,
): Promise<Uint8Array> {
  const width = Math.floor(viewport.width);
  const height = Math.floor(viewport.height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  await page.render({ canvasContext: ctx, viewport }).promise;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png');
  });
  return new Uint8Array(await blob.arrayBuffer());
}

export async function terminateOcrWorker(): Promise<void> {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
