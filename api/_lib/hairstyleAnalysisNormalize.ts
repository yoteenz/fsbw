import { hexForHairColorName } from './hairstyleHairColors.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';

const NATURAL_TEXTURE_TIERS = new Set<FalHairstyleAnalysis['tier']>(['three_month', 'six_month']);

/** Ensure hex codes and unstyled natural texture on 3 / 6 month additional matches. */
export function normalizeHairstyleAnalysisForFal(analysis: FalHairstyleAnalysis): FalHairstyleAnalysis {
  const top = {
    ...analysis.topMatch,
    hex: analysis.topMatch.hex || hexForHairColorName(analysis.topMatch.color),
  };

  const additionalLooks = analysis.additionalLooks.map((look) => {
    const hex = look.hex || hexForHairColorName(look.color);
    const styling = NATURAL_TEXTURE_TIERS.has(analysis.tier) ? 'NONE' : look.styling;
    return { ...look, hex, styling };
  });

  return { ...analysis, topMatch: top, additionalLooks };
}
