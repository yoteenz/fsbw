/**
 * Calculates the accurate total price for a special offer unit + options,
 * matching build-a-wig / product page pricing (length, density, lace, texture, color, hairline, styling, add-ons).
 * Cap size for special offer is always custom (XS, S, M, L) so capSizePrice = 0.
 */

const UNIT_BASE_PRICES: Record<string, number> = {
  noir: 740,
  blanco: 820,
  'soft-wave': 760,
  'beach-wave': 760,
  'soft-curl': 780,
  'ocean-curl': 780
};

const LENGTH_PRICES: Record<string, number> = {
  '16"': -50, '18"': -25, '20"': -10, '22"': -5, '24"': 0,
  '26"': 50, '28"': 100, '30"': 150, '32"': 200, '34"': 250, '36"': 300, '40"': 400
};

const DENSITY_PRICES_NOIR: Record<string, number> = {
  '130%': -60, '150%': -40, '180%': -20, '200%': 0,
  '250%': 80, '300%': 160, '350%': 240, '400%': 320
};

const DENSITY_PRICES_BLANCO: Record<string, number> = {
  '130%': -80, '150%': -60, '180%': -40, '200%': -20, '250%': 0,
  '300%': 160, '350%': 240, '400%': 320
};

const LACE_PRICES: Record<string, number> = {
  '13X6': 0, '13X4': -20, '13X5': 0, '2X6': -40, '4X4': -40, '5X5': -20,
  '6X6': 60, '7X7': 100, '9X6': 80, '360': 160, 'FULL': 240, 'FULL LACE': 240, 'HD LACE': 0
};

const TEXTURE_PRICES: Record<string, number> = {
  SILKY: 0, KINKY: 40, YAKI: 40, WAVY: 0, CURLY: 0, 'BODY WAVE': 0
};

const STYLING_PRICES: Record<string, number> = {
  BANGS: 40, CRIMPS: 80, 'FLAT IRON': 80, LAYERS: 120
};

const ADDON_PRICES: Record<string, number> = {
  BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20
};

export type SpecialOfferOptions = {
  length?: string;
  density?: string;
  texture?: string;
  lace?: string;
  color?: string;
  hairline?: string;
  styling?: string;
  addOns?: string[];
};

/**
 * Returns the total price for the given unit and options (matches build-a-wig logic).
 */
export function calculateSpecialOfferPrice(unitId: string, options: SpecialOfferOptions): number {
  const base = UNIT_BASE_PRICES[unitId] ?? 740;
  const isBlanco = unitId === 'blanco';

  const length = (options.length || '24"').trim();
  const density = (options.density || '200%').trim();
  const lace = (options.lace || '13X6').trim().toUpperCase();
  const texture = (options.texture || 'SILKY').trim().toUpperCase();
  const color = (options.color || (isBlanco ? 'PLATINUM' : 'OFF BLACK')).trim().toUpperCase();
  const hairline = options.hairline || 'NATURAL';
  const styling = options.styling || 'NONE';
  const addOns = options.addOns || [];

  let capSizePrice = 0; // Special offer only uses XS,S,M,L
  const lengthPrice = LENGTH_PRICES[length] ?? 0;
  const densityTable = isBlanco ? DENSITY_PRICES_BLANCO : DENSITY_PRICES_NOIR;
  const densityPrice = densityTable[density] ?? 0;
  const lacePrice = LACE_PRICES[lace] ?? 0;
  const texturePrice = TEXTURE_PRICES[texture] ?? 0;

  const defaultColor = isBlanco ? 'PLATINUM' : 'OFF BLACK';
  let colorPrice = 0;
  if (color && color !== defaultColor) {
    if (isBlanco) {
      if (color === 'GOLDEN') colorPrice = -20;
      else if (color === 'ASH') colorPrice = 20;
    } else {
      colorPrice = 100;
      if (['30"', '32"', '34"', '36"', '40"'].includes(length)) colorPrice += 40;
    }
  }

  let hairlinePrice = 0;
  if (hairline && hairline !== 'NATURAL') {
    const parts = hairline.split(',').map((h) => h.trim().toUpperCase());
    parts.forEach((h) => {
      if (h === 'PEAK') hairlinePrice += 40;
      else if (h === 'LAGOS') hairlinePrice += 60;
    });
    if (parts.includes('LAGOS') && parts.includes('PEAK')) hairlinePrice -= 20;
  }

  const stylingUpper = (styling || 'NONE').trim().toUpperCase();
  let stylingPrice = 0;
  if (stylingUpper && stylingUpper !== 'NONE') {
    const arr = stylingUpper.split(',').map((s) => s.trim());
    const hasBangs = arr.includes('BANGS');
    const other = arr.find((s) => s !== 'BANGS');
    const isLong = /30|32|34|36/.test(length);
    if (hasBangs && other) {
      let sec = STYLING_PRICES[other] ?? 0;
      if (isLong && ['CRIMPS', 'FLAT IRON', 'LAYERS'].includes(other)) sec += 40;
      stylingPrice = sec + 20;
    } else if (hasBangs) {
      stylingPrice = 40;
    } else {
      const first = arr[0];
      let p = STYLING_PRICES[first] ?? 0;
      if (isLong && ['CRIMPS', 'FLAT IRON', 'LAYERS'].includes(first)) p += 40;
      stylingPrice = p;
    }
  }

  const discountedLace = ['2X6', '4X4', '5X5', '6X6', '7X7'].includes(lace);
  let addOnsPrice = 0;
  addOns.forEach((addOn) => {
    const key = addOn.trim().toUpperCase();
    let p = ADDON_PRICES[key] ?? 0;
    if (discountedLace && (key === 'BLEACH' || key === 'PLUCK')) p -= 20;
    addOnsPrice += p;
  });

  let total = base + capSizePrice + lengthPrice + densityPrice + lacePrice + texturePrice + colorPrice + hairlinePrice + stylingPrice + addOnsPrice;

  // Wavy units (soft-wave, beach-wave): build-a-wig shows $20 more for the same config; add so special-offer and build-a-wig match.
  const isWavy = unitId === 'soft-wave' || unitId === 'beach-wave';
  if (isWavy) total += 20;

  return total;
}
