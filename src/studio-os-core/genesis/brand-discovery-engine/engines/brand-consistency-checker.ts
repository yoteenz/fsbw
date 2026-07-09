import type { XbdBrandDnaRecord, XbdConsistencyScore } from '../types';

const PASS_THRESHOLD = 80;

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function tokenOverlap(text: string, tokens: string[]): number {
  const lower = text.toLowerCase();
  if (!tokens.length) return 50;
  const hits = tokens.filter((t) => lower.includes(t.toLowerCase())).length;
  return clamp((hits / tokens.length) * 100);
}

function antiPatternPenalty(text: string, antiPatterns: string[]): number {
  const lower = text.toLowerCase();
  const hits = antiPatterns.filter((p) => lower.includes(p.toLowerCase())).length;
  return hits * 12;
}

/** Brand Consistency Checker™ — scores any artifact against strategic Brand DNA */
export function scoreBrandConsistency(
  brand: XbdBrandDnaRecord,
  artifactSummary: string,
  artifactType?: string
): XbdConsistencyScore {
  const text = `${artifactType ?? ''} ${artifactSummary}`.trim();
  const voiceTokens = [
    ...brand.writingVoice.vocabulary,
    brand.writingVoice.tone,
    brand.writingVoice.cadence,
  ];
  const visualTokens = [
    ...brand.visualPersonality,
    ...brand.materials,
    brand.photographyStyle,
    brand.colorSystem.primary,
  ];
  const audienceTokens = [
    brand.audienceProfile.primaryAudience,
    brand.audienceProfile.psychology,
    ...brand.audienceProfile.identitySignals,
  ];

  const forbiddenHits = brand.writingVoice.forbiddenLanguage.filter((f) =>
    text.toLowerCase().includes(f.toLowerCase())
  ).length;
  const antiHits = antiPatternPenalty(text, brand.antiPatterns);

  const voiceAlignment = clamp(tokenOverlap(text, voiceTokens) - forbiddenHits * 15 - antiHits);
  const visualAlignment = clamp(tokenOverlap(text, visualTokens));
  const audienceFit = clamp(tokenOverlap(text, audienceTokens));
  const luxuryFit = clamp(
    brand.luxuryLevel -
      (text.toLowerCase().includes('cheap') || text.toLowerCase().includes('discount') ? 25 : 0)
  );
  const positioningFit = clamp(
    tokenOverlap(text, [brand.positioning, ...brand.emotionalTerritory, brand.brandPhilosophy])
  );
  const differentiation = clamp(
    100 -
      tokenOverlap(text, brand.competitors) * 0.4 -
      (forbiddenHits > 0 ? 20 : 0)
  );

  const brandAlignment = clamp(
    (voiceAlignment + visualAlignment + audienceFit + positioningFit) / 4
  );
  const overallScore = clamp(
    (brandAlignment +
      voiceAlignment +
      visualAlignment +
      audienceFit +
      luxuryFit +
      positioningFit +
      differentiation) /
      7
  );

  const improvementNotes: string[] = [];
  if (voiceAlignment < PASS_THRESHOLD) {
    improvementNotes.push(
      `Align voice to ${brand.writingVoice.tone} — sample: "${brand.writingVoice.sampleLine}"`
    );
  }
  if (visualAlignment < PASS_THRESHOLD) {
    improvementNotes.push(
      `Reinforce visual personality: ${brand.visualPersonality.slice(0, 3).join(', ')}`
    );
  }
  if (forbiddenHits > 0) {
    improvementNotes.push(
      `Remove forbidden language: ${brand.writingVoice.forbiddenLanguage.slice(0, 3).join(', ')}`
    );
  }
  if (luxuryFit < brand.luxuryLevel - 10) {
    improvementNotes.push(`Elevate luxury signals — target level ${brand.luxuryLevel}/100`);
  }
  if (differentiation < PASS_THRESHOLD) {
    improvementNotes.push(`Differentiate from competitors: ${brand.competitors.slice(0, 2).join(', ')}`);
  }
  if (improvementNotes.length === 0) {
    improvementNotes.push('Artifact aligns with canonical Brand DNA — ready for downstream application.');
  }

  const status: XbdConsistencyScore['status'] =
    overallScore >= PASS_THRESHOLD && forbiddenHits === 0
      ? 'pass'
      : overallScore >= 60
        ? 'revise'
        : 'fail';

  return {
    brandAlignment,
    voiceAlignment,
    visualAlignment,
    audienceFit,
    luxuryFit,
    positioningFit,
    differentiation,
    overallScore,
    improvementNotes,
    passThreshold: PASS_THRESHOLD,
    status,
  };
}
