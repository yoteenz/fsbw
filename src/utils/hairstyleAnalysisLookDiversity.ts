/**
 * Client mirror of api/_lib/hairstyleAnalysisLookDiversity.ts — keep in sync.
 */
import { hexForHairColor, UNIT_NAMES } from '../data/hairstyleCatalog';
import type { UnitName } from '../types/hairstyleAnalysis';

type DiversifiableLook = {
  unit: string;
  color: string;
  hex: string;
  length: string;
  density: string;
  styling: string;
  part: string;
};

const VALID_SALON_STYLES: Record<UnitName, readonly string[]> = {
  NOIR: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  BLANCO: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'BEACH WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
  'OCEAN CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
};

const UNIT_DENSITY: Record<UnitName, string> = {
  NOIR: '250%',
  BLANCO: '250%',
  'SOFT WAVE': '200%',
  'BEACH WAVE': '200%',
  'SOFT CURL': '200%',
  'OCEAN CURL': '200%',
};

const LENGTH_OPTIONS = ['22 INCHES', '24 INCHES', '26 INCHES', '28 INCHES', '30 INCHES'];
const PART_OPTIONS = ['MIDDLE', 'LEFT', 'RIGHT'] as const;

const NEUTRAL_COLORS = ['JET BLACK', 'OFF BLACK', 'ESPRESSO', 'CHESTNUT'] as const;
const BLONDE_COLORS = ['PLATINUM', 'GOLDEN', 'ASH', 'HONEY'] as const;
const VIBRANT_COLORS = ['CHERRY', 'COPPER', 'GINGER', 'PLUM', 'COBALT', 'SANGRIA'] as const;

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function normalizeUnit(unit: string): UnitName | null {
  const key = unit.trim().toUpperCase() as UnitName;
  return UNIT_NAMES.includes(key) ? key : null;
}

function salonStylesForUnit(unitKey: UnitName): string[] {
  return VALID_SALON_STYLES[unitKey].filter((s) => s !== 'NONE');
}

function colorForUnit(unitKey: UnitName, bucket: 'neutral' | 'blonde' | 'vibrant' | 'any'): string {
  if (unitKey === 'BLANCO') return shuffle(BLONDE_COLORS)[0] ?? 'PLATINUM';
  if (bucket === 'blonde') return shuffle(BLONDE_COLORS)[0] ?? 'HONEY';
  if (bucket === 'vibrant') return shuffle(VIBRANT_COLORS)[0] ?? 'CHERRY';
  if (bucket === 'neutral') return shuffle(NEUTRAL_COLORS)[0] ?? 'OFF BLACK';
  return shuffle([...NEUTRAL_COLORS, ...BLONDE_COLORS, ...VIBRANT_COLORS])[0] ?? 'JET BLACK';
}

function isGenericNoirStack(look: DiversifiableLook): boolean {
  const unit = look.unit.trim().toUpperCase();
  const styling = look.styling.trim().toUpperCase();
  return (
    unit === 'NOIR' &&
    (look.color.trim().toUpperCase() === 'JET BLACK' || !look.color.trim()) &&
    (!look.length.trim() || look.length.includes('24')) &&
    (!look.density.trim() || look.density === '250%') &&
    (!styling || styling === 'NONE' || styling === 'FLAT IRON')
  );
}

function needsDiversification(looks: DiversifiableLook[]): boolean {
  if (looks.length === 0) return false;
  if (isGenericNoirStack(looks[0])) return true;
  if (looks.length === 1) return false;
  const units = new Set(looks.map((l) => l.unit.trim().toUpperCase()));
  if (units.size < Math.min(looks.length, 3)) return true;
  const styles = new Set(looks.map((l) => l.styling.trim().toUpperCase() || 'NONE'));
  if (styles.size < Math.min(looks.length, 2)) return true;
  if (looks.every((l) => isGenericNoirStack(l))) return true;
  if (looks.every((l) => !l.length.trim() || l.length.includes('24'))) return true;
  return false;
}

function assignUniqueUnits(count: number, keepFirstUnit: string | null): UnitName[] {
  const shuffled = shuffle(UNIT_NAMES);
  const out: UnitName[] = [];
  const used = new Set<string>();
  const firstKey = keepFirstUnit ? normalizeUnit(keepFirstUnit) : null;
  if (firstKey && count > 0) {
    out.push(firstKey);
    used.add(firstKey);
  }
  for (const unit of shuffled) {
    if (out.length >= count) break;
    if (used.has(unit)) continue;
    out.push(unit);
    used.add(unit);
  }
  while (out.length < count) {
    out.push(UNIT_NAMES[out.length % UNIT_NAMES.length]);
  }
  return out.slice(0, count);
}

function diversifyLook<L extends DiversifiableLook>(
  look: L,
  index: number,
  unitKey: UnitName,
  colorBucket: 'neutral' | 'blonde' | 'vibrant' | 'any'
): L {
  const styles = salonStylesForUnit(unitKey);
  const styling = styles[index % styles.length] ?? styles[0] ?? 'NONE';
  const color = colorForUnit(unitKey, colorBucket);
  const length = LENGTH_OPTIONS[index % LENGTH_OPTIONS.length] ?? '24 INCHES';
  const part = PART_OPTIONS[index % PART_OPTIONS.length] ?? 'MIDDLE';

  return {
    ...look,
    unit: unitKey,
    color,
    hex: hexForHairColor(color),
    length,
    density: UNIT_DENSITY[unitKey],
    styling,
    part,
  };
}

export function diversifyHairstyleAnalysisLooks<L extends DiversifiableLook>(
  topMatch: L,
  additionalLooks: L[]
): { topMatch: L; additionalLooks: L[] } {
  const all = [topMatch, ...additionalLooks];
  if (!needsDiversification(all)) {
    return { topMatch, additionalLooks };
  }

  const keepTopUnit =
    !isGenericNoirStack(topMatch) && normalizeUnit(topMatch.unit) ? topMatch.unit : null;
  const units = assignUniqueUnits(all.length, keepTopUnit);
  const colorBuckets: Array<'neutral' | 'blonde' | 'vibrant' | 'any'> =
    all.length === 1
      ? ['any']
      : ['neutral', 'blonde', 'vibrant', ...Array.from({ length: all.length - 3 }, () => 'any' as const)];

  return {
    topMatch: diversifyLook(topMatch, 0, units[0], colorBuckets[0] ?? 'any'),
    additionalLooks: additionalLooks.map((look, i) =>
      diversifyLook(look, i + 1, units[i + 1] ?? units[0], colorBuckets[i + 1] ?? 'any')
    ),
  };
}
