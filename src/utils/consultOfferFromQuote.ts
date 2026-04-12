/**
 * Build cart line + pricing from admin consult quote (`consult_quotes` row or local snapshot).
 */

import { calculateSpecialOfferPriceBreakdown, type SpecialOfferPriceBreakdown } from './specialOfferPrice';

/** Persisted on `userOrders_*` when admin sends an offer (local/demo + offline VIEW OFFER). */
export type ConsultOfferPersistedSnapshot = {
  unitKey: string;
  selections: ConsultQuoteSelections;
  priceBreakdown: { label: string; value: string }[];
  adminMessage: string;
  thumbnailSrc: string;
  discountCode: string;
  expiresAt: string;
};

export const SESSION_CONSULT_CLAIM_QUOTE_ID = 'bawConsultClaimQuoteId';
export const SESSION_CONSULT_CLAIM_CODE = 'bawConsultClaimCode';

/** `localStorage` key: comma-separated **quote ids** for which the client already used **CLAIM OFFER** (one unit per quote). */
export const LOCAL_CONSULT_OFFER_CLAIMED_QUOTE_IDS_KEY = 'bawConsultOfferClaimedQuoteIds';

export function readConsultOfferClaimedQuoteIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LOCAL_CONSULT_OFFER_CLAIMED_QUOTE_IDS_KEY) || '';
    return new Set(
      raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
  } catch {
    return new Set();
  }
}

export function appendConsultOfferClaimedQuoteId(quoteId: string): void {
  const id = String(quoteId || '').trim();
  if (!id || typeof window === 'undefined') return;
  try {
    const cur = readConsultOfferClaimedQuoteIds();
    if (cur.has(id)) return;
    cur.add(id);
    localStorage.setItem(LOCAL_CONSULT_OFFER_CLAIMED_QUOTE_IDS_KEY, Array.from(cur).join(','));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('consultOfferClaimedIdsChanged'));
  } catch {
    /* ignore */
  }
}

/** Rehydrate API-shaped quote from order row saved at send-offer time (localStorage / demo). */
export function consultQuoteRowFromPersistedSnapshot(
  snapshot: ConsultOfferPersistedSnapshot,
  quoteId: string
): Record<string, unknown> {
  return {
    id: quoteId,
    unit_key: snapshot.unitKey,
    selections: snapshot.selections,
    price_breakdown: snapshot.priceBreakdown,
    admin_message: snapshot.adminMessage,
    thumbnail_src: snapshot.thumbnailSrc,
    discount_code: snapshot.discountCode,
    expires_at: snapshot.expiresAt,
  };
}

/**
 * Prefer the **persisted snapshot** thumbnail when present so **custom upload** images
 * always show in VIEW OFFER (API row may omit, truncate, or differ from what was sent).
 */
export function mergeConsultQuoteWithPersistedThumbnail(
  quote: Record<string, unknown> | null | undefined,
  snapshot: ConsultOfferPersistedSnapshot | null | undefined
): Record<string, unknown> | null {
  if (!quote || !snapshot) return quote ?? null;
  const snapThumb = String(snapshot.thumbnailSrc || '').trim();
  if (!snapThumb) return quote;
  const apiThumb = String((quote as { thumbnail_src?: unknown }).thumbnail_src ?? '').trim();
  if (apiThumb === snapThumb) return quote;
  return { ...quote, thumbnail_src: snapThumb };
}

/** Parse `/account/consult-offer?id=<uuid>` from legacy `consultOfferRoute` on orders. */
export function consultQuoteIdFromConsultOfferRoute(route: string | undefined | null): string {
  const raw = String(route || '').trim();
  if (!raw) return '';
  try {
    const u = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'https://example.test');
    if (u.pathname.includes('consult-offer')) {
      const id = (u.searchParams.get('id') || '').trim();
      if (id) return id;
    }
  } catch {
    /* ignore */
  }
  const m = raw.match(/[?&]id=([^&]+)/);
  if (m) {
    try {
      return decodeURIComponent(m[1].trim());
    } catch {
      return m[1].trim();
    }
  }
  return '';
}

export type ConsultQuoteSelections = {
  capSize?: string;
  length?: string;
  density?: string;
  texture?: string;
  lace?: string;
  hairline?: string;
  color?: string;
  styling?: string;
  partSelection?: string;
  addOns?: string[];
};

