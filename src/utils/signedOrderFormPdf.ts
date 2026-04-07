import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { StoredSignedOrderForm } from './signedOrderFormsStorage';
import { MOCK_APPROVAL_SIGNED_FORM_ID } from './mockSignedOrderFormForApproval';
import { buildSignedOrderFormSnapshotElement } from './signedOrderFormPdfSnapshotDom';

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
    return rasterizeSnapshotToSinglePdfPage(canvas);
  } finally {
    el.remove();
  }
}
