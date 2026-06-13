import type { AnalysisLook } from '../types/hairstyleAnalysis';
import type { UnitName } from '../types/hairstyleAnalysis';
import { normalizeAnalysisStylingId } from './hairstyleAnalysisFormat';

const UNIT_DEFAULT_DENSITY: Record<UnitName, string> = {
  NOIR: '250%',
  BLANCO: '250%',
  'SOFT WAVE': '200%',
  'BEACH WAVE': '200%',
  'SOFT CURL': '200%',
  'OCEAN CURL': '200%',
};

const UNIT_PATTERN: Record<UnitName, 'STRAIGHT' | 'WAVY' | 'CURLY'> = {
  NOIR: 'STRAIGHT',
  BLANCO: 'STRAIGHT',
  'SOFT WAVE': 'WAVY',
  'BEACH WAVE': 'WAVY',
  'SOFT CURL': 'CURLY',
  'OCEAN CURL': 'CURLY',
};

const VALID_SALON_STYLES: Record<UnitName, readonly string[]> = {
  NOIR: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  BLANCO: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'BEACH WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
  'OCEAN CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
};

function defaultSalonStyle(pattern: 'STRAIGHT' | 'WAVY' | 'CURLY'): string {
  if (pattern === 'STRAIGHT') return 'FLAT IRON';
  if (pattern === 'WAVY') return 'LAYERS';
  return 'DEFINE';
}

/** Align dev overlay specs with BAW catalog unit (mirrors api resolveCatalogLookForFal). */
export function resolveCatalogLook(look: AnalysisLook): AnalysisLook {
  const unit = look.unit.trim().toUpperCase() as UnitName;
  const pattern = UNIT_PATTERN[unit];
  const styling = normalizeAnalysisStylingId(unit, look.styling);
  const allowed = VALID_SALON_STYLES[unit];
  const resolvedStyling =
    styling === 'NONE' && pattern
      ? defaultSalonStyle(pattern)
      : allowed?.includes(styling)
        ? styling
        : pattern
          ? defaultSalonStyle(pattern)
          : styling;
  const catalogDensity = UNIT_DEFAULT_DENSITY[unit];
  const density =
    catalogDensity &&
    (!look.density?.trim() || (look.density === '250%' && catalogDensity !== '250%'))
      ? catalogDensity
      : look.density;

  return {
    ...look,
    unit,
    styling: resolvedStyling,
    density,
    color: look.color.trim().toUpperCase(),
  };
}
