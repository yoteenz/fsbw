/**
 * Calculates the accurate total price for a special offer unit + options,
 * matching build-a-wig / product page pricing (length, density, lace, texture, color, hairline, styling, add-ons).
 * Cap size: **XS, S, M, L** = $0; flexible **XXS/XS/S** and **S/M/L** = +$40 (same as build-a-wig hub).
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
  BANGS: 40,
  CRIMPS: 80,
  'FLAT IRON': 80,
  LAYERS: 120,
  'WAND CURLS': 80,
  DEFINE: 60,
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
  /** Parting / install placement (e.g. MIDDLE, LEFT, RIGHT) — $0 in offer breakdown; cart uses separately. */
  partSelection?: string;
  addOns?: string[];
  /**
   * Send offer / admin: when a row uses **CUSTOM**, use this USD for that breakdown line
   * (keys match line **`label`**: LENGTH, COLOR, DENSITY, CAP SIZE, HAIRLINE, LACE, TEXTURE, STYLING, ADD-ONS).
   */
  customLineUsd?: Partial<Record<string, number>>;
  /**
   * When **`customLineUsd`** applies to a line, optional **display** text for the breakdown / quote
   * (e.g. length **`50"`** instead of the internal token).
   */
  customLineSelection?: Partial<Record<string, string>>;
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
  XS: 0,
  S: 0,
  M: 0,
  L: 0,
  'XXS/XS/S': 40,
  'S/M/L': 40,
};

function unitLabelFromId(unitId: string): string {
  return String(unitId || '')
    .trim()
    .replace(/-/g, ' ')
    .toUpperCase();
}

/** Single letter for parting in breakdown text, e.g. **LAYERS (M)**. */
export function partLetterFromPartSelection(partRaw: string): string {
  const p = String(partRaw || '').trim().toUpperCase();
  if (p === 'LEFT' || p === 'L') return 'L';
  if (p === 'RIGHT' || p === 'R') return 'R';
  if (p === 'MIDDLE' || p === 'M' || p === 'CENTER' || p === 'C') return 'M';
  if (!p) return 'M';
  return p.charAt(0);
}

/**
 * Turn one **STYLING** breakdown line into display rows, each **`STYLING: LAYERS (M)`** style
 * (category label + option + part letter in parentheses).
 * Full **`amountUsd`** is kept on the **first** row only (matches single pricing line).
 */
export function expandStylingBreakdownLineForDisplay(
  line: SpecialOfferBreakdownLine,
  partSelectionRaw: string
): SpecialOfferBreakdownLine[] {
  if (line.label !== 'STYLING') return [line];
  const letter = partLetterFromPartSelection(partSelectionRaw);
  const styling = String(line.selection || '').trim().toUpperCase();
  if (!styling || styling === 'NONE') {
    return [{ ...line, selection: 'NONE', amountUsd: 0 }];
  }
  const tokens = styling
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  if (!tokens.length) return [{ ...line, selection: 'NONE', amountUsd: 0 }];
  return tokens.map((tok, i) => ({
    label: 'STYLING',
    selection: `${tok} (${letter})`,
    amountUsd: i === 0 ? line.amountUsd : 0,
  }));
}

