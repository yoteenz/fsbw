/** Label + hex (no #) for Step 2 fal prompt — subset used by live NOIR color API */
export const BAW_CATALOG_HAIR_COLOR_HEX: Record<
  string,
  { label: string; hex: string }
> = {
  ESPRESSO: { label: 'espresso', hex: '361504' },
  CHESTNUT: { label: 'chestnut', hex: '643118' },
  HONEY: { label: 'honey', hex: 'BB883C' },
  AUBURN: { label: 'auburn', hex: '925927' },
  COPPER: { label: 'copper', hex: '763412' },
  GINGER: { label: 'ginger', hex: 'E35B2A' },
  SANGRIA: { label: 'sangria', hex: '731921' },
  CHERRY: { label: 'cherry', hex: 'FF1400' },
  RASPBERRY: { label: 'raspberry', hex: 'FF2855' },
  PLUM: { label: 'plum', hex: '5B177C' },
  COBALT: { label: 'cobalt', hex: '25067B' },
  TEAL: { label: 'teal', hex: '7BE7CA' },
  SLIME: { label: 'slime', hex: '63D54B' },
  CITRINE: { label: 'citrine', hex: 'E3E851' },
  JET_BLACK: { label: 'jet black', hex: '000000' },
  OFF_BLACK: { label: 'off black', hex: '160604' },
  'JET BLACK': { label: 'jet black', hex: '000000' },
  'OFF BLACK': { label: 'off black', hex: '160604' },
};

export function catalogColorForPrompt(colorId: string): { label: string; hex: string } | null {
  const raw = String(colorId || '').trim().toUpperCase();
  if (raw === 'PINK') return BAW_CATALOG_HAIR_COLOR_HEX.RASPBERRY;
  const spaced = raw;
  const underscored = raw.replace(/\s+/g, '_');
  return (
    BAW_CATALOG_HAIR_COLOR_HEX[spaced] ??
    BAW_CATALOG_HAIR_COLOR_HEX[underscored] ??
    null
  );
}

/**
 * Single **storage / manifest hash** color key.
 * **OFF BLACK** → **`OFF_BLACK`** (its own tier / folder).
 * **JET BLACK** → **`JET_BLACK_OFF_BLACK`** so live previews resolve **existing** batch + legacy Storage paths (same as before OFF BLACK was split out).
 * Must match `scripts/wig-preview/selectionStoragePath.mjs`.
 */
export function canonicalWigPreviewColorForHash(color: string): string {
  const u = String(color || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  const aliases: Record<string, string> = {
    'OFF BLACK': 'OFF_BLACK',
    OFF_BLACK: 'OFF_BLACK',
    'JET BLACK': 'JET_BLACK_OFF_BLACK',
    'JET BLACK OFF BLACK': 'JET_BLACK_OFF_BLACK',
    JET_BLACK: 'JET_BLACK_OFF_BLACK',
    JET_BLACK_OFF_BLACK: 'JET_BLACK_OFF_BLACK',
  };
  if (aliases[u]) return aliases[u];
  const underscored = u.replace(/\s+/g, '_');
  if (aliases[underscored]) return aliases[underscored];
  return underscored;
}
