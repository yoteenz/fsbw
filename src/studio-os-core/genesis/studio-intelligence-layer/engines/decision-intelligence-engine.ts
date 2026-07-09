import { getDecisionDna } from '../registries/intelligence-registries';
import type { XsilDecisionDnaRecord, XsilExecutiveRecommendation } from '../types';

/** Decision Intelligence Engine™ — founder decision model for Orb recommendations */
export function buildDecisionRecommendation(
  companyId: string,
  mission: string
): { signals: string[]; confidence: number; requiresApproval: boolean } {
  const dna = getDecisionDna(companyId);
  if (!dna) {
    return { signals: ['Decision DNA not loaded'], confidence: 0, requiresApproval: true };
  }

  const signals = [
    `Risk tolerance: ${dna.riskTolerance.value}/100 (${dna.riskTolerance.label})`,
    `Speed/quality: ${dna.speedQualityBias.value}/100`,
    `Luxury floor: ${dna.luxuryAffordabilityBias.value}/100`,
    `Principles: ${dna.learnedPrinciples.slice(0, 2).join(', ')}`,
    `Avoid: ${dna.antiPatterns.slice(0, 2).join(', ')}`,
  ];

  const confidence = Math.round(
    (dna.riskTolerance.value + dna.speedQualityBias.value + dna.innovationConventionBias.value) / 3
  );

  return {
    signals,
    confidence,
    requiresApproval: confidence < 75 || mission.toLowerCase().includes('canon'),
  };
}

export function scoreDecisionAlignment(dna: XsilDecisionDnaRecord, proposal: string): number {
  const lower = proposal.toLowerCase();
  let score = 70;
  for (const p of dna.learnedPrinciples) {
    if (lower.includes(p.toLowerCase().slice(0, 12))) score += 5;
  }
  for (const anti of dna.antiPatterns) {
    if (lower.includes(anti.toLowerCase())) score -= 15;
  }
  return Math.max(0, Math.min(100, score));
}

export function appendDecisionRecommendationContext(
  rec: XsilExecutiveRecommendation,
  companyId: string
): XsilExecutiveRecommendation {
  const decision = buildDecisionRecommendation(companyId, rec.summary);
  return {
    ...rec,
    rationale: [...rec.rationale, ...decision.signals],
    confidence: Math.round((rec.confidence + decision.confidence) / 2),
    requiresFounderApproval: rec.requiresFounderApproval || decision.requiresApproval,
  };
}
