/**
 * BCF shop lines (bundles / closures / frontals): processing windows differ from custom units.
 */

export function cartLineIsBcfBundleClosureFrontal(item: Record<string, unknown> | null | undefined): boolean {
  if (!item || String(item.type || '') !== 'shop-texture-category') return false;
  const cat = String(item.category || '').toLowerCase();
  return cat === 'bundles' || cat === 'closures' || cat === 'frontals';
}

export function cartHasBcfBundlesClosuresOrFrontals(items: unknown[] | null | undefined): boolean {
  if (!Array.isArray(items)) return false;
  return items.some((row) => cartLineIsBcfBundleClosureFrontal(row as Record<string, unknown>));
}

function lineSkipsBcfProcessingRules(item: Record<string, unknown>): boolean {
  const name = String(item.name || '').trim().toUpperCase();
  const t = String(item.type || '').trim().toLowerCase();
  if (name === 'GIFT CARD' || t === 'gift-card' || t === 'digital') return true;
  if (t === 'booking-appointment' || t === 'booking-consult') return true;
  return false;
}

/** True when every non–gift/digital/booking cart line is BCF bundle|closure|frontal (no custom units in cart). */
export function cartQualifiesForBcfProcessingWindows(items: unknown[] | null | undefined): boolean {
  if (!Array.isArray(items)) return false;
  const relevant = items.filter((row) => !lineSkipsBcfProcessingRules(row as Record<string, unknown>));
  if (relevant.length === 0) return false;
  return relevant.every((row) => cartLineIsBcfBundleClosureFrontal(row as Record<string, unknown>));
}

function defaultHairColorForUnitName(itemName: unknown): string {
  const n = String(itemName || '').toUpperCase().trim();
  return n === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
}

function cartHasCustomHairColor(items: unknown[]): boolean {
  return items.some((raw) => {
    const item = raw as Record<string, unknown>;
    if (lineSkipsBcfProcessingRules(item)) return false;
    const defaultColor = defaultHairColorForUnitName(item.name);
    const colorNorm = String(item.color || '').trim().toUpperCase();
    return Boolean(colorNorm && colorNorm !== defaultColor);
  });
}

function cartHasStylingOrAddOnsOnlyPhysical(items: unknown[]): boolean {
  return items.some((raw) => {
    const item = raw as Record<string, unknown>;
    if (lineSkipsBcfProcessingRules(item)) return false;
    const stylingNorm = String(item.styling || '').trim().toUpperCase();
    const hasNonDefaultStyling = Boolean(stylingNorm && stylingNorm !== 'NONE');
    const addOns = item.addOns;
    const hasAddOns = Array.isArray(addOns) && addOns.length > 0;
    return hasNonDefaultStyling || hasAddOns;
  });
}

/**
 * Persisted / display processing window for checkout orders.
 * BCF-only (bundles, closures, frontals): **4–6** standard; **3–4** express when eligible.
 * Custom color (non-default) or styling/add-ons → extended **6–8 (up to 10)** on standard; express disabled for BCF-only when color/styling/add-ons.
 * Other carts: unchanged (6–8 standard, 4–6 rush when no color/styling/add-ons).
 */
export function getCheckoutProcessingTimePersistentLabel(opts: {
  cartItems: unknown[];
  selectedProcessing: 'standard' | 'rush';
  hasColorStylingOrAddOns: boolean;
}): string {
  const { cartItems, selectedProcessing, hasColorStylingOrAddOns } = opts;
  const items = Array.isArray(cartItems) ? cartItems : [];
  const bcfOnly = cartQualifiesForBcfProcessingWindows(items);
  const customColor = cartHasCustomHairColor(items);
  const stylingOrAddOns = cartHasStylingOrAddOnsOnlyPhysical(items);

  const rushAllowed = !customColor && (bcfOnly ? !stylingOrAddOns : !hasColorStylingOrAddOns);
  const effectiveRush = selectedProcessing === 'rush' && rushAllowed;

  if (effectiveRush) {
    return bcfOnly ? '3 TO 4 WEEKS' : '4 TO 6 WEEKS';
  }
  if (bcfOnly) {
    if (customColor || stylingOrAddOns) {
      return '6 TO 8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)';
    }
    return '4 TO 6 WEEKS';
  }
  return hasColorStylingOrAddOns
    ? '6 TO 8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)'
    : '6 TO 8 WEEKS';
}

export function checkoutExpressProcessingAllowed(opts: {
  cartItems: unknown[];
  hasColorStylingOrAddOns: boolean;
}): boolean {
  const items = Array.isArray(opts.cartItems) ? opts.cartItems : [];
  const bcfOnly = cartQualifiesForBcfProcessingWindows(items);
  const customColor = cartHasCustomHairColor(items);
  const stylingOrAddOns = cartHasStylingOrAddOnsOnlyPhysical(items);
  return !customColor && (bcfOnly ? !stylingOrAddOns : !opts.hasColorStylingOrAddOns);
}

/** Min/max weeks for date-range UI from persisted `processingTime` string. */
export function processingTimelineWeekRangeFromLabel(processingTime: string): { min: number; max: number } {
  const s = (processingTime || '').toUpperCase();
  if (s.includes('10')) return { min: 6, max: 10 };
  if (/3\s*(?:TO|-)\s*4/.test(s)) return { min: 3, max: 4 };
  if (s.includes('4')) return { min: 4, max: 6 };
  return { min: 6, max: 8 };
}

function confirmNonBcfHasExtendedProcessing(item: Record<string, unknown>): boolean {
  if (lineSkipsBcfProcessingRules(item)) return false;
  const defaultColor = defaultHairColorForUnitName(item.name);
  const colorNorm = String(item.color || '').trim().toUpperCase();
  const hasNonDefaultColor = Boolean(colorNorm && colorNorm !== defaultColor);
  const stylingNorm = String(item.styling || '').trim().toUpperCase();
  const hasNonDefaultStyling = Boolean(stylingNorm && stylingNorm !== 'NONE');
  const addOns = item.addOns;
  const hasAddOns = Array.isArray(addOns) && addOns.length > 0;
  const len = String(item.length || '').trim();
  const hasNonDefaultLength = Boolean(len && len !== '24"');
  const density = String(item.density || '').trim();
  const hasNonDefaultDensity = Boolean(density && density !== '200%');
  const lace = String(item.lace || '').trim();
  const hasNonDefaultLace = Boolean(lace && lace !== '13X6');
  const hairline = String(item.hairline || '').trim();
  const hasNonDefaultHairline = Boolean(hairline && hairline !== 'NATURAL');
  return (
    hasNonDefaultColor ||
    hasNonDefaultStyling ||
    hasAddOns ||
    hasNonDefaultLength ||
    hasNonDefaultDensity ||
    hasNonDefaultLace ||
    hasNonDefaultHairline
  );
}

/** When confirm page has no `processingTime` in navigation state (e.g. Apple Pay path). */
export function getConfirmPageFallbackProcessingLabel(cartItems: unknown[]): string {
  const items = Array.isArray(cartItems) ? cartItems : [];
  const bcfOnly = cartQualifiesForBcfProcessingWindows(items);
  const customColor = cartHasCustomHairColor(items);
  const stylingOrAddOns = cartHasStylingOrAddOnsOnlyPhysical(items);
  if (bcfOnly) {
    if (customColor || stylingOrAddOns) {
      return '6 TO 8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)';
    }
    return '4 TO 6 WEEKS';
  }
  const extended = items.some((row) => confirmNonBcfHasExtendedProcessing(row as Record<string, unknown>));
  return extended ? '6 TO 8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)' : '6 TO 8 WEEKS';
}
