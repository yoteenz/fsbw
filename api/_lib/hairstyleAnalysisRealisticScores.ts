import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function dynamicMatchRating(score: number): number {
  if (Math.round(score) >= 95) return 5.0;
  return Math.round((4 + randomInt(5, 9) / 10) * 10) / 10;
}

/** Assign varied, rank-aware scores on each generation so matches feel realistic. */
export function applyRealisticMatchScores(analysis: FalHairstyleAnalysis): FalHairstyleAnalysis {
  const topScore = randomInt(94, 99);
  const topRating = dynamicMatchRating(topScore);

  if (analysis.tier === 'free') {
    return {
      ...analysis,
      additionalLooks: [],
      topMatch: {
        ...analysis.topMatch,
        score: topScore,
        rating: topRating,
        rank: analysis.topMatch.rank > 0 ? analysis.topMatch.rank : 1,
      },
    };
  }

  let floor = topScore - 2;
  const additionalLooks = analysis.additionalLooks.map((look, index) => {
    const gap = randomInt(2, 5);
    const jitter = randomInt(-1, 1);
    const score = clamp(floor - gap + jitter, 72, topScore - 1);
    floor = score;
    return {
      ...look,
      score,
      rating: dynamicMatchRating(score),
      rank: look.rank > 0 ? look.rank : index + 2,
    };
  });

  return {
    ...analysis,
    topMatch: {
      ...analysis.topMatch,
      score: topScore,
      rating: topRating,
      rank: analysis.topMatch.rank > 0 ? analysis.topMatch.rank : 1,
    },
    additionalLooks,
  };
}