const UNIT_TO_ID: Record<string, string> = {
  NOIR: 'noir',
  BLANCO: 'blanco',
  'SOFT WAVE': 'soft-wave',
  'BEACH WAVE': 'beach-wave',
  'SOFT CURL': 'soft-curl',
  'OCEAN CURL': 'ocean-curl',
};

export function consultQuoteUnitIdFromKey(unitKey: string): string {
  const u = String(unitKey || '')
    .trim()
    .toUpperCase();
  return UNIT_TO_ID[u] || 'noir';
}

export function consultQuoteThumbnailSrcFromUnitKey(unitKey: string): string {
  const u = String(unitKey || '')
    .trim()
    .toUpperCase();
  switch (u) {
    case 'BLANCO':
      return '/assets/NOIR/blanco-thumb.png';
    case 'SOFT WAVE':
      return '/assets/NOIR/wave-thumb.png';
    case 'BEACH WAVE':
      return '/assets/NOIR/wave-thumb.png';
    case 'SOFT CURL':
      return '/assets/NOIR/curl-thumb.png';
    case 'OCEAN CURL':
      return '/assets/NOIR/curl-thumb.png';
    case 'NOIR':
    default:
      return '/assets/NOIR/noir-thumb.png';
  }
}

function asStringRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/** Map `consult_quotes.selections` JSON to `calculateSpecialOfferPriceBreakdown` options. */
export function consultSelectionsToSpecialOfferOptions(selections: unknown): ConsultQuoteSelections {
  const s = asStringRecord(selections);
  const capSize = String(s.capSize ?? s.cap_size ?? '').trim();
  const length = String(s.length ?? '').trim();
  const density = String(s.density ?? '').trim();
  const texture = String(s.texture ?? '').trim();
  const lace = String(s.lace ?? '').trim();
  const hairline = String(s.hairline ?? '').trim();
  const color = String(s.color ?? '').trim();
  const styling = String(s.styling ?? '').trim();
  const partSelection = String(s.partSelection ?? s.part_selection ?? '').trim();
  let addOns: string[] | undefined;
  if (Array.isArray(s.addOns)) {
    addOns = s.addOns.map((x) => String(x).trim().toUpperCase()).filter(Boolean);
  } else if (typeof s.addOns === 'string' && s.addOns.trim()) {
    addOns = s.addOns
      .split(/[+,&]/)
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);
  }
  const out: ConsultQuoteSelections = {};
  if (capSize) out.capSize = capSize;
  if (length) out.length = length;
  if (density) out.density = density;
  if (texture) out.texture = texture;
  if (lace) out.lace = lace;
  if (hairline) out.hairline = hairline;
  if (color) out.color = color;
  if (styling) out.styling = styling;
  if (partSelection) out.partSelection = partSelection;
  if (addOns && addOns.length) out.addOns = addOns;
  return out;
}

export function consultQuoteBreakdownFromRow(quote: Record<string, unknown>): SpecialOfferPriceBreakdown {
  const unitKey = String(quote.unit_key || 'NOIR').trim();
  const unitId = consultQuoteUnitIdFromKey(unitKey);
  const opts = consultSelectionsToSpecialOfferOptions(quote.selections);
  return calculateSpecialOfferPriceBreakdown(unitId, opts);
}

function lineAmountForCart(label: string, amountUsd: number): number {
  if (label === 'BASE UNIT' || label === 'UNIT') return amountUsd;
  if (label === 'CAP SIZE') return amountUsd;
  if (label === 'LENGTH') return amountUsd;
  if (label === 'DENSITY') return amountUsd;
  if (label === 'TEXTURE') return amountUsd;
  if (label === 'LACE') return amountUsd;
  if (label === 'HAIRLINE') return amountUsd;
  if (label === 'COLOR') return amountUsd;
  if (label === 'STYLING') return amountUsd;
  if (label === 'PARTING') return amountUsd;
  if (label === 'ADD-ON' || label === 'ADD-ONS') return amountUsd;
  return 0;
}

export type ConsultOfferCartBuild = {
  cartItem: Record<string, unknown>;
  totalPrice: number;
};

/**
 * Cart shape aligned with unit PDP / checkout expectations.
 */
