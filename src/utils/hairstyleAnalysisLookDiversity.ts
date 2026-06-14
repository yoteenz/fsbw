/**
 * Client mirror of api/_lib/hairstyleAnalysisLookDiversity.ts — keep in sync.
 * No printed TOP MATCH / MATCH row spec is a static template default.
 */
import { allowedColorsForUnit, hexForHairColor, UNIT_NAMES } from '../data/hairstyleCatalog';
import type { UnitName } from '../types/hairstyleAnalysis';

type DiversifiableLook = {
  unit: string;
  color: string;
  hex: string;
  length: string;
  lace: string;
  density: string;
  styling: string;
  part: string;
  hairline?: string;
};

const LACE_OPTIONS = ['13X6 HD', '13X4 HD'] as const;
const DENSITY_OPTIONS = ['200%', '250%', '300%'] as const;

const LENGTH_OPTIONS = ['22 INCHES', '24 INCHES', '26 INCHES', '28 INCHES', '30 INCHES'];
const PART_OPTIONS = ['MIDDLE', 'LEFT', 'RIGHT'] as const;
const COLOR_BUCKETS = ['neutral', 'blonde', 'vivid', 'any'] as const;

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

function generationVariationIndex(): number {
  return Math.floor(Math.random() * 12);
}

function normalizeUnit(unit: string): UnitName | null {
  const key = unit.trim().toUpperCase() as UnitName;
  return UNIT_NAMES.includes(key) ? key : null;
}

function pickAllowedColor(
  unitKey: UnitName,
  bucket: 'neutral' | 'blonde' | 'vivid' | 'any'
): string {
  const allowed = allowedColorsForUnit(unitKey);
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
  if (bucket === 'vivid') return shuffle(vibrant)[0] ?? allowed[0];
  return shuffle([...neutral, ...light, ...vibrant])[0] ?? allowed[0];
}

function colorForUnit(unitKey: UnitName, bucket: 'neutral' | 'blonde' | 'vivid' | 'any'): string {
  return pickAllowedColor(unitKey, bucket);
}

function isDefaultLace(lace: string): boolean {
  const n = lace.trim().toUpperCase().replace(/\s*LACE\s*$/i, '');
  return !n || n === '13X6' || n === '13X6 HD';
}

function isDefaultPart(part: string): boolean {
  const n = part.trim().toUpperCase().replace(/\s*PART\s*$/i, '');
  return !n || n === 'MIDDLE';
}

function isDefaultHairline(hairline: string | undefined): boolean {
  const n = (hairline ?? '').trim().toUpperCase().replace(/\s*HAIRLINE\s*$/i, '');
  return !n || n === 'NATURAL';
}

function isDefaultDensity(density: string): boolean {
  const n = density.trim().replace(/\s*DENSITY\s*$/i, '');
  return !n || n === '250%' || n === '200%';
}

function isDefaultStyling(styling: string): boolean {
  const n = styling.trim().toUpperCase();
  return !n || n === 'NONE';
}

function isGenericNoirStack(look: DiversifiableLook): boolean {
  const unit = look.unit.trim().toUpperCase();
  const styling = look.styling.trim().toUpperCase();
  return (
    unit === 'NOIR' &&
    (look.color.trim().toUpperCase() === 'JET BLACK' || !look.color.trim()) &&
    (!look.length.trim() || look.length.includes('24')) &&
    isDefaultDensity(look.density) &&
    isDefaultLace(look.lace) &&
    isDefaultPart(look.part) &&
    (!styling || styling === 'NONE' || styling === 'FLAT IRON')
  );
}

function isStubbornDefaultStack(look: DiversifiableLook): boolean {
  if (isGenericNoirStack(look)) return true;
  const length = look.length.trim().toUpperCase();
  const commonLength = !length || /^(22|24)\s*INCH/.test(length);
  return (
    commonLength &&
    isDefaultLace(look.lace) &&
    isDefaultDensity(look.density) &&
    isDefaultPart(look.part) &&
    isDefaultHairline(look.hairline) &&
    isDefaultStyling(look.styling)
  );
}

function needsDiversification(looks: DiversifiableLook[]): boolean {
  if (looks.length === 0) return false;
  if (isStubbornDefaultStack(looks[0])) return true;
  if (looks.length === 1) return false;
  const units = new Set(looks.map((l) => l.unit.trim().toUpperCase()));
  if (units.size < Math.min(looks.length, 3)) return true;
  const styles = new Set(looks.map((l) => l.styling.trim().toUpperCase() || 'NONE'));
  if (styles.size < Math.min(looks.length, 2)) return true;
  if (looks.every((l) => isGenericNoirStack(l))) return true;
  if (looks.every((l) => !l.length.trim() || l.length.includes('24'))) return true;
  return false;
}

