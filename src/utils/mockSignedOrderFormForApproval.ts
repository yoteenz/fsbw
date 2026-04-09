import type { StoredSignedOrderForm } from './signedOrderFormsStorage';
import { appendSignedOrderForm } from './signedOrderFormsStorage';

const SIGNED_FORMS_STORAGE_KEY = 'signedOrderFormsByEmail';
const REGISTERED_USERS_KEY = 'registeredUsers';

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
 * Its PDF uses a **plain white** snapshot: same field stack/positions as `/shop/order-form`, without marble, card chrome,
 * intro paragraphs, submit, or “CLEAR SIGNATURE”. Real stored forms still use the full-page snapshot.
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
      adminApproved: true,
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
    adminApproved: true,
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

/** v1 was a boolean flag; v2+ uses version string so we can re-seed with orders + pre-approved twin. */
const PENDING_TEST_FORMS_SEEDED_KEY = 'adminPendingTestOrderFormsSeeded_v1';
const PENDING_TEST_FORMS_SEED_VERSION_KEY = 'adminPendingTestOrderFormsSeedVersion_v1';

const PENDING_TEST_FORM_IDS = [
  'pending-test-form-alpha',
  'pending-test-form-beta',
  'pending-test-form-beta-approved-twin',
] as const;

function normalizeEmailKey(email: string): string {
  return (email || '').trim().toLowerCase();
}

