import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { StoredSignedOrderForm } from './signedOrderFormsStorage';
import { MOCK_APPROVAL_SIGNED_FORM_ID } from './mockSignedOrderFormForApproval';
import { buildSignedOrderFormSnapshotElement } from './signedOrderFormPdfSnapshotDom';

function rasterizeSnapshotToPdfPages(canvas: HTMLCanvasElement): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pdfW = doc.internal.pageSize.getWidth();
  const pdfH = doc.internal.pageSize.getHeight();
  const margin = 36;
  const maxW = pdfW - margin * 2;
  const maxH = pdfH - margin * 2;
  const imgW = canvas.width;
  const imgH = canvas.height;
  const scale = maxW / imgW;
  const totalH = imgH * scale;
  let yPdf = 0;
  let first = true;
  while (yPdf < totalH - 0.5) {
    if (!first) doc.addPage();
    first = false;
    const hThis = Math.min(maxH, totalH - yPdf);
    const yPx = yPdf / scale;
    const hPx = hThis / scale;
    const part = document.createElement('canvas');
    part.width = imgW;
    part.height = Math.max(1, Math.ceil(hPx));
    const ctx = part.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, yPx, imgW, hPx, 0, 0, imgW, hPx);
    }
    doc.addImage(part.toDataURL('image/png'), 'PNG', margin, margin, maxW, hThis);
    yPdf += hThis;
  }
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
    return rasterizeSnapshotToPdfPages(canvas);
  } finally {
    el.remove();
  }
}