function assignUnitsForBuckets(
  count: number,
  keepFirstUnit: string | null,
  buckets: Array<'neutral' | 'blonde' | 'vivid' | 'any'>
): UnitName[] {
  const out: UnitName[] = new Array(count);
  const used = new Set<string>();
  const shuffled = shuffle(UNIT_NAMES);

  const firstKey = keepFirstUnit ? normalizeUnit(keepFirstUnit) : null;
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
    const fallback = UNIT_NAMES.find((u) => !used.has(u)) ?? UNIT_NAMES[i % UNIT_NAMES.length];
    out[i] = fallback;
    used.add(fallback);
  }

  return out;
}

/** Rotate lace, density, part when still on template defaults — preserves explicit PSA picks. */
export function varyInstallSpecs<L extends DiversifiableLook>(look: L, index = 0): L {
  const laceOrder = shuffle(LACE_OPTIONS);
  const densityOrder = shuffle(DENSITY_OPTIONS);
  const partOrder = shuffle(PART_OPTIONS);

  return {
    ...look,
    lace: isDefaultLace(look.lace)
      ? (laceOrder[index % laceOrder.length] ?? LACE_OPTIONS[0])
      : look.lace,
    density: isDefaultDensity(look.density)
      ? (densityOrder[index % densityOrder.length] ?? DENSITY_OPTIONS[1])
      : look.density,
    part: isDefaultPart(look.part)
      ? (partOrder[index % partOrder.length] ?? PART_OPTIONS[0])
      : look.part,
    hairline: 'NATURAL HAIRLINE',
    styling: isDefaultStyling(look.styling) ? 'NONE' : look.styling,
  };
}

function diversifyLook<L extends DiversifiableLook>(
  look: L,
  index: number,
  unitKey: UnitName,
  colorBucket: 'neutral' | 'blonde' | 'vivid' | 'any'
): L {
  const styling = isDefaultStyling(look.styling) ? 'NONE' : look.styling.trim().toUpperCase();
  const color = colorForUnit(unitKey, colorBucket);
  const length = shuffle(LENGTH_OPTIONS)[index % LENGTH_OPTIONS.length] ?? '24 INCHES';

  return varyInstallSpecs(
    {
      ...look,
      unit: unitKey,
      color,
      hex: hexForHairColor(color),
      length,
      styling,
    },
    index
  );
}

function varyTopMatchPerGeneration<L extends DiversifiableLook>(topMatch: L, genIdx: number): L {
  const unitKey = normalizeUnit(topMatch.unit);
  if (!unitKey) return varyInstallSpecs(topMatch, genIdx);
  const bucket = shuffle(COLOR_BUCKETS)[genIdx % COLOR_BUCKETS.length] ?? 'any';
  return diversifyLook(topMatch, genIdx, unitKey, bucket);
}

export function diversifyHairstyleAnalysisLooks<L extends DiversifiableLook>(
  topMatch: L,
  additionalLooks: L[]
): { topMatch: L; additionalLooks: L[] } {
  const all = [topMatch, ...additionalLooks];
  const genIdx = generationVariationIndex();

  if (!needsDiversification(all)) {
    const diversifiedTop =
      additionalLooks.length === 0 ? varyTopMatchPerGeneration(topMatch, genIdx) : varyInstallSpecs(topMatch, genIdx);

    return {
      topMatch: diversifiedTop,
      additionalLooks: additionalLooks.map((look, i) => varyInstallSpecs(look, genIdx + i + 1)),
    };
  }

  const keepTopUnit =
    !isGenericNoirStack(topMatch) && normalizeUnit(topMatch.unit) ? topMatch.unit : null;
  const colorBuckets: Array<'neutral' | 'blonde' | 'vivid' | 'any'> =
    all.length === 1
      ? [shuffle(COLOR_BUCKETS)[0] ?? 'any']
      : ['neutral', 'blonde', 'vivid', ...Array.from({ length: all.length - 3 }, () => 'any' as const)];
  const units = assignUnitsForBuckets(all.length, keepTopUnit, colorBuckets);

  return {
    topMatch: diversifyLook(topMatch, genIdx, units[0], colorBuckets[0] ?? 'any'),
    additionalLooks: additionalLooks.map((look, i) =>
      diversifyLook(look, genIdx + i + 1, units[i + 1] ?? units[0], colorBuckets[i + 1] ?? 'any')
    ),
  };
}
