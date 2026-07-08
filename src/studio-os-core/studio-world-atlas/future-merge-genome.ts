import type { AtlasFutureAnalysis, AtlasParallelFuture, FutureGenome } from './types';

/** Future Genome™ — temporary Company Genome per synthesized future. */
export function buildFutureGenome(
  analysis: AtlasFutureAnalysis,
  sources: AtlasParallelFuture[]
): FutureGenome {
  const brandAvg =
    sources.reduce((s, f) => {
      const boost = f.archetype === 'future-a' ? 12 : f.archetype === 'future-d' ? 8 : 0;
      return s + f.analysis.navigationEfficiency + boost;
    }, 0) / Math.max(sources.length, 1);

  const founderSatisfaction = Math.min(
    98,
    Math.round(70 + analysis.navigationEfficiency * 0.15 + analysis.assetReusePct * 0.1)
  );
  const brandConsistency = Math.min(98, Math.round(brandAvg * 0.85));
  const navigationQuality = analysis.navigationEfficiency;
  const aiEfficiency = Math.min(
    99,
    Math.round(analysis.aiWorkforceCount * 2.2 + analysis.navigationEfficiency * 0.35)
  );
  const creativeDirection = Math.min(
    97,
    Math.round(
      sources.some((s) => s.archetype === 'future-a' || s.archetype === 'future-d') ? 88 : 74
    )
  );
  const operationalComplexity =
    analysis.operationalComplexity === 'high' ? 78 : analysis.operationalComplexity === 'medium' ? 52 : 28;
  const longTermScalability = analysis.expansionFlexibility;

  const summary =
    founderSatisfaction >= 90
      ? 'Genome predicts high founder satisfaction — balanced synthesis with strong navigation.'
      : founderSatisfaction >= 75
        ? 'Genome predicts solid satisfaction — resolve conflicts to unlock full potential.'
        : 'Genome flags tension — simplify departments or align lighting before commit.';

  return {
    founderSatisfaction,
    brandConsistency,
    navigationQuality,
    aiEfficiency,
    creativeDirection,
    operationalComplexity,
    longTermScalability,
    summary,
  };
}

export function formatGenomeLines(genome: FutureGenome): string[] {
  return [
    `Founder satisfaction ${genome.founderSatisfaction}%`,
    `Brand consistency ${genome.brandConsistency}%`,
    `Navigation ${genome.navigationQuality}% · AI efficiency ${genome.aiEfficiency}%`,
    `Creative direction ${genome.creativeDirection}%`,
    `Ops complexity ${genome.operationalComplexity}% · Scalability ${genome.longTermScalability}%`,
    genome.summary,
  ];
}
