import { jsPDF } from 'jspdf';
import type { StoredSignedOrderForm } from './signedOrderFormsStorage';

const FIELD_ORDER = [
  'orderNumber',
  'orderDate',
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'zip',
  'country',
  'billingAddress',
  'billingCity',
  'billingState',
  'billingZip',
  'billingCountry',
  'cardholderName',
  'cardNumber',
  'cardLastFour',
  'cardType',
  'expirationDate',
] as const;

function fieldLabel(key: string): string {
  const map: Record<string, string> = {
    orderNumber: 'Order number',
    orderDate: 'Order date',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    address: 'Shipping address',
    city: 'City',
    state: 'State',
    zip: 'ZIP',
    country: 'Country',
    billingAddress: 'Billing address',
    billingCity: 'Billing city',
    billingState: 'Billing state',
    billingZip: 'Billing ZIP',
    billingCountry: 'Billing country',
    cardholderName: 'Cardholder',
    cardNumber: 'Card',
    cardLastFour: 'Card (last four file)',
    cardType: 'Card type',
    expirationDate: 'Expiration',
    status: 'Order status',
  };
  return map[key] || key;
}

function dataUrlImageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  const head = dataUrl.slice(0, 40).toLowerCase();
  if (head.includes('image/jpeg') || head.includes('image/jpg')) return 'JPEG';
  return 'PNG';
}

function ensureSpace(doc: jsPDF, y: number, need: number, pageH: number): number {
  if (y + need > pageH - 48) {
    doc.addPage();
    return 56;
  }
  return y;
}

/** Builds a printable PDF snapshot of a stored signed authorization form (fields + ID + signature images). */
export async function buildSignedOrderFormPdf(form: StoredSignedOrderForm): Promise<Blob> {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ORDER AUTHORIZATION FORM', margin, y);
  y += 28;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const signedStr = new Date(form.signedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(`Order: ${String(form.orderNumber || '—').trim()}`, margin, y);
  y += 16;
  doc.text(`Signed: ${signedStr}`, margin, y);
  y += 24;

  const fields = form.formFields || {};
  const keys = [
    ...FIELD_ORDER.filter((k) => fields[k] != null && String(fields[k]).trim() !== ''),
    ...Object.keys(fields).filter((k) => !FIELD_ORDER.includes(k as (typeof FIELD_ORDER)[number])),
  ];

  doc.setFontSize(9);
  for (const key of keys) {
    const val = String(fields[key] ?? '').trim();
    if (!val) continue;
    const label = fieldLabel(key);
    const lines = doc.splitTextToSize(`${label}: ${val}`, maxW);
    y = ensureSpace(doc, y, lines.length * 12 + 8, pageH);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, margin, y);
    y += lines.length * 12 + 6;
  }

  const addImageBlock = async (title: string, dataUrl: string | undefined, maxImgH: number) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) return;
    y = ensureSpace(doc, y, maxImgH + 40, pageH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, margin, y);
    y += 16;
    try {
      const fmt = dataUrlImageFormat(dataUrl);
      const imgFmt = fmt === 'JPEG' ? 'JPEG' : 'PNG';
      const props = doc.getImageProperties(dataUrl);
      const ratio = props.width / props.height;
      let w = maxW;
      let h = w / ratio;
      if (h > maxImgH) {
        h = maxImgH;
        w = h * ratio;
      }
      doc.addImage(dataUrl, imgFmt, margin, y, w, h);
      y += h + 20;
    } catch {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text('(Image could not be embedded)', margin, y);
      y += 20;
    }
  };

  await addImageBlock('PHOTO ID', form.photoIdDataUrl, 200);
  await addImageBlock('CARD (LAST FOUR UPLOAD)', form.cardLastFourDataUrl, 120);
  await addImageBlock('SIGNATURE', form.signatureDataUrl, 80);

  return doc.output('blob');
}
