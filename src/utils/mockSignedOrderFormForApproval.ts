import type { StoredSignedOrderForm } from './signedOrderFormsStorage';

export const MOCK_APPROVAL_SIGNED_FORM_ID = 'mock-approval-signed-form-v1';

let cachedMock: StoredSignedOrderForm | null = null;

function canvasToPngDataUrl(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): string {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  draw(ctx);
  try {
    return c.toDataURL('image/png');
  } catch {
    return '';
  }
}

function mockPhotoIdDataUrl(): string {
  return canvasToPngDataUrl(340, 220, (ctx) => {
    ctx.fillStyle = '#dfe6ee';
    ctx.fillRect(0, 0, 340, 220);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 332, 212);
    ctx.fillStyle = '#c5d4e8';
    ctx.fillRect(16, 16, 100, 120);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('MOCK PHOTO', 22, 78);
    ctx.fillStyle = '#000';
    ctx.font = '10px sans-serif';
    ctx.fillText('STATE SAMPLE — NOT A REAL ID', 130, 28);
    ctx.fillText('NAME: ALEX SAMPLE', 130, 52);
    ctx.fillText('DOB: 01/15/1990', 130, 72);
    ctx.fillText('ID #: MOCK-88421', 130, 92);
    ctx.fillText('EXP: 04/2030', 130, 112);
    ctx.fillStyle = '#EB1C24';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('FOR APPROVAL PREVIEW ONLY', 130, 200);
  });
}

function mockCardLastFourDataUrl(): string {
  return canvasToPngDataUrl(320, 200, (ctx) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 320, 200);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, 8, 304, 184);
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '12px monospace';
    ctx.fillText('MOCK CARD IMAGE', 20, 40);
    ctx.font = '14px monospace';
    ctx.fillText('•••• •••• •••• 4242', 20, 80);
    ctx.font = '10px sans-serif';
    ctx.fillText('CARDHOLDER: ALEX SAMPLE', 20, 110);
    ctx.fillText('MATCHES ORDER AUTHORIZATION', 20, 132);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('NOT A REAL PAYMENT CARD', 20, 170);
  });
}

function mockSignatureDataUrl(): string {
  return canvasToPngDataUrl(280, 100, (ctx) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 280, 100);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(2, 2, 276, 96);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(24, 62);
    ctx.bezierCurveTo(60, 22, 120, 78, 180, 48);
    ctx.bezierCurveTo(210, 34, 240, 40, 256, 52);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif';
    ctx.fillText('MOCK SIGNATURE', 18, 88);
  });
}

/**
 * Sample signed form for admin PDF approval: mock ID / card / signature images + fields.
 * The generated PDF is a **visual snapshot** of the order authorization page layout (see `signedOrderFormPdfSnapshotDom`).
 * Prepended to admin “signed forms” list only; not persisted to localStorage.
 */
export function getMockSignedOrderFormForApproval(): StoredSignedOrderForm {
  if (cachedMock) return cachedMock;
  if (typeof document === 'undefined') {
    cachedMock = {
      id: MOCK_APPROVAL_SIGNED_FORM_ID,
      orderNumber: 'ORDER #MOCK-APPROVAL',
      orderDate: '04-06-2026',
      signedAt: Date.UTC(2099, 0, 15, 16, 30, 0),
      email: 'mock-approval@preview.local',
      summaryOnly: false,
      formFields: {
        orderNumber: 'ORDER #MOCK-APPROVAL',
        orderDate: '04-06-2026',
        firstName: 'Alex',
        lastName: 'Sample',
        email: 'alex.sample@email.test',
        phone: '(555) 010-0199',
        address: '123 Preview Lane, Suite 4',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'United States',
        billingAddress: '123 Preview Lane, Suite 4',
        billingCity: 'Los Angeles',
        billingState: 'CA',
        billingZip: '90001',
        billingCountry: 'United States',
        cardholderName: 'Alex Sample',
        cardNumber: '•••• •••• •••• 4242',
        cardLastFour: '4242',
        cardType: 'Visa',
        expirationDate: '08/29',
      },
    };
    return cachedMock;
  }

  cachedMock = {
    id: MOCK_APPROVAL_SIGNED_FORM_ID,
    orderNumber: 'ORDER #MOCK-APPROVAL',
    orderDate: '04-06-2026',
    signedAt: Date.UTC(2099, 0, 15, 16, 30, 0),
    email: 'mock-approval@preview.local',
    summaryOnly: false,
    formFields: {
      orderNumber: 'ORDER #MOCK-APPROVAL',
      orderDate: '04-06-2026',
      firstName: 'Alex',
      lastName: 'Sample',
      email: 'alex.sample@email.test',
      phone: '(555) 010-0199',
      address: '123 Preview Lane, Suite 4',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'United States',
      billingAddress: '123 Preview Lane, Suite 4',
      billingCity: 'Los Angeles',
      billingState: 'CA',
      billingZip: '90001',
      billingCountry: 'United States',
      cardholderName: 'Alex Sample',
      cardNumber: '•••• •••• •••• 4242',
      cardLastFour: '4242',
      cardType: 'Visa',
      expirationDate: '08/29',
    },
    photoIdDataUrl: mockPhotoIdDataUrl(),
    cardLastFourDataUrl: mockCardLastFourDataUrl(),
    signatureDataUrl: mockSignatureDataUrl(),
  };
  return cachedMock;
}

export function mergeSignedFormsWithMockApproval(list: StoredSignedOrderForm[]): StoredSignedOrderForm[] {
  if (list.some((f) => f.id === MOCK_APPROVAL_SIGNED_FORM_ID)) return list;
  return [getMockSignedOrderFormForApproval(), ...list];
}
