/** BAW catalog hair colors — keep aligned with src/data/hairstyleCatalog.ts */

export const CONSULT_HAIR_COLORS = {
  'JET BLACK': '#000000',
  'OFF BLACK': '#160604',
  ESPRESSO: '#3B1301',
  CHESTNUT: '#6C2D11',
  HONEY: '#C58628',
  AUBURN: '#9C5617',
  COPPER: '#802F02',
  GINGER: '#F64F07',
  SANGRIA: '#7E0A1E',
  CHERRY: '#FF1400',
  RASPBERRY: '#DA3063',
  PLUM: '#640E82',
  COBALT: '#290481',
  TEAL: '#46EBCA',
  SLIME: '#03D92A',
  CITRINE: '#E2E91C',
  GOLDEN: '#FBF08B',
  PLATINUM: '#F6F3D2',
  ASH: '#E5E3CB',
} as const;

export type ConsultHairColorName = keyof typeof CONSULT_HAIR_COLORS;

export const CONSULT_DEFAULT_COLORS: ConsultHairColorName[] = [
  'JET BLACK',
  'OFF BLACK',
  'ESPRESSO',
  'CHESTNUT',
  'HONEY',
  'AUBURN',
  'COPPER',
  'GINGER',
  'SANGRIA',
  'CHERRY',
  'RASPBERRY',
  'PLUM',
  'COBALT',
  'TEAL',
  'SLIME',
  'CITRINE',
];

export function normalizeConsultHairColor(raw: string): ConsultHairColorName | null {
  const key = raw.trim().toUpperCase().replace(/\s+/g, ' ') as ConsultHairColorName;
  return key in CONSULT_HAIR_COLORS ? key : null;
}

export function hexForConsultHairColor(color: string): string {
  const key = normalizeConsultHairColor(color);
  return key ? CONSULT_HAIR_COLORS[key] : '#000000';
}

/** Diverse alternates — never reuse inspo color. */
export function pickConsultComparisonColors(
  inspoColor: string,
  count: number
): ConsultHairColorName[] {
  const exclude = normalizeConsultHairColor(inspoColor) ?? 'JET BLACK';
  const preferred: ConsultHairColorName[] = [
    'CHERRY',
    'PLUM',
    'HONEY',
    'COBALT',
    'CHESTNUT',
    'GINGER',
    'TEAL',
    'RASPBERRY',
    'COPPER',
    'SANGRIA',
  ];
  const pool: ConsultHairColorName[] = [];
  for (const c of preferred) {
    if (c !== exclude && !pool.includes(c)) pool.push(c);
  }
  for (const c of CONSULT_DEFAULT_COLORS) {
    if (c !== exclude && !pool.includes(c)) pool.push(c);
  }
  return pool.slice(0, Math.max(0, count));
}
