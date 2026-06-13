import {
  compactEveryDetailMattersLines,
  normalizeAnalysisStylingId,
} from './hairstyleAnalysisDisplay.js';
import { buildEveryDetailMattersFromTopMatch } from './hairstyleAnalysisEveryDetailMatters.js';
import { hexForHairColorName } from './hairstyleHairColors.js';
import { diversifyHairstyleAnalysisLooks } from './hairstyleAnalysisLookDiversity.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { resolveCatalogLookForFal } from './hairstyleAnalysisUnitCatalog.js';
import { applyRealisticMatchScores } from './hairstyleAnalysisRealisticScores.js';

function normalizeLookStyling<
  T extends { unit: string; styling: string; density: string; color: string; hex: string },
>(look: T, styleIndex: number): T {
  return resolveCatalogLookForFal({
    ...look,
    styling: normalizeAnalysisStylingId(look.unit, look.styling),
  }, styleIndex);
}

function normalizeTier(tier: FalHairstyleAnalysis['tier']): FalHairstyleAnalysis['tier'] | 'twelve_month' {
  return tier === 'black' ? 'twelve_month' : tier;
}

/** Ensure catalog hex codes and varied match scores before Fal generation. */
export function normalizeHairstyleAnalysisForFal(analysis: FalHairstyleAnalysis): FalHairstyleAnalysis {
  const tierKey = normalizeTier(analysis.tier);
  const withScores = applyRealisticMatchScores(analysis);
  const diversified = diversifyHairstyleAnalysisLooks(
    withScores.topMatch,
    tierKey === 'free' ? [] : withScores.additionalLooks
  );

  const top = normalizeLookStyling(
    {
      ...diversified.topMatch,
      hex: diversified.topMatch.hex || hexForHairColorName(diversified.topMatch.color),
    },
    0
  );

  const additionalLooks =
    tierKey === 'free'
      ? []
      : diversified.additionalLooks.map((look, i) =>
          normalizeLookStyling(
            {
              ...look,
              hex: look.hex || hexForHairColorName(look.color),
            },
            i + 1
          )
        );

  return {
    ...withScores,
    topMatch: top,
    additionalLooks,
    whyItWorks: compactEveryDetailMattersLines(buildEveryDetailMattersFromTopMatch(top)),
  };
}