function computeSpecialOfferPriceParts(unitId: string, options: SpecialOfferOptions) {
  const base = UNIT_BASE_PRICES[unitId] ?? 740;
  const isBlanco = unitId === 'blanco';
  const customUsd = options.customLineUsd || {};
  const customSel = options.customLineSelection || {};

  const capSize = String(options.capSize || 'M').trim().toUpperCase();
  const length = (options.length || '24"').trim();
  const density = (options.density || (isBlanco ? '250%' : '200%')).trim();
  const lace = (options.lace || '13X6').trim().toUpperCase();
  const texture = (options.texture || 'SILKY').trim().toUpperCase();
  const color = (options.color || (isBlanco ? 'PLATINUM' : 'OFF BLACK')).trim().toUpperCase();
  const hairline = String(options.hairline || 'NATURAL').trim().toUpperCase();
  const styling = String(options.styling || 'NONE').trim().toUpperCase();
  const partSelection = String(options.partSelection || 'MIDDLE').trim().toUpperCase();
  const addOns = (options.addOns || []).map((addOn) => String(addOn).trim().toUpperCase()).filter(Boolean);

  let capSizePrice = CAP_SIZE_PRICES[capSize] ?? 0;
  let capSizeDisplay = capSize;
  if (typeof customUsd['CAP SIZE'] === 'number') {
    capSizePrice = Math.max(0, Math.round(customUsd['CAP SIZE']!));
    const o = customSel['CAP SIZE'];
    if (typeof o === 'string' && o.trim()) capSizeDisplay = o.trim();
  }

  let lengthPrice = LENGTH_PRICES[length] ?? 0;
  let lengthDisplay = length;
  if (typeof customUsd.LENGTH === 'number') {
    lengthPrice = Math.max(0, Math.round(customUsd.LENGTH));
    const o = customSel.LENGTH;
    if (typeof o === 'string' && o.trim()) lengthDisplay = o.trim();
  }

  const densityTable = isBlanco ? DENSITY_PRICES_BLANCO : DENSITY_PRICES_NOIR;
  let densityPrice = densityTable[density] ?? 0;
  let densityDisplay = density;
  if (typeof customUsd.DENSITY === 'number') {
    densityPrice = Math.max(0, Math.round(customUsd.DENSITY));
    const o = customSel.DENSITY;
    if (typeof o === 'string' && o.trim()) densityDisplay = o.trim();
  }

  let lacePrice = LACE_PRICES[lace] ?? 0;
  let laceDisplay = lace;
  if (typeof customUsd.LACE === 'number') {
    lacePrice = Math.max(0, Math.round(customUsd.LACE));
    const o = customSel.LACE;
    if (typeof o === 'string' && o.trim()) laceDisplay = o.trim().toUpperCase();
  }

  let texturePrice = TEXTURE_PRICES[texture] ?? 0;
  let textureDisplay = texture;
  if (typeof customUsd.TEXTURE === 'number') {
    texturePrice = Math.max(0, Math.round(customUsd.TEXTURE));
    const o = customSel.TEXTURE;
    if (typeof o === 'string' && o.trim()) textureDisplay = o.trim().toUpperCase();
  }

  const defaultColor = isBlanco ? 'PLATINUM' : 'OFF BLACK';
  let colorPrice = 0;
  let colorDisplay = color;
  if (typeof customUsd.COLOR === 'number') {
    colorPrice = Math.max(0, Math.round(customUsd.COLOR));
    const o = customSel.COLOR;
    if (typeof o === 'string' && o.trim()) colorDisplay = o.trim().toUpperCase();
  } else if (color && color !== defaultColor) {
    if (isBlanco) {
      if (color === 'GOLDEN') colorPrice = -20;
      else if (color === 'ASH') colorPrice = 20;
    } else {
      // Match build-a-wig `calculatePricesFromSelections` / color sub-page: flat $120 for any non-default color (no length add-on).
      colorPrice = 120;
    }
  }

  let hairlinePrice = 0;
  let hairlineDisplay = hairline === 'LAGOS, PEAK' ? 'LAGOS + PEAK' : hairline;
  if (typeof customUsd.HAIRLINE === 'number') {
    hairlinePrice = Math.max(0, Math.round(customUsd.HAIRLINE));
    const o = customSel.HAIRLINE;
    if (typeof o === 'string' && o.trim()) hairlineDisplay = o.trim();
  } else if (hairline && hairline !== 'NATURAL') {
    const parts = hairline.split(',').map((h) => h.trim().toUpperCase());
    parts.forEach((h) => {
      if (h === 'PEAK') hairlinePrice += 40;
      else if (h === 'LAGOS') hairlinePrice += 60;
    });
    if (parts.includes('LAGOS') && parts.includes('PEAK')) hairlinePrice -= 20;
  }

  let stylingPrice = 0;
  let stylingDisplay = styling;
  if (typeof customUsd.STYLING === 'number') {
    stylingPrice = Math.max(0, Math.round(customUsd.STYLING));
    const o = customSel.STYLING;
    if (typeof o === 'string' && o.trim()) stylingDisplay = o.trim().toUpperCase();
  } else if (styling && styling !== 'NONE') {
    const arr = styling.split(',').map((s) => s.trim());
    const hasBangs = arr.includes('BANGS');
    const other = arr.find((s) => s !== 'BANGS');
    // Match `build-a-wig/page.tsx` + styling sub-page: 30"–36" only (not 40").
    const len = String(length || '');
    const isLong =
      len.includes('30') || len.includes('32') || len.includes('34') || len.includes('36');
    if (hasBangs && other) {
      let sec = STYLING_PRICES[other] ?? 0;
      if (isLong && ['CRIMPS', 'FLAT IRON', 'LAYERS', 'WAND CURLS', 'DEFINE'].includes(other)) sec += 40;
      stylingPrice = sec + 20;
    } else if (hasBangs) {
      stylingPrice = 40;
    } else {
      const first = arr[0];
      let p = STYLING_PRICES[first] ?? 0;
      if (isLong && ['CRIMPS', 'FLAT IRON', 'LAYERS', 'WAND CURLS', 'DEFINE'].includes(first)) p += 40;
      stylingPrice = p;
    }
  }

  const discountedLace = ['2X6', '4X4', '5X5', '6X6', '7X7'].includes(lace);
  let addOnLines: { label: string; selection: string; amountUsd: number }[];
  if (addOns.length === 1 && addOns[0] === 'CUSTOM' && typeof customUsd['ADD-ONS'] === 'number') {
    const addOnDesc =
      typeof customSel['ADD-ONS'] === 'string' && customSel['ADD-ONS'].trim()
        ? customSel['ADD-ONS'].trim()
        : 'CUSTOM';
    addOnLines = [
      { label: 'ADD-ONS', selection: addOnDesc, amountUsd: Math.max(0, Math.round(customUsd['ADD-ONS']!)) },
    ];
  } else {
    addOnLines = addOns.map((addOn) => {
      let amountUsd = ADDON_PRICES[addOn] ?? 0;
      if (discountedLace && (addOn === 'BLEACH' || addOn === 'PLUCK')) amountUsd -= 20;
      return { label: 'ADD-ON', selection: addOn, amountUsd };
    });
  }
  const addOnsPrice = addOnLines.reduce((sum, line) => sum + line.amountUsd, 0);

  let total = base + capSizePrice + lengthPrice + densityPrice + lacePrice + texturePrice + colorPrice + hairlinePrice + stylingPrice + addOnsPrice;
  // Hub `calculatePricesFromSelections` does not add a separate wavy surcharge; base for soft/beach wave is already 760 in `UNIT_BASE_PRICES`.

  return {
    totalUsd: total,
    lines: [
      { label: 'UNIT', selection: unitLabelFromId(unitId), amountUsd: base },
      { label: 'CAP SIZE', selection: capSizeDisplay, amountUsd: capSizePrice },
      { label: 'LENGTH', selection: lengthDisplay, amountUsd: lengthPrice },
      { label: 'DENSITY', selection: densityDisplay, amountUsd: densityPrice },
      { label: 'TEXTURE', selection: textureDisplay, amountUsd: texturePrice },
      { label: 'LACE', selection: laceDisplay, amountUsd: lacePrice },
      { label: 'HAIRLINE', selection: hairlineDisplay, amountUsd: hairlinePrice },
      { label: 'COLOR', selection: colorDisplay, amountUsd: colorPrice },
      { label: 'STYLING', selection: stylingDisplay, amountUsd: stylingPrice },
      { label: 'PARTING', selection: partSelection, amountUsd: 0 },
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
