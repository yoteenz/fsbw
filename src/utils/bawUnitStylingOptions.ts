/**
 * Build-a-wig salon styling options — straight/wavy use CRIMPS + LAYERS;
 * soft-curl & ocean-curl use WAND CURLS ($80) + DEFINE ($60).
 */

export interface BawHairStylingOption {
  id: string;
  name: string;
  image: string;
  price: number;
}

const DEFAULT_HAIR_STYLING_OPTIONS: BawHairStylingOption[] = [
  { id: 'BANGS', name: 'BANGS', image: '/assets/Bangs-icon.svg', price: 40 },
  { id: 'CRIMPS', name: 'CRIMPS', image: '/assets/Crimps-icon.svg', price: 80 },
  { id: 'FLAT IRON', name: 'FLAT IRON', image: '/assets/Flat iron-icon.svg', price: 80 },
  { id: 'LAYERS', name: 'LAYERS', image: '/assets/Layers-icon.svg', price: 120 },
];

const CURLY_HAIR_STYLING_OPTIONS: BawHairStylingOption[] = [
  { id: 'BANGS', name: 'BANGS', image: '/assets/Bangs-icon.svg', price: 40 },
  { id: 'WAND CURLS', name: 'WAND CURLS', image: '/assets/Crimps-icon.svg', price: 80 },
  { id: 'FLAT IRON', name: 'FLAT IRON', image: '/assets/Flat iron-icon.svg', price: 80 },
  { id: 'DEFINE', name: 'DEFINE', image: '/assets/Layers-icon.svg', price: 60 },
];

export const BAW_SALON_STYLING_IDS = [
  'BANGS',
  'CRIMPS',
  'FLAT IRON',
  'LAYERS',
  'WAND CURLS',
  'DEFINE',
] as const;

export function isCurlyUnitBawPath(pathname: string): boolean {
  return (
    pathname.includes('/build-a-wig/soft-curl') || pathname.includes('/build-a-wig/ocean-curl')
  );
}

export function isCurlyUnitProductName(name: string | undefined | null): boolean {
  const n = String(name ?? '').trim().toUpperCase();
  return n === 'SOFT CURL' || n === 'OCEAN CURL';
}

export function usesCurlyUnitStylingOptions(
  pathname: string,
  productName?: string | null
): boolean {
  return isCurlyUnitBawPath(pathname) || isCurlyUnitProductName(productName);
}

/** Legacy cart/localStorage ids → current curly salon ids. */
export function normalizeCurlyUnitStylingId(id: string): string {
  const t = id.trim().toUpperCase();
  if (t === 'CRIMPS') return 'WAND CURLS';
  if (t === 'LAYERS') return 'DEFINE';
  return id.trim();
}

export function normalizeCurlyUnitStylingCsv(raw: string): string {
  if (!raw?.trim()) return raw;
  return raw
    .split(',')
    .map((part) => normalizeCurlyUnitStylingId(part))
    .join(', ');
}

export function normalizeCurlyUnitStylingIds(ids: string[]): string[] {
  return ids.map((id) => normalizeCurlyUnitStylingId(id));
}

export function getBawHairStylingOptionsForPath(pathname: string): BawHairStylingOption[] {
  return isCurlyUnitBawPath(pathname) ? CURLY_HAIR_STYLING_OPTIONS : DEFAULT_HAIR_STYLING_OPTIONS;
}

export function getBawStylingPriceMap(
  pathname: string,
  productName?: string | null
): Record<string, number> {
  const opts = usesCurlyUnitStylingOptions(pathname, productName)
    ? CURLY_HAIR_STYLING_OPTIONS
    : DEFAULT_HAIR_STYLING_OPTIONS;
  const map: Record<string, number> = Object.fromEntries(opts.map((o) => [o.id, o.price]));
  if (usesCurlyUnitStylingOptions(pathname, productName)) {
    map.CRIMPS = map['WAND CURLS'];
    map.LAYERS = map.DEFINE;
  }
  return map;
}

export function bawSalonStylingIdsWithLongLengthSurcharge(
  pathname: string,
  productName?: string | null
): string[] {
  if (usesCurlyUnitStylingOptions(pathname, productName)) {
    return ['WAND CURLS', 'FLAT IRON', 'DEFINE', 'CRIMPS', 'LAYERS'];
  }
  return ['CRIMPS', 'FLAT IRON', 'LAYERS'];
}

export function isBawSalonStylingValueConfirmed(
  raw: string | null,
  pathname?: string
): boolean {
  if (!raw || typeof raw !== 'string') return false;
  const v = pathname ? normalizeCurlyUnitStylingCsv(raw) : raw.trim();
  if (!v || v === 'NONE') return false;
  const first = v.split(',')[0]?.trim();
  return !!first && (BAW_SALON_STYLING_IDS as readonly string[]).includes(first);
}

function isLongLengthValue(length: string | undefined | null): boolean {
  const selectedLength = length ?? '';
  return (
    selectedLength.includes('30') ||
    selectedLength.includes('32') ||
    selectedLength.includes('34') ||
    selectedLength.includes('36')
  );
}

/** Matches styling sub-page + hub pricing (bangs combo + long-length surcharge). */
export function computeBawStylingPriceUsd(
  styling: string,
  opts: { pathname?: string; productName?: string | null; length?: string | null }
): number {
  const pathname = opts.pathname ?? '';
  const productName = opts.productName;
  if (!styling || styling === 'NONE') return 0;

  const raw = usesCurlyUnitStylingOptions(pathname, productName)
    ? normalizeCurlyUnitStylingCsv(styling)
    : styling;
  const stylingArray = raw.split(',').map((s) => s.trim());
  const hasBangs = stylingArray.includes('BANGS');
  const otherStyling = stylingArray.find((id) => id !== 'BANGS');
  const isLongLength = isLongLengthValue(opts.length);
  const stylingPrices = getBawStylingPriceMap(pathname, productName);
  const longSurchargeIds = bawSalonStylingIdsWithLongLengthSurcharge(pathname, productName);

  if (hasBangs && otherStyling) {
    let secondaryPrice = stylingPrices[otherStyling] ?? 0;
    if (isLongLength && longSurchargeIds.includes(otherStyling)) secondaryPrice += 40;
    return secondaryPrice + 20;
  }
  if (hasBangs) return 40;

  const stylingId = stylingArray[0];
  let basePrice = stylingPrices[stylingId] ?? 0;
  if (isLongLength && longSurchargeIds.includes(stylingId)) basePrice += 40;
  return basePrice;
}

export function computeBawStylingPriceFromSelectionArray(
  selectedHairStyling: string[],
  opts: { pathname: string; length?: string | null }
): number {
  if (selectedHairStyling.length === 0) return 0;
  const hasBangs = selectedHairStyling.includes('BANGS');
  const otherStyling = selectedHairStyling.find((id) => id !== 'BANGS');
  const stylingPrices = getBawStylingPriceMap(opts.pathname);
  const longSurchargeIds = bawSalonStylingIdsWithLongLengthSurcharge(opts.pathname);
  const isLongLength = isLongLengthValue(opts.length);

  if (hasBangs && otherStyling) {
    let secondaryPrice = stylingPrices[otherStyling] ?? 0;
    if (isLongLength && longSurchargeIds.includes(otherStyling)) secondaryPrice += 40;
    return secondaryPrice + 20;
  }
  if (hasBangs) return 40;

  const id = selectedHairStyling[0];
  let basePrice = stylingPrices[id] ?? 0;
  if (isLongLength && longSurchargeIds.includes(id)) basePrice += 40;
  return basePrice;
}
