import { hexForHairColorName } from './hairstyleHairColors.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { applyRealisticMatchScores } from './hairstyleAnalysisRealisticScores.js';

/** Ensure catalog hex codes and varied match scores before Fal generation. */
export function normalizeHairstyleAnalysisForFal(analysis: FalHairstyleAnalysis): FalHairstyleAnalysis {
  const withScores = applyRealisticMatchScores(analysis);

  const top = {
    ...withScores.topMatch,
    hex: withScores.topMatch.hex || hexForHairColorName(withScores.topMatch.color),
  };

  const additionalLooks = withScores.additionalLooks.map((look) => ({
    ...look,
    hex: look.hex || hexForHairColorName(look.color),
  }));

  return { ...withScores, topMatch: top, additionalLooks };
}
