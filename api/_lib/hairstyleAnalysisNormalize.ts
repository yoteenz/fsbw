import { normalizeAnalysisStylingId } from './hairstyleAnalysisDisplay.js';
import { hexForHairColorName } from './hairstyleHairColors.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { resolveCatalogLookForFal } from './hairstyleAnalysisUnitCatalog.js';
import { applyRealisticMatchScores } from './hairstyleAnalysisRealisticScores.js';

function normalizeLookStyling<T extends { unit: string; styling: string; density: string; color: string; hex: string }>(
  look: T
): T {
  return resolveCatalogLookForFal({
    ...look,
    styling: normalizeAnalysisStylingId(look.unit, look.styling),
  });
}

function normalizeTier(tier: FalHairstyleAnalysis['tier']): FalHairstyleAnalysis['tier'] | 'twelve_month' {
  return tier === 'black' ? 'twelve_month' : tier;
}

/** Ensure catalog hex codes and varied match scores before Fal generation. */
export function normalizeHairstyleAnalysisForFal(analysis: FalHairstyleAnalysis): FalHairstyleAnalysis {
  const tierKey = normalizeTier(analysis.tier);
  const withScores = applyRealisticMatchScores(analysis);

  const top = normalizeLookStyling({
    ...withScores.topMatch,
    hex: withScores.topMatch.hex || hexForHairColorName(withScores.topMatch.color),
  });

  const additionalLooks =
    tierKey === 'free'
      ? []
      : withScores.additionalLooks.map((look) =>
          normalizeLookStyling({
            ...look,
            hex: look.hex || hexForHairColorName(look.color),
          })
        );

  return { ...withScores, topMatch: top, additionalLooks };
}
