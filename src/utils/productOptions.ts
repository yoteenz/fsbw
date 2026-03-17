/**
 * Build-a-wig sub-page options per product (unit).
 * Matches the options shown on each product's build-a-wig flow.
 */

export const LENGTH_OPTIONS = ['16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"', '32"', '34"', '36"', '40"'];

export const DENSITY_OPTIONS = ['130%', '150%', '180%', '200%', '250%', '300%', '350%', '400%'];

export const TEXTURE_OPTIONS = ['SILKY', 'KINKY', 'YAKI'];

export const LACE_OPTIONS = ['2X6', '4X4', '5X5', '6X6', '9X6', '7X7', '13X4', '13X6', '360', 'FULL'];

/** Hairline: NATURAL, PEAK, LAGOS, and combined LAGOS + PEAK (stored as "LAGOS, PEAK" for pricing). */
export const HAIRLINE_OPTIONS = ['NATURAL', 'PEAK', 'LAGOS', 'LAGOS, PEAK'];

/** Styling: single options plus Bangs combinations (matches build-a-wig styling page). */
export const STYLING_OPTIONS = [
  'NONE',
  'BANGS',
  'CRIMPS',
  'FLAT IRON',
  'LAYERS',
  'BANGS, CRIMPS',
  'BANGS, FLAT IRON',
  'BANGS, LAYERS'
];

export const ADDON_OPTIONS = ['BLEACH', 'PLUCK', 'BLUNT CUT'];

/** All add-on combinations for marketing dropdown: label and corresponding addOns array. */
export const ADDON_COMBO_OPTIONS: { label: string; value: string[] }[] = [
  { label: 'NONE', value: [] },
  { label: 'BLEACH', value: ['BLEACH'] },
  { label: 'PLUCK', value: ['PLUCK'] },
  { label: 'BLUNT CUT', value: ['BLUNT CUT'] },
  { label: 'BLEACH + PLUCK', value: ['BLEACH', 'PLUCK'] },
  { label: 'BLEACH + BLUNT CUT', value: ['BLEACH', 'BLUNT CUT'] },
  { label: 'PLUCK + BLUNT CUT', value: ['PLUCK', 'BLUNT CUT'] },
  { label: 'BLEACH + PLUCK + BLUNT CUT', value: ['BLEACH', 'PLUCK', 'BLUNT CUT'] }
];

/** Blanco (straight blonde) has only these 3 colors on its color sub-page. */
export const COLOR_OPTIONS_BLANCO = ['GOLDEN', 'PLATINUM', 'ASH'] as const;

/** Noir and wavy/curly products share this color list (build-a-wig color page, non-blanco). */
export const COLOR_OPTIONS_DEFAULT = [
  'JET BLACK', 'OFF BLACK', 'ESPRESSO', 'CHESTNUT', 'HONEY', 'AUBURN', 'COPPER', 'GINGER',
  'SANGRIA', 'CHERRY', 'RASPBERRY', 'PLUM', 'COBALT', 'TEAL', 'SLIME', 'CITRINE'
] as const;

export type UnitId = 'noir' | 'blanco' | 'soft-wave' | 'beach-wave' | 'soft-curl' | 'ocean-curl';

export function getColorOptionsForUnit(unitId: UnitId): readonly string[] {
  return unitId === 'blanco' ? COLOR_OPTIONS_BLANCO : COLOR_OPTIONS_DEFAULT;
}

/** Default color per product: blanco = PLATINUM, others = OFF BLACK. */
export function getDefaultColorForUnit(unitId: UnitId): string {
  return unitId === 'blanco' ? 'PLATINUM' : 'OFF BLACK';
}

/** Default density per product: blanco = 250%, others = 200%. */
export function getDefaultDensityForUnit(unitId: UnitId): string {
  return unitId === 'blanco' ? '250%' : '200%';
}

export function getOptionsForUnit(unitId: UnitId) {
  return {
    length: LENGTH_OPTIONS,
    density: DENSITY_OPTIONS,
    texture: TEXTURE_OPTIONS,
    lace: LACE_OPTIONS,
    hairline: HAIRLINE_OPTIONS,
    color: getColorOptionsForUnit(unitId),
    styling: STYLING_OPTIONS,
    addOns: ADDON_OPTIONS
  };
}
