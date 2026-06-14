import {
  hexForConsultHairColor,
  pickConsultComparisonColors,
  type ConsultHairColorName,
} from './consultStyleAnalysisCatalog.js';
import type { ConsultInspoSpecs } from './consultStyleAnalysisInspoSpecs.js';
import type { FalAnalysisLook, FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { HAIRSTYLE_ANALYSIS_LOCKED_HAIRLINE } from './hairstyleAnalysisDisplay.js';

function lookFromSpecs(
  specs: ConsultInspoSpecs,
  rank: number,
  color: ConsultHairColorName,
  score: number,
  rating: number
): FalAnalysisLook {
  return {
    rank,
    unit: specs.unit,
    color,
    hex: hexForConsultHairColor(color),
    length: specs.length,
    lace: specs.lace,
    density: specs.density,
    hairline: HAIRSTYLE_ANALYSIS_LOCKED_HAIRLINE,
    part: specs.part,
    styling: specs.styling,
    score,
    rating,
  };
}

/**
 * Build a hairstyle-analysis manifest from inspo-derived catalog specs.
 * 1 pick → `six_month` (free template). 4 pick → `twelve_month` (premium) with 3 color alts.
 */
export function buildConsultHairstyleAnalysis(input: {
  clientName: string;
  comparisonCount: 1 | 4;
  specs: ConsultInspoSpecs;
}): FalHairstyleAnalysis {
  const tier = input.comparisonCount === 4 ? 'twelve_month' : 'six_month';
  const topMatch = lookFromSpecs(input.specs, 1, input.specs.color, 98, 5);

  const additionalLooks: FalAnalysisLook[] =
    input.comparisonCount === 4
      ? pickConsultComparisonColors(input.specs.color, 3).map((color, i) =>
          lookFromSpecs(input.specs, i + 2, color, 95 - i * 2, 4.8 - i * 0.2)
        )
      : [];

  return {
    clientName: input.clientName.trim() || 'CLIENT',
    tier,
    topMatch,
    additionalLooks,
    whyItWorks: [],
  };
}
