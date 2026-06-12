/** Keep in sync with src/data/hairstyleCatalog.ts HAIR_COLORS */
export const HAIR_COLOR_HEX: Record<string, string> = {
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
};

export function hexForHairColorName(color: string): string {
  return HAIR_COLOR_HEX[color.trim().toUpperCase()] ?? '#000000';
}
