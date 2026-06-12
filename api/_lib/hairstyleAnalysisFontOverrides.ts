export type HairstyleAnalysisFontOverrides = Record<
  string,
  {
    siteFontId?: string;
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    fontWeight?: string;
    letterSpacing?: string;
    textAlign?: string;
    textTransform?: string;
  }
>;

export function parseHairstyleAnalysisFontOverrides(
  raw: unknown
): HairstyleAnalysisFontOverrides | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: HairstyleAnalysisFontOverrides = {};
  for (const [slotId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const slot = value as Record<string, unknown>;
    const entry: HairstyleAnalysisFontOverrides[string] = {};
    for (const key of [
      'siteFontId',
      'fontFamily',
      'fontSize',
      'color',
      'fontWeight',
      'letterSpacing',
      'textAlign',
      'textTransform',
    ] as const) {
      const v = slot[key];
      if (typeof v === 'string' && v.trim()) entry[key] = v.trim();
    }
    if (Object.keys(entry).length > 0) out[slotId] = entry;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

const KNOWN_FAL_FONT_LABELS: Array<[needle: string, label: string]> = [
  ['Futura PT Book', 'Futura PT Book'],
  ['Futura PT Medium', 'Futura PT Medium'],
  ['Futura PT Demi', 'Futura PT Demi'],
  ['Bohemy', 'Bohemy'],
  ['Covered By Your Grace', 'Covered By Your Grace'],
  ['Avenir Next', 'Avenir Next'],
  ['Montserrat', 'Montserrat'],
  ['Futuristic PT', 'Futura'],
  ['futuristic-pt', 'Futura'],
  ['Inter', 'Inter'],
  ['Futura', 'Futura'],
];

const SITE_FONT_ID_TO_FAL: Record<string, string> = {
  'futura-book': 'Futura PT Book',
  'futura-medium': 'Futura PT Medium',
  'futura-demi': 'Futura PT Demi',
  bohemy: 'Bohemy',
  cbyg: 'Covered By Your Grace',
  'booking-medium': 'Futura PT Medium',
  'booking-book': 'Futura PT Book',
  'booking-script': 'Covered By Your Grace',
  'card-medium-stack': 'Futura PT Medium',
  'card-demi-stack': 'Futura PT Demi',
  inter: 'Inter',
  futura: 'Futura',
  'futuristic-pt': 'Futura',
  'avenir-next': 'Avenir Next',
  montserrat: 'Montserrat',
  'sans-serif': 'sans-serif',
  serif: 'serif',
  cursive: 'cursive',
};

/** Map saved debug font overrides to a Fal prompt label. */
export function overallScoreFontPromptLabel(
  fontFamily?: string,
  siteFontId?: string
): string | undefined {
  if (siteFontId && SITE_FONT_ID_TO_FAL[siteFontId]) return SITE_FONT_ID_TO_FAL[siteFontId];
  if (!fontFamily?.trim()) return undefined;
  for (const [needle, label] of KNOWN_FAL_FONT_LABELS) {
    if (fontFamily.includes(needle)) return label;
  }
  const match = fontFamily.match(/"([^"]+)"/);
  return match?.[1] ?? fontFamily.split(',')[0]?.replace(/"/g, '').trim();
}
