import { buildAudienceBrief, scoreAudienceFit } from './audience-intelligence-engine';
import { appendDecisionRecommendationContext, buildDecisionRecommendation } from './decision-intelligence-engine';
import { buildManualConsultationChecklist } from './operating-manual-engine';
import { buildProductBrief, scoreProductAlignment } from './product-intelligence-engine';
import { scoreTasteFit } from './taste-learning-engine';
import type { XsilExecutiveRecommendation, XsilIntelligenceQuery } from '../types';

/** Executive Intelligence™ — unified reasoning API */
export function buildExecutiveRecommendation(query: XsilIntelligenceQuery): XsilExecutiveRecommendation {
  const { companyId, mission, artifactSummary = mission } = query;
  const decision = buildDecisionRecommendation(companyId, mission);
  const audienceScore = scoreAudienceFit(companyId, artifactSummary);
  const productScore = scoreProductAlignment(companyId, artifactSummary);
  const tasteScore = scoreTasteFit(companyId, artifactSummary);

  const base: XsilExecutiveRecommendation = {
    recommendationId: `exec-${companyId}-${Date.now()}`,
    companyId,
    summary: mission,
    recommendedAction: `Proceed with ${mission} aligned to operating manual and Decision DNA`,
    alternatives: ['Defer pending founder review', 'Run canon review first', 'Compile experience preview'],
    brandImpact: 'Cross-check Brand Discovery strategic DNA before shipping',
    audienceImpact: `Audience fit score ${audienceScore}/100 — ${buildAudienceBrief(companyId)}`,
    productImpact: `Product alignment ${productScore}/100 — ${buildProductBrief(companyId)}`,
    financialImpact: 'Evaluate revenue vs brand/operational trade-offs via Decision DNA',
    operationalImpact: buildManualConsultationChecklist(companyId).join(' · '),
    platformImpact: 'Changes may require canon review and Experience recompilation',
    confidence: Math.round((decision.confidence + audienceScore + productScore + tasteScore) / 4),
    requiresFounderApproval: decision.requiresApproval,
    rationale: [
      ...decision.signals,
      `Taste fit: ${tasteScore}/100`,
      'Executive frame: brand · audience · product · founder · ops · platform',
    ],
  };

  return appendDecisionRecommendationContext(base, companyId);
}

export function evaluateExecutiveIntelligence(query: XsilIntelligenceQuery): XsilExecutiveRecommendation {
  return buildExecutiveRecommendation(query);
}
