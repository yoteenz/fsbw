import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { StoredSignedOrderForm } from './signedOrderFormsStorage';
import { MOCK_APPROVAL_SIGNED_FORM_ID } from './mockSignedOrderFormForApproval';
import { buildSignedOrderFormSnapshotElement } from './signedOrderFormPdfSnapshotDom';

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

  const isContentPixel = (i: number): boolean => {
    const a = d[i + 3];
    if (a < 12) return false;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    if (r >= 251 && g >= 251 && b >= 251) return false;
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
  if (cw < w * 0.25 && ch < h * 0.12) return source;

  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d');
  if (!octx) return source;
  octx.drawImage(source, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

/** Single letter page: scale snapshot to fit (uniform), centered in printable area. */
function rasterizeSnapshotToSinglePdfPage(canvas: HTMLCanvasElement): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pdfW = doc.internal.pageSize.getWidth();
  const pdfH = doc.internal.pageSize.getHeight();
  const margin = 36;
  const maxW = pdfW - margin * 2;
  const maxH = pdfH - margin * 2;
  const imgW = canvas.width;
  const imgH = canvas.height;
  const scale = Math.min(maxW / imgW, maxH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const x = margin + (maxW - drawW) / 2;
  const y = margin + (maxH - drawH) / 2;
  doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, drawW, drawH);
  return doc.output('blob');
}

/**
 * Printable PDF: visual snapshot of the live `/shop/order-form` layout (same typography, borders, copy).
 */
export async function buildSignedOrderFormPdf(form: StoredSignedOrderForm): Promise<Blob> {
  const el = buildSignedOrderFormSnapshotElement(form);
  el.style.position = 'fixed';
  el.style.left = '-12000px';
  el.style.top = '0';
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);

  try {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: form.id === MOCK_APPROVAL_SIGNED_FORM_ID ? '#ffffff' : null,
    });
    return rasterizeSnapshotToSinglePdfPage(trimCanvasToContentBounds(canvas));
  } finally {
    el.remove();
  }
}