export function buildConsultOfferCartItemFromQuote(
  quote: Record<string, unknown>,
  quantity = 1,
  options?: { consultOfferQtyLocked?: boolean }
): ConsultOfferCartBuild {
  const unitKey = String(quote.unit_key || 'NOIR').trim().toUpperCase();
  const unitId = consultQuoteUnitIdFromKey(unitKey);
  const name = unitKey || 'NOIR';
  const breakdown = consultQuoteBreakdownFromRow(quote);
  const opts = consultSelectionsToSpecialOfferOptions(quote.selections);

  const length = opts.length || '24"';
  const density = opts.density || (unitId === 'blanco' ? '250%' : '200%');
  const lace = opts.lace || '13X6';
  const texture = opts.texture || 'SILKY';
  const color = opts.color || (unitId === 'blanco' ? 'PLATINUM' : 'OFF BLACK');
  const hairline = opts.hairline || 'NATURAL';
  const styling = opts.styling || 'NONE';
  const partSelection = String(opts.partSelection || 'MIDDLE').trim().toUpperCase() || 'MIDDLE';
  const capSize = opts.capSize || 'M';
  const addOns = Array.isArray(opts.addOns) ? opts.addOns : [];

  let lengthPrice = 0;
  let densityPrice = 0;
  let lacePrice = 0;
  let texturePrice = 0;
  let colorPrice = 0;
  let hairlinePrice = 0;
  let stylingPrice = 0;
  let capSizePrice = 0;
  let addOnsPrice = 0;

  for (const line of breakdown.lines) {
    const label = String(line.label || '').toUpperCase();
    const amt = lineAmountForCart(label, line.amountUsd);
    if (label === 'LENGTH') lengthPrice = amt;
    else if (label === 'DENSITY') densityPrice = amt;
    else if (label === 'LACE') lacePrice = amt;
    else if (label === 'TEXTURE') texturePrice = amt;
    else if (label === 'COLOR') colorPrice = amt;
    else if (label === 'HAIRLINE') hairlinePrice = amt;
    else if (label === 'STYLING') stylingPrice = amt;
    else if (label === 'PARTING') {
      /* $0 line — not summed into cart line item fields */
    } else if (label === 'CAP SIZE') capSizePrice = amt;
    else if (label === 'ADD-ON' || label === 'ADD-ONS') addOnsPrice += amt;
  }

  const thumb =
    typeof quote.thumbnail_src === 'string' && quote.thumbnail_src.trim()
      ? quote.thumbnail_src.trim()
      : consultQuoteThumbnailSrcFromUnitKey(unitKey);

  const totalPrice = Math.round(breakdown.totalUsd);
  const discountUsd =
    typeof (quote as { discount_amount_usd?: unknown }).discount_amount_usd === 'number' &&
    !Number.isNaN((quote as { discount_amount_usd: number }).discount_amount_usd)
      ? Math.max(0, Math.round((quote as { discount_amount_usd: number }).discount_amount_usd))
      : 40;
  const priceAfterConsult = Math.max(0, totalPrice - discountUsd);

  const qid = String(quote.id || '').trim();
  const discountCodeStr = String(quote.discount_code || '').trim().toUpperCase();

  const cartItem: Record<string, unknown> = {
    id: `consult-offer-${qid || Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    /** Line total after **$40** consult offer (bag/checkout subtotal); pre-discount kept for code validation. */
    price: priceAfterConsult,
    consultOfferLinePreDiscountUsd: totalPrice,
    consultOfferDiscountUsd: discountUsd,
    ...(qid ? { consultOfferQuoteId: qid } : {}),
    ...(discountCodeStr ? { consultOfferDiscountCode: discountCodeStr } : {}),
    ...(options?.consultOfferQtyLocked ? { consultOfferQtyLocked: true } : {}),
    quantity,
    image: thumb,
    capSize,
    capSizePrice,
    length,
    lengthPrice,
    density,
    densityPrice,
    color,
    colorPrice,
    texture,
    texturePrice,
    lace,
    lacePrice,
    hairline,
    hairlinePrice,
    styling,
    stylingPrice,
    partSelection,
    addOns,
    addOnsPrice,
  };

  return { cartItem, totalPrice };
}
