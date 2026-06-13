import { allowedColorsForUnit, UNIT_NAMES } from '../data/hairstyleCatalog';
import type { UnitName } from '../types/hairstyleAnalysis';

/** Categorized manifest fields sent to Fal (TOP MATCH + MATCH 02–04). */
export type ManifestLookDraft = {
  unit: UnitName;
  color: string;
  length: string;
  lace: string;
  density: string;
  part: string;
  hairline: string;
  styling: string;
};

export type ManifestSpecCategory = {
  id: keyof ManifestLookDraft;
  label: string;
  description?: string;
};

export const MANIFEST_SPEC_CATEGORIES: ManifestSpecCategory[] = [
  { id: 'unit', label: 'Texture', description: 'Catalog unit' },
  { id: 'color', label: 'Color', description: 'Allowed per unit' },
  { id: 'length', label: 'Length', description: 'Install length' },
  { id: 'lace', label: 'Lace', description: 'Frontal lace size' },
  { id: 'density', label: 'Density', description: 'Install density' },
  { id: 'part', label: 'Part', description: 'Scalp part line' },
  { id: 'hairline', label: 'Hairline', description: 'Forehead lace-edge shape' },
  { id: 'styling', label: 'Style', description: 'Salon finish' },
];

export const MANIFEST_LENGTH_OPTIONS = [
  '22 INCHES',
  '24 INCHES',
  '26 INCHES',
  '28 INCHES',
  '30 INCHES',
] as const;

export const MANIFEST_LACE_OPTIONS = ['13X6 HD', '13X4 HD'] as const;

export const MANIFEST_DENSITY_OPTIONS = ['200%', '250%', '300%'] as const;

export const MANIFEST_PART_OPTIONS = ['MIDDLE', 'LEFT', 'RIGHT'] as const;

export const MANIFEST_HAIRLINE_OPTIONS = ['NATURAL', 'PEAK', 'LAGOS', 'LAGOS + PEAK'] as const;

const SALON_STYLES_BY_UNIT: Record<UnitName, readonly string[]> = {
  NOIR: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  BLANCO: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'BEACH WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
  'OCEAN CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
};

export function stylingOptionsForUnit(unit: UnitName): readonly string[] {
  return SALON_STYLES_BY_UNIT[unit] ?? ['NONE'];
}

export function colorOptionsForUnit(unit: UnitName): readonly string[] {
  return allowedColorsForUnit(unit);
}

export function defaultTopMatchManifest(): ManifestLookDraft {
  return {
    unit: 'NOIR',
    color: 'JET BLACK',
    length: '24 INCHES',
    lace: '13X6 HD',
    density: '250%',
    part: 'MIDDLE',
    hairline: 'PEAK',
    styling: 'NONE',
  };
}

export function defaultAdditionalManifests(): ManifestLookDraft[] {
  return [
    {
      unit: 'SOFT WAVE',
      color: 'OFF BLACK',
      length: '26 INCHES',
      lace: '13X6 HD',
      density: '250%',
      part: 'LEFT',
      hairline: 'LAGOS',
      styling: 'NONE',
    },
    {
      unit: 'BLANCO',
      color: 'PLATINUM',
      length: '24 INCHES',
      lace: '13X6 HD',
      density: '250%',
      part: 'MIDDLE',
      hairline: 'LAGOS + PEAK',
      styling: 'CRIMPS',
    },
    {
      unit: 'OCEAN CURL',
      color: 'CHERRY',
      length: '22 INCHES',
      lace: '13X4 HD',
      density: '300%',
      part: 'MIDDLE',
      hairline: 'PEAK',
      styling: 'DEFINE',
    },
  ];
}

/** When unit changes, keep valid color/style or fall back to catalog defaults. */
export function normalizeManifestDraft(draft: ManifestLookDraft): ManifestLookDraft {
  const unit = UNIT_NAMES.includes(draft.unit) ? draft.unit : 'NOIR';
  const colors = colorOptionsForUnit(unit);
  const styles = stylingOptionsForUnit(unit);
  const color = colors.includes(draft.color.trim().toUpperCase() as (typeof colors)[number])
    ? draft.color.trim().toUpperCase()
    : colors[0];
  const styling = styles.includes(draft.styling.trim().toUpperCase())
    ? draft.styling.trim().toUpperCase()
    : 'NONE';
  const length = MANIFEST_LENGTH_OPTIONS.includes(draft.length as (typeof MANIFEST_LENGTH_OPTIONS)[number])
    ? draft.length
    : '24 INCHES';
  const lace = MANIFEST_LACE_OPTIONS.includes(draft.lace as (typeof MANIFEST_LACE_OPTIONS)[number])
    ? draft.lace
    : '13X6 HD';
  const density = MANIFEST_DENSITY_OPTIONS.includes(draft.density as (typeof MANIFEST_DENSITY_OPTIONS)[number])
    ? draft.density
    : '250%';
  const part = MANIFEST_PART_OPTIONS.includes(draft.part as (typeof MANIFEST_PART_OPTIONS)[number])
    ? draft.part
    : 'MIDDLE';
  const hairline = MANIFEST_HAIRLINE_OPTIONS.includes(
    draft.hairline.trim().toUpperCase() as (typeof MANIFEST_HAIRLINE_OPTIONS)[number]
  )
    ? draft.hairline.trim().toUpperCase()
    : 'NATURAL';

  return { unit, color, length, lace, density, part, hairline, styling };
}

export function optionsForManifestField(
  field: keyof ManifestLookDraft,
  draft: ManifestLookDraft
): readonly string[] {
  const normalized = normalizeManifestDraft(draft);
  switch (field) {
    case 'unit':
      return UNIT_NAMES;
    case 'color':
      return colorOptionsForUnit(normalized.unit);
    case 'length':
      return MANIFEST_LENGTH_OPTIONS;
    case 'lace':
      return MANIFEST_LACE_OPTIONS;
    case 'density':
      return MANIFEST_DENSITY_OPTIONS;
    case 'part':
      return MANIFEST_PART_OPTIONS;
    case 'hairline':
      return MANIFEST_HAIRLINE_OPTIONS;
    case 'styling':
      return stylingOptionsForUnit(normalized.unit);
    default:
      return [];
  }
}
