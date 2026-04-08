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

/** Build-a-wig units have `capSize`; future shop lines may use `shop-texture-category` + category `units`. */
export function cartLineIsUnitProduct(item: Record<string, unknown> | null | undefined): boolean {
  if (!item || lineSkipsBcfProcessingRules(item)) return false;
  if (cartLineIsBcfBundleClosureFrontal(item)) return false;
  const t = String(item.type || '').trim().toLowerCase();
  if (t === 'shop-texture-category') {
    const c = String(item.category || '').toLowerCase();
    return c === 'units' || c === 'unit';
  }
  const cap = item.capSize;
  return cap != null && String(cap).trim() !== '';
}

export function cartHasUnitProduct(items: unknown[] | null | undefined): boolean {
  if (!Array.isArray(items)) return false;
  return items.some((row) => cartLineIsUnitProduct(row as Record<string, unknown>));
}

/** Shorter BCF windows apply only when there is BCF and no unit lines in the same order. */
export function cartUsesBcfOnlyProcessingWindows(items: unknown[] | null | undefined): boolean {
  if (!Array.isArray(items)) return false;
  if (!cartHasBcfBundlesClosuresOrFrontals(items)) return false;
  return !cartHasUnitProduct(items) && cartQualifiesForBcfProcessingWindows(items);
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
 * **BCF-only** (bundles/closures/frontals, no units): **4–6** standard; **3–4** express when eligible.
 * **BCF + unit** (or unit-only): **longer unit windows** take precedence (6–8 / 4–6 rush / extended).
 * BCF-only: custom color or styling/add-ons → extended; express off when those apply.
 */
export function getCheckoutProcessingTimePersistentLabel(opts: {
  cartItems: unknown[];
  selectedProcessing: 'standard' | 'rush';
  hasColorStylingOrAddOns: boolean;
}): string {
  const { cartItems, selectedProcessing, hasColorStylingOrAddOns } = opts;
  const items = Array.isArray(cartItems) ? cartItems : [];
  const bcfOnlyWindows = cartUsesBcfOnlyProcessingWindows(items);
  const customColor = cartHasCustomHairColor(items);
  const stylingOrAddOns = cartHasStylingOrAddOnsOnlyPhysical(items);

  const rushAllowed = !customColor && (bcfOnlyWindows ? !stylingOrAddOns : !hasColorStylingOrAddOns);
  const effectiveRush = selectedProcessing === 'rush' && rushAllowed;

  if (effectiveRush) {
    return bcfOnlyWindows ? '3 TO 4 WEEKS' : '4 TO 6 WEEKS';
  }
  if (bcfOnlyWindows) {
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
  const bcfOnlyWindows = cartUsesBcfOnlyProcessingWindows(items);
  const customColor = cartHasCustomHairColor(items);
  const stylingOrAddOns = cartHasStylingOrAddOnsOnlyPhysical(items);
  return !customColor && (bcfOnlyWindows ? !stylingOrAddOns : !opts.hasColorStylingOrAddOns);
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
  const bcfOnlyWindows = cartUsesBcfOnlyProcessingWindows(items);
  const customColor = cartHasCustomHairColor(items);
  const stylingOrAddOns = cartHasStylingOrAddOnsOnlyPhysical(items);
  if (bcfOnlyWindows) {
    if (customColor || stylingOrAddOns) {
      return '6 TO 8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)';
    }
    return '4 TO 6 WEEKS';
  }
  const extended = items.some((row) => confirmNonBcfHasExtendedProcessing(row as Record<string, unknown>));
  return extended ? '6 TO 8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)' : '6 TO 8 WEEKS';
}
