/** BCF closure/frontal color palette for Fal photo recolor batch. Bundles excluded. */

export const BCF_CF_PHOTO_PROMPT_VERSION = 'v1';

/** Colors to generate (OFF BLACK uses default black hero — no separate PNG). */
export const BCF_CF_PHOTO_COLORS = [
  { id: 'JET BLACK', promptName: 'JET BLACK', hex: '#000000' },
  { id: 'ESPRESSO', promptName: 'ESPRESSO', hex: '#3B1301' },
  { id: 'CHESTNUT', promptName: 'CHESTNUT', hex: '#6C2D11' },
  { id: 'HONEY', promptName: 'HONEY', hex: '#C58628' },
  { id: 'AUBURN', promptName: 'AUBURN', hex: '#9C5617' },
  { id: 'COPPER', promptName: 'COPPER', hex: '#802F02' },
  { id: 'GINGER', promptName: 'GINGER', hex: '#F64F07' },
  { id: 'SANGRIA', promptName: 'SANGRIA', hex: '#7E0A1E' },
  { id: 'CHERRY', promptName: 'CHERRY', hex: '#FF1400' },
  { id: 'RASPBERRY', promptName: 'RASPBERRY', hex: '#DA3063' },
  { id: 'PLUM', promptName: 'PLUM', hex: '#640E82' },
  { id: 'COBALT', promptName: 'COBALT', hex: '#290481' },
  { id: 'TEAL', promptName: 'TEAL', hex: '#46EBCA' },
  { id: 'SLIME', promptName: 'SLIME', hex: '#03D92A' },
  { id: 'CITRINE', promptName: 'CITRINE', hex: '#E2E91C' },
  { id: 'GOLDEN', promptName: 'GOLDEN BLONDE', hex: '#FBF08B' },
  { id: 'PLATINUM', promptName: 'PLATINUM BLONDE', hex: '#F6F3D2' },
  { id: 'ASH', promptName: 'ASH BLONDE', hex: '#E5E3CB' },
];

export const BCF_CF_PHOTO_BLONDE_IDS = new Set(['GOLDEN', 'PLATINUM', 'ASH']);

export function colorById(colorId) {
  return BCF_CF_PHOTO_COLORS.find((c) => c.id === colorId) ?? null;
}
