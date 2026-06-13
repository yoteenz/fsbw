/** Acceptable fonts for Build-a-Wig UI and hairstyle analysis debug (see src/index.css @font-face). */

export type SiteFontGroup = 'brand' | 'stacks' | 'fallbacks';

export type SiteFontOption = {
  id: string;
  label: string;
  fontFamily: string;
  textTransform?: 'uppercase' | 'lowercase' | 'none';
  /** Primary name sent to Fal population prompt */
  falName: string;
  group: SiteFontGroup;
};

export const SITE_FONT_GROUP_LABELS: Record<SiteFontGroup, string> = {
  brand: 'Brand fonts',
  stacks: 'Site stacks',
  fallbacks: 'System fallbacks',
};

export const SITE_FONT_OPTIONS: SiteFontOption[] = [
  {
    id: 'futura-book',
    label: 'Futura PT Book',
    fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
    falName: 'Futura PT Book',
    group: 'brand',
  },
  {
    id: 'futura-medium',
    label: 'Futura PT Medium',
    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
    falName: 'Futura PT Medium',
    group: 'brand',
  },
  {
    id: 'futura-demi',
    label: 'Futura PT Demi',
    fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
    falName: 'Futura PT Demi',
    group: 'brand',
  },
  {
    id: 'bohemy',
    label: 'Bohemy',
    fontFamily: '"Bohemy", cursive',
    textTransform: 'lowercase',
    falName: 'Bohemy',
    group: 'brand',
  },
  {
    id: 'cbyg',
    label: 'Covered By Your Grace',
    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive',
    falName: 'Covered By Your Grace',
    group: 'brand',
  },
  {
    id: 'booking-medium',
    label: 'Booking medium stack',
    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
    falName: 'Futura PT Medium',
    group: 'stacks',
  },
  {
    id: 'booking-book',
    label: 'Booking book stack',
    fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
    falName: 'Futura PT Book',
    group: 'stacks',
  },
  {
    id: 'booking-script',
    label: 'Booking script stack',
    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
    falName: 'Covered By Your Grace',
    group: 'stacks',
  },
  {
    id: 'card-medium-stack',
    label: 'Analysis card medium stack',
    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, "Avenir Next", Montserrat, sans-serif',
    falName: 'Futura PT Medium',
    group: 'stacks',
  },
  {
    id: 'card-demi-stack',
    label: 'Analysis card demi stack',
    fontFamily: '"Futura PT Demi", "Futura PT Medium", futuristic-pt, Futura, sans-serif',
    falName: 'Futura PT Demi',
    group: 'stacks',
  },
  {
    id: 'inter',
    label: 'Inter',
    fontFamily: 'Inter, system-ui, sans-serif',
    falName: 'Inter',
    group: 'fallbacks',
  },
  {
    id: 'futura',
    label: 'Futura',
    fontFamily: 'Futura, futuristic-pt, sans-serif',
    falName: 'Futura',
    group: 'fallbacks',
  },
  {
    id: 'futuristic-pt',
    label: 'Futuristic PT',
    fontFamily: 'futuristic-pt, Futura, sans-serif',
    falName: 'Futura',
    group: 'fallbacks',
  },
  {
    id: 'avenir-next',
    label: 'Avenir Next',
    fontFamily: '"Avenir Next", Futura, sans-serif',
    falName: 'Avenir Next',
    group: 'fallbacks',
  },
  {
    id: 'montserrat',
    label: 'Montserrat',
    fontFamily: 'Montserrat, Futura, sans-serif',
    falName: 'Montserrat',
    group: 'fallbacks',
  },
  {
    id: 'sans-serif',
    label: 'Sans-serif (system)',
    fontFamily: 'sans-serif',
    falName: 'sans-serif',
    group: 'fallbacks',
  },
  {
    id: 'serif',
    label: 'Serif (system)',
    fontFamily: 'serif',
    falName: 'serif',
    group: 'fallbacks',
  },
  {
    id: 'cursive',
    label: 'Cursive (system)',
    fontFamily: 'cursive',
    falName: 'cursive',
    group: 'fallbacks',
  },
];

export const DEFAULT_OVERALL_SCORE_FONT_ID = 'cbyg';

export const BRAND_SITE_FONT_OPTIONS = SITE_FONT_OPTIONS.filter((option) => option.group === 'brand');

export function siteFontById(id: string): SiteFontOption | undefined {
  return SITE_FONT_OPTIONS.find((option) => option.id === id);
}

export function siteFontIdFromFamily(
  fontFamily?: string,
  options?: { allowDefault?: boolean }
): string | undefined {
  if (!fontFamily?.trim()) {
    return options?.allowDefault === false ? undefined : DEFAULT_OVERALL_SCORE_FONT_ID;
  }
  const normalized = fontFamily.trim().toLowerCase();
  const hit = SITE_FONT_OPTIONS.find((option) => {
    const primary = option.fontFamily.split(',')[0]?.replace(/"/g, '').trim().toLowerCase();
    return normalized.includes(primary) || fontFamily.includes(option.falName);
  });
  if (hit) return hit.id;
  return options?.allowDefault === false ? undefined : DEFAULT_OVERALL_SCORE_FONT_ID;
}

/** Prefer persisted siteFontId, then match fontFamily, then default. */
export function resolveSiteFontId(style?: { siteFontId?: string; fontFamily?: string }): string {
  if (style?.siteFontId && siteFontById(style.siteFontId)) return style.siteFontId;
  return siteFontIdFromFamily(style?.fontFamily) ?? DEFAULT_OVERALL_SCORE_FONT_ID;
}

export function siteFontStylePatch(id: string): Pick<SiteFontOption, 'fontFamily' | 'textTransform'> & {
  siteFontId: string;
} {
  const option = siteFontById(id) ?? siteFontById(DEFAULT_OVERALL_SCORE_FONT_ID)!;
  return {
    siteFontId: option.id,
    fontFamily: option.fontFamily,
    ...(option.textTransform ? { textTransform: option.textTransform } : {}),
  };
}

export function siteFontFalLabel(fontFamily?: string, siteFontId?: string): string | undefined {
  if (siteFontId) {
    const byId = siteFontById(siteFontId);
    if (byId) return byId.falName;
  }
  if (!fontFamily?.trim()) return undefined;
  for (const option of SITE_FONT_OPTIONS) {
    if (fontFamily.includes(option.falName)) return option.falName;
  }
  const match = fontFamily.match(/"([^"]+)"/);
  return match?.[1] ?? fontFamily.split(',')[0]?.replace(/"/g, '').trim();
}
