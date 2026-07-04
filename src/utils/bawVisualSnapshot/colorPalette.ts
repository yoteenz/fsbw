/**
 * Approved Frontal Slayer hair colors — do not invent colors.
 * Hex source of truth: `api/_lib/bawCatalogHairColors.ts` + BLANCO-only UI colors.
 */

export type ApprovedHairColor = {
  name: string;
  slug: string;
  hex: string;
  displayOrder: number;
  /** BLANCO-only colors are excluded from other units in the UI. */
  blancoOnly?: boolean;
};

const CATALOG: ApprovedHairColor[] = [
  { name: 'JET BLACK', slug: 'jet-black', hex: '#000000', displayOrder: 1 },
  { name: 'OFF BLACK', slug: 'off-black', hex: '#160604', displayOrder: 2 },
  { name: 'ESPRESSO', slug: 'espresso', hex: '#361504', displayOrder: 3 },
  { name: 'CHESTNUT', slug: 'chestnut', hex: '#643118', displayOrder: 4 },
  { name: 'HONEY', slug: 'honey', hex: '#BB883C', displayOrder: 5 },
  { name: 'AUBURN', slug: 'auburn', hex: '#925927', displayOrder: 6 },
  { name: 'COPPER', slug: 'copper', hex: '#763412', displayOrder: 7 },
  { name: 'GINGER', slug: 'ginger', hex: '#E35B2A', displayOrder: 8 },
  { name: 'SANGRIA', slug: 'sangria', hex: '#731921', displayOrder: 9 },
  { name: 'CHERRY', slug: 'cherry', hex: '#FF1400', displayOrder: 10 },
  { name: 'RASPBERRY', slug: 'raspberry', hex: '#DA3063', displayOrder: 11 },
  { name: 'PLUM', slug: 'plum', hex: '#5B177C', displayOrder: 12 },
  { name: 'COBALT', slug: 'cobalt', hex: '#25067B', displayOrder: 13 },
  { name: 'TEAL', slug: 'teal', hex: '#7BE7CA', displayOrder: 14 },
  { name: 'SLIME', slug: 'slime', hex: '#63D54B', displayOrder: 15 },
  { name: 'CITRINE', slug: 'citrine', hex: '#E3E851', displayOrder: 16 },
  { name: 'GOLDEN', slug: 'golden', hex: '#FBF08B', displayOrder: 17, blancoOnly: true },
  { name: 'PLATINUM', slug: 'platinum', hex: '#F6F3D2', displayOrder: 18, blancoOnly: true },
  { name: 'ASH', slug: 'ash', hex: '#E5E3CB', displayOrder: 19, blancoOnly: true },
];

const BY_NAME = new Map<string, ApprovedHairColor>();
for (const c of CATALOG) {
  BY_NAME.set(c.name.toUpperCase(), c);
  BY_NAME.set(c.slug.toUpperCase(), c);
  BY_NAME.set(c.slug.replace(/-/g, '_').toUpperCase(), c);
}

export const APPROVED_HAIR_COLORS: readonly ApprovedHairColor[] = CATALOG;

export function normalizeColorName(color: string | undefined): string {
  const raw = String(color || 'OFF BLACK')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  if (raw === 'PINK') return 'RASPBERRY';
  return raw;
}

export function getApprovedColorMeta(color: string | undefined): ApprovedHairColor {
  const norm = normalizeColorName(color);
  return (
    BY_NAME.get(norm) ??
    BY_NAME.get(norm.replace(/\s+/g, '_')) ?? {
      name: norm,
      slug: norm.toLowerCase().replace(/\s+/g, '-'),
      hex: '#160604',
      displayOrder: 999,
    }
  );
}

export function colorNameToSlug(color: string | undefined): string {
  return getApprovedColorMeta(color).slug;
}