function removeSignedFormsByIds(ids: string[]): void {
  if (typeof window === 'undefined' || ids.length === 0) return;
  const idSet = new Set(ids);
  try {
    const raw = localStorage.getItem(SIGNED_FORMS_STORAGE_KEY);
    if (!raw) return;
    const all = JSON.parse(raw) as Record<string, StoredSignedOrderForm[]>;
    if (!all || typeof all !== 'object') return;
    let changed = false;
    for (const emailKey of Object.keys(all)) {
      const list = all[emailKey];
      if (!Array.isArray(list)) continue;
      const next = list.filter((e) => e && typeof e === 'object' && !idSet.has(String((e as StoredSignedOrderForm).id || '')));
      if (next.length !== list.length) {
        all[emailKey] = next;
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(SIGNED_FORMS_STORAGE_KEY, JSON.stringify(all));
    }
  } catch {
    /* ignore */
  }
}

function upsertRegisteredUserStub(entry: {
  email: string;
  firstName: string;
  lastName: string;
}): void {
  const em = normalizeEmailKey(entry.email);
  if (!em) return;
  try {
    let reg = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]') as unknown;
    if (!Array.isArray(reg)) reg = [];
    const arr = reg as Record<string, unknown>[];
    const idx = arr.findIndex((u) => normalizeEmailKey(String(u?.email || '')) === em);
    const stub = {
      email: entry.email,
      firstName: entry.firstName,
      lastName: entry.lastName,
      membershipType: 'STANDARD',
      createdAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...stub };
    } else {
      arr.push(stub);
    }
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

function writeUserOrdersForEmail(
  email: string,
  orders: Array<{
    id: string;
    orderNumber: string;
    productName: string;
    total: number;
    lineItems?: Array<{ productName: string; subtotal: number }>;
  }>
): void {
  const em = normalizeEmailKey(email);
  if (!em || orders.length === 0) return;
  try {
    const key = `userOrders_${em}`;
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : { activeOrders: [], pastOrders: [] };
    const active = Array.isArray(data.activeOrders) ? [...data.activeOrders] : [];
    const past = Array.isArray(data.pastOrders) ? [...data.pastOrders] : [];
    const byId = new Set<string>();
    for (const o of [...active, ...past]) {
      const id = String((o as { id?: string }).id || '');
      if (id) byId.add(id);
    }
    for (const o of orders) {
      if (!o.id || byId.has(o.id)) continue;
      const row = {
        id: o.id,
        orderNumber: o.orderNumber,
        productName: o.productName,
        total: o.total,
        ...(o.lineItems && o.lineItems.length > 0 ? { lineItems: o.lineItems } : {}),
        status: 'PROCESSING',
        orderFormSigned: true,
        orderFormAdminApproved: true,
      };
      active.unshift(row);
      byId.add(o.id);
    }
    localStorage.setItem(key, JSON.stringify({ ...data, activeOrders: active, pastOrders: past }));
  } catch {
    /* ignore */
  }
}

function buildTestPendingSignedForm(opts: {
  id: string;
  email: string;
  orderId?: string;
  orderNumber: string;
  orderDate: string;
  firstName: string;
  lastName: string;
  signedAt: number;
}): StoredSignedOrderForm {
  const photoIdDataUrl = typeof document !== 'undefined' ? mockPhotoIdDataUrl() : '';
  const cardLastFourDataUrl = typeof document !== 'undefined' ? mockCardLastFourDataUrl() : '';
  const signatureDataUrl = typeof document !== 'undefined' ? mockSignatureDataUrl() : '';
  return {
    id: opts.id,
    ...(opts.orderId ? { orderId: opts.orderId } : {}),
    orderNumber: opts.orderNumber,
    orderDate: opts.orderDate,
    signedAt: opts.signedAt,
    email: opts.email,
    summaryOnly: false,
    adminApproved: false,
    adminDeclined: false,
    formFields: {
      orderNumber: opts.orderNumber,
      orderDate: opts.orderDate,
      firstName: opts.firstName,
      lastName: opts.lastName,
      email: opts.email,
      phone: '(555) 010-0200',
      address: '200 Test Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      country: 'United States',
      billingAddress: '200 Test Ave',
      billingCity: 'Miami',
      billingState: 'FL',
      billingZip: '33101',
      billingCountry: 'United States',
      cardholderName: `${opts.firstName} ${opts.lastName}`,
      cardNumber: '•••• •••• •••• 4242',
      cardLastFour: '4242',
      cardType: 'Visa',
      expirationDate: '12/28',
    },
    ...(photoIdDataUrl ? { photoIdDataUrl } : {}),
    ...(cardLastFourDataUrl ? { cardLastFourDataUrl } : {}),
    ...(signatureDataUrl ? { signatureDataUrl } : {}),
  };
}

const PENDING_TEST_SEED_VERSION = '2';

/**
 * Append pending test order forms (+ matching `userOrders_*` rows) for Admin → Pending → FORMS.
 * Bumps seed version when mock data shape changes (v2: real order totals on gray line + pre-approved twin).
 */
export function seedPendingTestOrderFormsIfNeeded(): void {
  if (typeof window === 'undefined') return;
  try {
    const ver = localStorage.getItem(PENDING_TEST_FORMS_SEED_VERSION_KEY) || '';
    if (ver === PENDING_TEST_SEED_VERSION) return;

    removeSignedFormsByIds([...PENDING_TEST_FORM_IDS]);

    const alphaEmail = 'pending.forms.test.alpha@preview.local';
    const betaEmail = 'pending.forms.test.beta@preview.local';
    const alphaOrderId = 'pending-test-order-alpha';
    const betaOrderId = 'pending-test-order-beta';

    upsertRegisteredUserStub({ email: alphaEmail, firstName: 'Riley', lastName: 'Chen' });
    upsertRegisteredUserStub({ email: betaEmail, firstName: 'Morgan', lastName: 'Blake' });

    writeUserOrdersForEmail(alphaEmail, [
      {
        id: alphaOrderId,
        orderNumber: 'ORDER #TEST-ALPHA',
        productName: 'NOIR',
        total: 1240,
        lineItems: [{ productName: 'NOIR', subtotal: 1240 }],
      },
    ]);
    writeUserOrdersForEmail(betaEmail, [
      {
        id: betaOrderId,
        orderNumber: 'ORDER #TEST-BETA',
        productName: 'SOFT WAVE',
        total: 890,
        lineItems: [{ productName: 'SOFT WAVE', subtotal: 890 }],
      },
    ]);

    const now = Date.now();
    const alphaPending = buildTestPendingSignedForm({
      id: 'pending-test-form-alpha',
      email: alphaEmail,
      orderId: alphaOrderId,
      orderNumber: 'ORDER #TEST-ALPHA',
      orderDate: '04-08-2026',
      firstName: 'Riley',
      lastName: 'Chen',
      signedAt: now - 3600_000,
    });
    appendSignedOrderForm(alphaPending);

    const betaBase = buildTestPendingSignedForm({
      id: 'pending-test-form-beta',
      email: betaEmail,
      orderId: betaOrderId,
      orderNumber: 'ORDER #TEST-BETA',
      orderDate: '04-07-2026',
      firstName: 'Morgan',
      lastName: 'Blake',
      signedAt: now - 7200_000,
    });
    appendSignedOrderForm({
      ...betaBase,
      id: 'pending-test-form-beta-approved-twin',
      signedAt: now - 8000_000,
      adminApproved: true,
      adminApprovedAt: now - 7990_000,
    });
    appendSignedOrderForm({
      ...betaBase,
      id: 'pending-test-form-beta',
      signedAt: now - 7200_000,
    });

    localStorage.setItem(PENDING_TEST_FORMS_SEED_VERSION_KEY, PENDING_TEST_SEED_VERSION);
    localStorage.removeItem(PENDING_TEST_FORMS_SEEDED_KEY);
    try {
      window.dispatchEvent(new CustomEvent('pendingOrderAuthorizationFormsUpdated'));
      window.dispatchEvent(new CustomEvent('signedOrderFormsUpdated'));
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
}
