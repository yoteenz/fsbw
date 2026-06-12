export type HairstyleAnalysisFontOverrides = Record<
  string,
  {
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

/** Map saved debug fontFamily to a Fal prompt label. */
export function overallScoreFontPromptLabel(fontFamily?: string): string | undefined {
  if (!fontFamily?.trim()) return undefined;
  const known: Array<[needle: string, label: string]> = [
    ['Futura PT Book', 'Futura PT Book'],
    ['Futura PT Medium', 'Futura PT Medium'],
    ['Futura PT Demi', 'Futura PT Demi'],
    ['Bohemy', 'Bohemy'],
    ['Covered By Your Grace', 'Covered By Your Grace'],
  ];
  for (const [needle, label] of known) {
    if (fontFamily.includes(needle)) return label;
  }
  const match = fontFamily.match(/"([^"]+)"/);
  return match?.[1];
}
