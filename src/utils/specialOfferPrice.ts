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
  capSize?: string;
  length?: string;
  density?: string;
  texture?: string;
  lace?: string;
  color?: string;
  hairline?: string;
  styling?: string;
  addOns?: string[];
};

export type SpecialOfferBreakdownLine = {
  label: string;
  selection: string;
  amountUsd: number;
};

export type SpecialOfferPriceBreakdown = {
  totalUsd: number;
  lines: SpecialOfferBreakdownLine[];
};

const CAP_SIZE_PRICES: Record<string, number> = {
  M: 0,
  'XXS/XS/S': 40,
  'S/M/L': 40,
};

function unitLabelFromId(unitId: string): string {
  return String(unitId || '')
    .trim()
    .replace(/-/g, ' ')
    .toUpperCase();
}

function computeSpecialOfferPriceParts(unitId: string, options: SpecialOfferOptions) {
  const base = UNIT_BASE_PRICES[unitId] ?? 740;
  const isBlanco = unitId === 'blanco';

  const capSize = String(options.capSize || 'M').trim().toUpperCase();
  const length = (options.length || '24"').trim();
  const density = (options.density || (isBlanco ? '250%' : '200%')).trim();
  const lace = (options.lace || '13X6').trim().toUpperCase();
  const texture = (options.texture || 'SILKY').trim().toUpperCase();
  const color = (options.color || (isBlanco ? 'PLATINUM' : 'OFF BLACK')).trim().toUpperCase();
  const hairline = String(options.hairline || 'NATURAL').trim().toUpperCase();
  const styling = String(options.styling || 'NONE').trim().toUpperCase();
  const addOns = (options.addOns || []).map((addOn) => String(addOn).trim().toUpperCase()).filter(Boolean);

  const capSizePrice = CAP_SIZE_PRICES[capSize] ?? 0;
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
      // Match build-a-wig `calculatePricesFromSelections` / color sub-page: flat $120 for any non-default color (no length add-on).
      colorPrice = 120;
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

  let stylingPrice = 0;
  if (styling && styling !== 'NONE') {
    const arr = styling.split(',').map((s) => s.trim());
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
  const addOnLines = addOns.map((addOn) => {
    let amountUsd = ADDON_PRICES[addOn] ?? 0;
    if (discountedLace && (addOn === 'BLEACH' || addOn === 'PLUCK')) amountUsd -= 20;
    return { label: 'ADD-ON', selection: addOn, amountUsd };
  });
  const addOnsPrice = addOnLines.reduce((sum, line) => sum + line.amountUsd, 0);

  let total = base + capSizePrice + lengthPrice + densityPrice + lacePrice + texturePrice + colorPrice + hairlinePrice + stylingPrice + addOnsPrice;
  const isWavy = unitId === 'soft-wave' || unitId === 'beach-wave';
  if (isWavy) total += 20;

  return {
    totalUsd: total,
    lines: [
      { label: 'BASE UNIT', selection: unitLabelFromId(unitId), amountUsd: base },
      { label: 'CAP SIZE', selection: capSize, amountUsd: capSizePrice },
      { label: 'LENGTH', selection: length, amountUsd: lengthPrice },
      { label: 'DENSITY', selection: density, amountUsd: densityPrice },
      { label: 'TEXTURE', selection: texture, amountUsd: texturePrice },
      { label: 'LACE', selection: lace, amountUsd: lacePrice },
      { label: 'HAIRLINE', selection: hairline === 'LAGOS, PEAK' ? 'LAGOS + PEAK' : hairline, amountUsd: hairlinePrice },
      { label: 'COLOR', selection: color, amountUsd: colorPrice },
      { label: 'STYLING', selection: styling, amountUsd: stylingPrice },
      ...(addOnLines.length > 0 ? addOnLines : [{ label: 'ADD-ONS', selection: 'NONE', amountUsd: 0 }]),
    ],
  };
}

/**
 * Returns the total price for the given unit and options (matches build-a-wig logic).
 */
export function calculateSpecialOfferPrice(unitId: string, options: SpecialOfferOptions): number {
  return computeSpecialOfferPriceParts(unitId, options).totalUsd;
}

export function calculateSpecialOfferPriceBreakdown(unitId: string, options: SpecialOfferOptions): SpecialOfferPriceBreakdown {
  return computeSpecialOfferPriceParts(unitId, options);
}
