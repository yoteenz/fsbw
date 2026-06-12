import { hexForHairColorName } from './hairstyleHairColors.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';

/** Ensure catalog hex codes are set before Fal generation. */
export function normalizeHairstyleAnalysisForFal(analysis: FalHairstyleAnalysis): FalHairstyleAnalysis {
  const top = {
    ...analysis.topMatch,
    hex: analysis.topMatch.hex || hexForHairColorName(analysis.topMatch.color),
  };

  const additionalLooks = analysis.additionalLooks.map((look) => ({
    ...look,
    hex: look.hex || hexForHairColorName(look.color),
  }));

  return { ...analysis, topMatch: top, additionalLooks };
}
