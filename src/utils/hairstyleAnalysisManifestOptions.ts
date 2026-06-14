import { allowedColorsForUnit, UNIT_NAMES } from '../data/hairstyleCatalog';
import type { UnitName } from '../types/hairstyleAnalysis';
import {
  DENSITY_OPTIONS,
  HAIRLINE_OPTIONS,
  LACE_OPTIONS,
  LENGTH_OPTIONS,
  STYLING_OPTIONS,
  STYLING_OPTIONS_CURLY,
  type UnitId,
} from './productOptions';
import { bcfLaceOptionsForCategory } from './bcfProductOptions';

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

export type ManifestLaceOptionGroup = {
  label: string;
  options: readonly string[];
};

const UNIT_NAME_TO_ID: Record<UnitName, UnitId> = {
  NOIR: 'noir',
  BLANCO: 'blanco',
  'SOFT WAVE': 'soft-wave',
  'BEACH WAVE': 'beach-wave',
  'SOFT CURL': 'soft-curl',
  'OCEAN CURL': 'ocean-curl',
};

/** BAW length labels (16"–40") → analysis storage (24 INCHES). */
export function analysisLengthFromBaw(length: string): string {
  const t = length.trim().toUpperCase();
  if (/\d+\s*INCH/i.test(t)) {
    const m = t.match(/(\d+)/);
    return m ? `${m[1]} INCHES` : t;
  }
  const m = t.match(/(\d+)/);
  return m ? `${m[1]} INCHES` : '24 INCHES';
}

/** Analysis / manifest length → BAW dropdown label (e.g. 24"). */
export function bawLengthLabel(length: string): string {
  const m = length.match(/(\d+)/);
  return m ? `${m[1]}"` : length;
}

export function normalizeLaceValue(lace: string): string {
  return lace
    .trim()
    .toUpperCase()
    .replace(/\s*LACE\s*$/i, '')
    .replace(/\s*HD\s*$/i, '')
    .trim();
}

export function normalizeHairlineValue(hairline: string): string {
  const h = hairline.trim().toUpperCase().replace(/\s*HAIRLINE\s*$/i, '');
  if (!h || h === 'NATURAL') return 'NATURAL';
  if (h.includes('LAGOS') && h.includes('PEAK')) return 'LAGOS + PEAK';
  if (h.includes('LAGOS')) return 'LAGOS';
  if (h.includes('PEAK')) return 'PEAK';
  return h;
}

export function normalizePartValue(part: string): string {
  const p = part.trim().toUpperCase().replace(/\s*PART\s*$/i, '').replace(/^PART\s+/i, '');
  if (p === 'LEFT' || p === 'RIGHT' || p === 'MIDDLE') return p;
  return 'MIDDLE';
}

export function normalizeDensityValue(density: string): string {
  const d = density.trim().replace(/\s*DENSITY\s*$/i, '');
  return d.includes('%') ? d : `${d}%`;
}

/** Full BAW length range from length sub-page. */
export const MANIFEST_LENGTH_OPTIONS = LENGTH_OPTIONS.map(analysisLengthFromBaw);

/** Full BAW lace list — closures, frontals, 360, full cap (lace sub-page). */
export const MANIFEST_LACE_OPTIONS = [...LACE_OPTIONS] as readonly string[];

export const MANIFEST_LACE_OPTION_GROUPS: ManifestLaceOptionGroup[] = [
  { label: 'Closures', options: bcfLaceOptionsForCategory('closures').map((l) => l.id) },
  { label: 'Frontals', options: bcfLaceOptionsForCategory('frontals').map((l) => l.id) },
  { label: 'Full cap', options: ['360', 'FULL'] },
];

/** Full BAW density range from density sub-page. */
export const MANIFEST_DENSITY_OPTIONS = [...DENSITY_OPTIONS] as readonly string[];

export const MANIFEST_PART_OPTIONS = ['MIDDLE', 'LEFT', 'RIGHT'] as const;

/** BAW hairline sub-page — LAGOS + PEAK shown as combo label. */
export const MANIFEST_HAIRLINE_OPTIONS = HAIRLINE_OPTIONS.map((h) =>
  h === 'LAGOS, PEAK' ? 'LAGOS + PEAK' : h
) as readonly string[];

