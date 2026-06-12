/** Fonts loaded and used across the Build-a-Wig site (see src/index.css @font-face). */

export type SiteFontOption = {
  id: string;
  label: string;
  fontFamily: string;
  textTransform?: 'uppercase' | 'lowercase' | 'none';
  /** Primary name sent to Fal population prompt */
  falName: string;
};

export const SITE_FONT_OPTIONS: SiteFontOption[] = [
  {
    id: 'futura-book',
    label: 'Futura PT Book',
    fontFamily: '"Futura PT Book", futuristic-pt, Futura, sans-serif',
    falName: 'Futura PT Book',
  },
  {
    id: 'futura-medium',
    label: 'Futura PT Medium',
    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, sans-serif',
    falName: 'Futura PT Medium',
  },
  {
    id: 'futura-demi',
    label: 'Futura PT Demi',
    fontFamily: '"Futura PT Demi", futuristic-pt, Futura, sans-serif',
    falName: 'Futura PT Demi',
  },
  {
    id: 'bohemy',
    label: 'Bohemy',
    fontFamily: '"Bohemy", cursive',
    textTransform: 'lowercase',
    falName: 'Bohemy',
  },
  {
    id: 'cbyg',
    label: 'Covered By Your Grace',
    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive',
    falName: 'Covered By Your Grace',
  },
];

export const DEFAULT_OVERALL_SCORE_FONT_ID = 'futura-demi';

export function siteFontById(id: string): SiteFontOption | undefined {
  return SITE_FONT_OPTIONS.find((option) => option.id === id);
}

export function siteFontIdFromFamily(fontFamily?: string): string {
  if (!fontFamily?.trim()) return DEFAULT_OVERALL_SCORE_FONT_ID;
  const normalized = fontFamily.trim().toLowerCase();
  const hit = SITE_FONT_OPTIONS.find((option) => {
    const primary = option.fontFamily.split(',')[0]?.replace(/"/g, '').trim().toLowerCase();
    return normalized.includes(primary) || fontFamily.includes(option.falName);
  });
  return hit?.id ?? DEFAULT_OVERALL_SCORE_FONT_ID;
}

export function siteFontStylePatch(id: string): Pick<SiteFontOption, 'fontFamily' | 'textTransform'> {
  const option = siteFontById(id) ?? siteFontById(DEFAULT_OVERALL_SCORE_FONT_ID)!;
  return {
    fontFamily: option.fontFamily,
    ...(option.textTransform ? { textTransform: option.textTransform } : {}),
  };
}
