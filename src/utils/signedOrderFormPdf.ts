import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { StoredSignedOrderForm } from './signedOrderFormsStorage';
import { buildSignedOrderFormSnapshotElement } from './signedOrderFormPdfSnapshotDom';

/**
 * Marble / glass card backgrounds paint non-white pixels across the full snapshot width, so
 * {@link trimCanvasToContentBounds} would see “content” everywhere and not crop. Strip them
 * for capture only so trim + PDF centering target the form column.
 */
function stripDecorativeSnapshotBackgrounds(el: HTMLElement): void {
  if (el.dataset.pdfSnapshotRoot === '1') {
    el.style.backgroundImage = 'none';
    el.style.backgroundColor = '#ffffff';
    el.style.backgroundRepeat = 'no-repeat';
  }
  const card = el.querySelector<HTMLElement>('[data-pdf-snapshot-card="1"]');
  if (card) {
    card.style.backgroundColor = '#ffffff';
    card.style.setProperty('backdrop-filter', 'none');
    card.style.setProperty('-webkit-backdrop-filter', 'none');
  }
}

/**
 * Tighten the raster to real ink (forms, text, images). Pure-white / transparent
 * margins from the snapshot width often letterbox the PDF so FitH looks off-center
 * in the admin modal; cropping fixes horizontal (and vertical) centering on content.
 */
function trimCanvasToContentBounds(source: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = source.getContext('2d', { willReadFrequently: true });
  if (!ctx) return source;
  const w = source.width;
  const h = source.height;
  if (w < 4 || h < 4) return source;

  let img: ImageData;
  try {
    img = ctx.getImageData(0, 0, w, h);
  } catch {
    return source;
  }
  const d = img.data;

  /** Treat near-white (incl. anti-alias) as background so margins trim after marble strip. */
  const isContentPixel = (i: number): boolean => {
    const a = d[i + 3];
    if (a < 12) return false;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    if (r >= 252 && g >= 252 && b >= 252) return false;
    return true;
  };

  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      const i = row + x * 4;
      if (isContentPixel(i)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return source;

  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  if (cw < 8 || ch < 8) return source;

  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d');
  if (!octx) return source;
  octx.drawImage(source, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

/**
 * One PDF page sized to the snapshot: **scale to full printable width** (no horizontal letterboxing).
 * Tall forms extend page height instead of shrinking width to fit letter height (which caused side white bars).
 */
function rasterizeSnapshotToWidthFitPdfPage(canvas: HTMLCanvasElement): Blob {
  const margin = 36;
  /** Letter width so printed / desktop viewers stay standard; height grows with content. */
  const pageWPt = 612;
  const maxW = pageWPt - margin * 2;
  const imgW = canvas.width;
  const imgH = canvas.height;
  if (imgW < 1 || imgH < 1) {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    return doc.output('blob');
  }
  const scale = maxW / imgW;
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const pageHPt = drawH + margin * 2;
  const doc = new jsPDF({ unit: 'pt', format: [pageWPt, pageHPt] });
  doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, drawW, drawH);
  return doc.output('blob');
}

/**
 * Printable PDF: visual snapshot of the live `/shop/order-form` layout (same typography, borders, copy).
 */
export async function buildSignedOrderFormPdf(form: StoredSignedOrderForm): Promise<Blob> {
  const el = buildSignedOrderFormSnapshotElement(form, { pdfColumnOnly: true });
  el.style.position = 'fixed';
  el.style.left = '-12000px';
  el.style.top = '0';
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);

  try {
    stripDecorativeSnapshotBackgrounds(el);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    return rasterizeSnapshotToWidthFitPdfPage(trimCanvasToContentBounds(canvas));
  } finally {
    el.remove();
  }
}
