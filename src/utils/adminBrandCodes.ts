export type BrandPromoCode = {
  id: string;
  kind: 'gift' | 'discount';
  code: string;
  valueLabel: string;
  maxUses: number | null;
  uses: number;
  /** End date: prefer MM-DD-YYYY (admin); legacy rows may use YYYY-MM-DD. */
  expiresAt: string | null;
  /**
   * Calendar days from creation date (local start-of-day) to expiry date (local start-of-day).
   * Used on reactivate to set a new expiry: reactivation day + this span.
   */
  expiresSpanCalendarDays?: number | null;
  createdAt: string;
  active: boolean;
  note?: string;
};

const STORAGE_KEY = 'adminBrandPromoCodes';

export function loadBrandPromoCodes(): BrandPromoCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BrandPromoCode[]) : [];
  } catch {
    return [];
  }
}

export function saveBrandPromoCodes(rows: BrandPromoCode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export function appendBrandPromoCode(row: BrandPromoCode): void {
  const list = loadBrandPromoCodes();
  list.push(row);
  saveBrandPromoCodes(list);
}

export function updateBrandPromoCode(id: string, patch: Partial<BrandPromoCode>): void {
  const list = loadBrandPromoCodes();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return;
  list[idx] = { ...list[idx], ...patch };
  saveBrandPromoCodes(list);
}

const BARCODE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Gift card barcodes: XXXX-XXXX-XXXX (mixed alnum), e.g. 4C44-D4L4-K444 */
export function generateGiftBarcode(): string {
  const segment = () => {
    let s = '';
    for (let i = 0; i < 4; i++) {
      s += BARCODE_CHARS[Math.floor(Math.random() * BARCODE_CHARS.length)];
    }
    return s;
  };
  return `${segment()}-${segment()}-${segment()}`;
}

export function normalizePromoCode(code: string): string {
  return code.toUpperCase().replace(/\s+/g, '').replace(/−/g, '-');
}

/** Dollar amount from valueLabel like "$50" or "50.00". */
export function parseGiftCardDollars(valueLabel: string): number | null {
  const n = parseFloat(String(valueLabel).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function findGiftPromoByNormalizedCode(normalized: string): BrandPromoCode | undefined {
  const n = normalizePromoCode(normalized);
  return loadBrandPromoCodes().find((c) => c.kind === 'gift' && normalizePromoCode(c.code) === n);
}

export function findDiscountPromoByNormalizedCode(normalized: string): BrandPromoCode | undefined {
  const n = normalizePromoCode(normalized);
  return loadBrandPromoCodes().find((c) => c.kind === 'discount' && normalizePromoCode(c.code) === n);
}

/** Percent off from admin valueLabel e.g. "15%" or "15". */
export function parseDiscountPercent(valueLabel: string): number | null {
  const s = String(valueLabel).trim();
  const m = /(\d+(?:\.\d+)?)\s*%/.exec(s) ?? /^(\d+(?:\.\d+)?)\s*$/.exec(s);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n) || n <= 0 || n > 100) return null;
  return n;
}

/** Blocker message if this admin discount code cannot be used at checkout. */
export function discountPromoCheckoutBlockReason(c: BrandPromoCode): string | null {
  if (c.kind !== 'discount') return 'NOT A DISCOUNT CODE';
  if (!c.active) return 'CODE INACTIVE';
  if (c.expiresAt) {
    const exp = parseExpiresAtToEndOfDayLocal(c.expiresAt);
    if (!exp || new Date() > exp) return 'CODE EXPIRED';
  }
  if (c.maxUses != null && c.uses >= c.maxUses) return 'CODE NO LONGER VALID';
  return null;
}

const BRAND_DISCOUNT_LEDGER_KEY = 'adminBrandGeneratedDiscountOrders';

export type BrandGeneratedDiscountOrderEvent = {
  orderId: string;
  promoId: string;
  code: string;
  discountUsd: number;
  confirmedAt: string;
};

export function recordBrandGeneratedDiscountOrderEvent(event: BrandGeneratedDiscountOrderEvent): void {
  try {
    const raw = localStorage.getItem(BRAND_DISCOUNT_LEDGER_KEY);
    const list: BrandGeneratedDiscountOrderEvent[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return;
    list.push(event);
    localStorage.setItem(BRAND_DISCOUNT_LEDGER_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent('brandDiscountLedgerUpdated'));
  } catch {
    /* ignore */
  }
}

/** Sum of discount USD recorded on confirmed checkouts using admin-generated discount codes. */
export function sumBrandGeneratedDiscountUsd(): number {
  try {
    const raw = localStorage.getItem(BRAND_DISCOUNT_LEDGER_KEY);
    const list: BrandGeneratedDiscountOrderEvent[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return 0;
    return list.reduce((sum, e) => sum + (Number.isFinite(e.discountUsd) ? e.discountUsd : 0), 0);
  } catch {
    return 0;
  }
}

/**
 * Parse promo expiry: MM-DD-YYYY (stored format) or legacy YYYY-MM-DD.
 * End of that calendar day, local time.
 */
export function parseExpiresAtToEndOfDayLocal(expiresAt: string): Date | null {
  const t = expiresAt.trim();
  if (!t) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const d = new Date(`${t}T23:59:59`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(t);
  if (m) {
    const month = parseInt(m[1], 10);
    const day = parseInt(m[2], 10);
    const year = parseInt(m[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) return null;
    const d = new Date(year, month - 1, day, 23, 59, 59, 999);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
    return d;
  }

  return null;
}

/** Display as MM-DD-YYYY (zero-padded). */
export function formatExpiresAtForDisplay(expiresAt: string): string {
  const d = parseExpiresAtToEndOfDayLocal(expiresAt);
  if (!d) return expiresAt.trim();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

/** Convert `<input type="date">` value (YYYY-MM-DD) to stored MM-DD-YYYY. */
export function expiresAtFromDateInput(isoYmd: string): string {
  const t = isoYmd.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const [y, mo, d] = t.split('-');
  return `${mo}-${d}-${y}`;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Store as MM-DD-YYYY from a local calendar date. */
export function formatLocalDateAsExpiresAtStorage(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

/**
 * Calendar-day span from creation (local start-of-day) to expiry (local start-of-day).
 * E.g. created Mar 1, expires Mar 3 → 2.
 */
export function computeExpiresSpanCalendarDays(createdAtIso: string, expiresAt: string | null): number | null {
  if (!expiresAt?.trim()) return null;
  const created = new Date(createdAtIso);
  if (Number.isNaN(created.getTime())) return null;
  const createdStart = startOfLocalDay(created);
  const expEnd = parseExpiresAtToEndOfDayLocal(expiresAt);
  if (!expEnd) return null;
  const expStart = startOfLocalDay(expEnd);
  const span = Math.round((expStart.getTime() - createdStart.getTime()) / 86400000);
  return Math.max(0, span);
}

/**
 * When turning a code active again, new expiry = start of "today" (local) + original span.
 * Persists / fills `expiresSpanCalendarDays` for legacy rows missing it.
 */
export function computeReactivationExpiryPatch(
  c: BrandPromoCode
): { expiresAt: string; expiresSpanCalendarDays: number } | null {
  if (!c.expiresAt?.trim()) return null;
  const created = new Date(c.createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const createdStart = startOfLocalDay(created);

  let span =
    c.expiresSpanCalendarDays != null && Number.isFinite(c.expiresSpanCalendarDays)
      ? c.expiresSpanCalendarDays
      : null;
  if (span == null) {
    const expEnd = parseExpiresAtToEndOfDayLocal(c.expiresAt);
    if (!expEnd) return null;
    const expStart = startOfLocalDay(expEnd);
    span = Math.round((expStart.getTime() - createdStart.getTime()) / 86400000);
  }
  span = Math.max(0, span);

  const todayStart = startOfLocalDay(new Date());
  const newExpiryDate = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + span);
  return {
    expiresAt: formatLocalDateAsExpiresAtStorage(newExpiryDate),
    expiresSpanCalendarDays: span,
  };
}

/** If non-null, user-facing reason redemption is blocked. */
export function giftPromoRedeemBlockReason(c: BrandPromoCode): string | null {
  if (c.kind !== 'gift') return 'NOT A GIFT CARD';
  if (!c.active) return 'CODE INACTIVE';
  if (c.expiresAt) {
    const exp = parseExpiresAtToEndOfDayLocal(c.expiresAt);
    if (!exp || new Date() > exp) return 'CODE EXPIRED';
  }
  if (c.maxUses != null && c.uses >= c.maxUses) return 'CODE FULLY REDEEMED';
  return null;
}

export function generateCodePrefix(kind: BrandPromoCode['kind']): string {
  if (kind === 'gift') return generateGiftBarcode();
  const part = 'OFF';
  const n = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${part}-${n}`;
}