export const MANIFEST_SPEC_CATEGORIES: ManifestSpecCategory[] = [
  { id: 'unit', label: 'Texture', description: 'Catalog unit' },
  { id: 'color', label: 'Color', description: 'Allowed per unit' },
  { id: 'length', label: 'Length', description: '16"–40" (length sub-page)' },
  { id: 'lace', label: 'Lace', description: 'Closures, frontals & full cap' },
  { id: 'density', label: 'Density', description: '130%–400%' },
  { id: 'part', label: 'Part', description: 'Styling sub-page parting' },
  { id: 'hairline', label: 'Hairline', description: 'Natural, peak, Lagos, combo' },
  { id: 'styling', label: 'Style', description: 'Salon finish + bangs combos' },
];

function unitIdForName(unit: UnitName): UnitId {
  return UNIT_NAME_TO_ID[unit] ?? 'noir';
}

export function stylingOptionsForUnit(unit: UnitName): readonly string[] {
  const id = unitIdForName(unit);
  return id === 'soft-curl' || id === 'ocean-curl' ? STYLING_OPTIONS_CURLY : STYLING_OPTIONS;
}

export function colorOptionsForUnit(unit: UnitName): readonly string[] {
  return allowedColorsForUnit(unit);
}

function lengthOptionSet(): Set<string> {
  return new Set(MANIFEST_LENGTH_OPTIONS.map((l) => l.toUpperCase()));
}

function laceOptionSet(): Set<string> {
  return new Set(MANIFEST_LACE_OPTIONS.map((l) => normalizeLaceValue(l)));
}

function densityOptionSet(): Set<string> {
  return new Set(MANIFEST_DENSITY_OPTIONS.map((d) => normalizeDensityValue(d)));
}

export function defaultTopMatchManifest(): ManifestLookDraft {
  return {
    unit: 'NOIR',
    color: 'JET BLACK',
    length: analysisLengthFromBaw('24"'),
    lace: '13X6',
    density: '250%',
    part: 'MIDDLE',
    hairline: 'NATURAL',
    styling: 'NONE',
  };
}

export function defaultAdditionalManifests(): ManifestLookDraft[] {
  return [
    {
      unit: 'SOFT WAVE',
      color: 'OFF BLACK',
      length: analysisLengthFromBaw('26"'),
      lace: '13X6',
      density: '250%',
      part: 'LEFT',
      hairline: 'NATURAL',
      styling: 'NONE',
    },
    {
      unit: 'BLANCO',
      color: 'PLATINUM',
      length: analysisLengthFromBaw('24"'),
      lace: '4X4',
      density: '250%',
      part: 'MIDDLE',
      hairline: 'NATURAL',
      styling: 'BANGS, CRIMPS',
    },
    {
      unit: 'OCEAN CURL',
      color: 'CHERRY',
      length: analysisLengthFromBaw('22"'),
      lace: '13X4',
      density: '300%',
      part: 'MIDDLE',
      hairline: 'NATURAL',
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
  const stylingRaw = draft.styling.trim().toUpperCase();
  const styling = styles.some((s) => s.toUpperCase() === stylingRaw)
    ? styles.find((s) => s.toUpperCase() === stylingRaw) ?? 'NONE'
    : 'NONE';

  const lengthNorm = analysisLengthFromBaw(draft.length);
  const length = lengthOptionSet().has(lengthNorm.toUpperCase()) ? lengthNorm : analysisLengthFromBaw('24"');

  const laceNorm = normalizeLaceValue(draft.lace);
  const lace = laceOptionSet().has(laceNorm) ? laceNorm : '13X6';

  const densityNorm = normalizeDensityValue(draft.density);
  const density = densityOptionSet().has(densityNorm) ? densityNorm : '250%';

  const part = normalizePartValue(draft.part);
  const hairline = 'NATURAL';

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
      return ['NATURAL'];
    case 'styling':
      return stylingOptionsForUnit(normalized.unit);
    default:
      return [];
  }
}

/** Length dropdown labels mirror BAW sub-page (16", 24", …). */
export function manifestFieldDisplayValue(
  field: keyof ManifestLookDraft,
  draft: ManifestLookDraft
): string {
  const normalized = normalizeManifestDraft(draft);
  if (field === 'length') return bawLengthLabel(normalized.length);
  return normalized[field];
}

export function manifestLengthSelectValue(length: string): string {
  return analysisLengthFromBaw(length);
}

export function isGroupedManifestField(field: keyof ManifestLookDraft): boolean {
  return field === 'lace';
}

export function manifestLaceOptionGroups(): ManifestLaceOptionGroup[] {
  return MANIFEST_LACE_OPTION_GROUPS;
}
