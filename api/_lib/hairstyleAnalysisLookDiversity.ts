/**
 * Ensure TOP MATCH + additional looks vary across units, salon styles, lengths, and colors
 * instead of collapsing to NOIR 24" 250% FLAT IRON / LAYERS on every generate.
 */
import {
  allowedColorsForCatalogUnit,
  CATALOG_UNITS,
  normalizeCatalogUnit,
  type CatalogUnitName,
} from './hairstyleAnalysisUnitCatalog.js';
import { hexForHairColorName } from './hairstyleHairColors.js';

type DiversifiableLook = {
  unit: string;
  color: string;
  hex: string;
  length: string;
  density: string;
  styling: string;
  part: string;
};

const VALID_SALON_STYLES: Record<CatalogUnitName, readonly string[]> = {
  NOIR: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  BLANCO: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'BEACH WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
  'OCEAN CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
};

const UNIT_DENSITY: Record<CatalogUnitName, string> = {
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
const LIGHT_NEUTRAL_COLORS = ['HONEY', 'CHESTNUT'] as const;
const VIBRANT_COLORS = ['CHERRY', 'COPPER', 'GINGER', 'PLUM', 'COBALT', 'SANGRIA', 'RASPBERRY', 'TEAL', 'SLIME', 'CITRINE'] as const;

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function salonStylesForUnit(unitKey: CatalogUnitName): string[] {
  return VALID_SALON_STYLES[unitKey].filter((s) => s !== 'NONE');
}

function pickAllowedColor(
  unitKey: CatalogUnitName,
  bucket: 'neutral' | 'blonde' | 'vibrant' | 'any'
): string {
  const allowed = allowedColorsForCatalogUnit(unitKey);
  const allowedSet = new Set(allowed.map((c) => c.toUpperCase()));
  const filter = (colors: readonly string[]) =>
    colors.filter((c) => allowedSet.has(c.toUpperCase()));

  if (unitKey === 'BLANCO') {
    return shuffle(filter(['GOLDEN', 'PLATINUM', 'ASH']))[0] ?? 'PLATINUM';
  }

  const neutral = filter(NEUTRAL_COLORS);
  const light = filter(LIGHT_NEUTRAL_COLORS);
  const vibrant = filter(VIBRANT_COLORS);

  if (bucket === 'neutral') return shuffle(neutral)[0] ?? allowed[0];
  if (bucket === 'blonde') return shuffle(light.length ? light : neutral)[0] ?? allowed[0];
  if (bucket === 'vibrant') return shuffle(vibrant)[0] ?? allowed[0];
  return shuffle([...neutral, ...light, ...vibrant])[0] ?? allowed[0];
}

function colorForUnit(unitKey: CatalogUnitName, bucket: 'neutral' | 'blonde' | 'vibrant' | 'any'): string {
  return pickAllowedColor(unitKey, bucket);
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

function uniqueUnitCount(looks: DiversifiableLook[]): number {
  return new Set(looks.map((l) => l.unit.trim().toUpperCase())).size;
}

function uniqueStyleCount(looks: DiversifiableLook[]): number {
  return new Set(looks.map((l) => l.styling.trim().toUpperCase() || 'NONE')).size;
}

function needsDiversification(looks: DiversifiableLook[]): boolean {
  if (looks.length === 0) return false;
  if (isGenericNoirStack(looks[0])) return true;
  if (looks.length === 1) return false;
  if (uniqueUnitCount(looks) < Math.min(looks.length, 3)) return true;
  if (uniqueStyleCount(looks) < Math.min(looks.length, 2)) return true;
  if (looks.every((l) => isGenericNoirStack(l))) return true;
  if (looks.every((l) => !l.length.trim() || l.length.includes('24'))) return true;
  return false;
}

function assignUnitsForBuckets(
  count: number,
  keepFirstUnit: string | null,
  buckets: Array<'neutral' | 'blonde' | 'vibrant' | 'any'>
): CatalogUnitName[] {
  const out: CatalogUnitName[] = new Array(count);
  const used = new Set<string>();
  const shuffled = shuffle(CATALOG_UNITS);

  const firstKey = keepFirstUnit ? normalizeCatalogUnit(keepFirstUnit) : null;
  if (firstKey && count > 0) {
    out[0] = firstKey;
    used.add(firstKey);
  }

  buckets.forEach((bucket, i) => {
    if (out[i] || bucket !== 'blonde') return;
    out[i] = 'BLANCO';
    used.add('BLANCO');
  });

  let poolIdx = 0;
  for (let i = 0; i < count; i++) {
    if (out[i]) continue;
    while (poolIdx < shuffled.length && used.has(shuffled[poolIdx])) poolIdx++;
    if (poolIdx < shuffled.length) {
      out[i] = shuffled[poolIdx];
      used.add(shuffled[poolIdx]);
      poolIdx++;
      continue;
    }
    const fallback = CATALOG_UNITS.find((u) => !used.has(u)) ?? CATALOG_UNITS[i % CATALOG_UNITS.length];
    out[i] = fallback;
    used.add(fallback);
  }

  return out;
}

function diversifyLook<L extends DiversifiableLook>(
  look: L,
  index: number,
  unitKey: CatalogUnitName,
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
    hex: hexForHairColorName(color),
    length,
    density: UNIT_DENSITY[unitKey],
    styling,
    part,
  };
}

/** Rotate units, styles, lengths, and color families when picks are too repetitive. */
export function diversifyHairstyleAnalysisLooks<L extends DiversifiableLook>(
  topMatch: L,
  additionalLooks: L[]
): { topMatch: L; additionalLooks: L[] } {
  const all = [topMatch, ...additionalLooks];
  if (!needsDiversification(all)) {
    return { topMatch, additionalLooks };
  }

  const keepTopUnit =
    !isGenericNoirStack(topMatch) && normalizeCatalogUnit(topMatch.unit) ? topMatch.unit : null;
  const colorBuckets: Array<'neutral' | 'blonde' | 'vibrant' | 'any'> =
    all.length === 1
      ? ['any']
      : ['neutral', 'blonde', 'vibrant', ...Array.from({ length: all.length - 3 }, () => 'any' as const)];
  const units = assignUnitsForBuckets(all.length, keepTopUnit, colorBuckets);

  const diversifiedTop = diversifyLook(topMatch, 0, units[0], colorBuckets[0] ?? 'any');
  const diversifiedAlts = additionalLooks.map((look, i) =>
    diversifyLook(look, i + 1, units[i + 1] ?? units[0], colorBuckets[i + 1] ?? 'any')
  );

  return { topMatch: diversifiedTop, additionalLooks: diversifiedAlts };
}
