import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function ratingForScore(score: number): number {
  if (score >= 97) return 5;
  if (score >= 94) return 4.5;
  if (score >= 90) return 4;
  if (score >= 86) return 3.5;
  return 3;
}

/** Assign varied, rank-aware scores on each generation so matches feel realistic. */
export function applyRealisticMatchScores(analysis: FalHairstyleAnalysis): FalHairstyleAnalysis {
  const topScore = randomInt(94, 99);
  const topRating = ratingForScore(topScore);

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
      rating: ratingForScore(score),
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
