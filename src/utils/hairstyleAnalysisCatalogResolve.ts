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

const VALID_SALON_STYLES: Record<UnitName, readonly string[]> = {
  NOIR: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  BLANCO: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'BEACH WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
  'OCEAN CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
};

/** Align dev overlay specs with BAW catalog unit (mirrors api resolveCatalogLookForFal). */
export function resolveCatalogLook(look: AnalysisLook, _styleIndex = 0): AnalysisLook {
  const unit = look.unit.trim().toUpperCase() as UnitName;
  const styling = normalizeAnalysisStylingId(unit, look.styling);
  const resolvedStyling =
    !styling || styling === 'NONE'
      ? 'NONE'
      : VALID_SALON_STYLES[unit]?.includes(styling)
        ? styling
        : 'NONE';
  const catalogDensity = UNIT_DEFAULT_DENSITY[unit];
  const densityRaw = look.density?.trim().replace(/\s*DENSITY\s*$/i, '') ?? '';
  const density = !densityRaw
    ? (catalogDensity ?? look.density)
    : densityRaw.includes('%')
      ? densityRaw
      : `${densityRaw}%`;

  return {
    ...look,
    unit,
    styling: resolvedStyling,
    density,
    color: look.color.trim().toUpperCase(),
  };
}
