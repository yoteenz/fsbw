import type { AnalysisTier, UnitName } from '../types/hairstyleAnalysis';

const ANALYSIS_TEMPLATE_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Analysis';

export const HAIRSTYLE_ANALYSIS_TEMPLATE_URLS: Record<
  Exclude<AnalysisTier, 'black'>,
  string
> = {
  free: `${ANALYSIS_TEMPLATE_BASE}/IMG_2438.png`,
  three_month: `${ANALYSIS_TEMPLATE_BASE}/IMG_2447.png`,
  six_month: `${ANALYSIS_TEMPLATE_BASE}/IMG_2450.png`,
  twelve_month: `${ANALYSIS_TEMPLATE_BASE}/IMG_2451.png`,
};

export const HAIR_COLORS = {
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

export type HairColorName = keyof typeof HAIR_COLORS;

export const UNIT_NAMES: UnitName[] = [
  'NOIR',
  'BLANCO',
  'SOFT WAVE',
  'BEACH WAVE',
  'SOFT CURL',
  'OCEAN CURL',
];

export const BLANCO_COLORS: HairColorName[] = ['GOLDEN', 'PLATINUM', 'ASH'];

export const DEFAULT_UNIT_COLORS: HairColorName[] = [
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

export function allowedColorsForUnit(unit: UnitName): readonly HairColorName[] {
  return unit === 'BLANCO' ? BLANCO_COLORS : DEFAULT_UNIT_COLORS;
}

export function hexForHairColor(color: string): string {
  const key = color.trim().toUpperCase() as HairColorName;
  return HAIR_COLORS[key] ?? '#000000';
}
