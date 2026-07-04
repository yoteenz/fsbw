import type { BusinessHealthScore, IntelligenceRecommendation, OpportunityRecommendation, RiskAlert } from './types';

export function computeOverallHealth(categoryScores: BusinessHealthScore['categoryScores']): number {
  const values = Object.values(categoryScores);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function evidenceFor(rec: OpportunityRecommendation | RiskAlert | IntelligenceRecommendation): string[] {
  if ('historicalEvidence' in rec) return rec.historicalEvidence;
  return rec.supportingEvidence;
}

export function buildConfidenceBreakdown(rec: OpportunityRecommendation | RiskAlert | IntelligenceRecommendation) {
  const isRisk = 'severity' in rec;

  return {
    recommendationId: rec.id,
    confidenceScore: rec.confidence,
    supportingData: evidenceFor(rec),
    relatedExperiments: 'relatedExperiments' in rec ? rec.relatedExperiments : [],
    similarHistoricalOutcomes: 'similarOutcomes' in rec ? rec.similarOutcomes : [],
    potentialRisks: isRisk ? [rec.recommendedAction] : ('potentialRisks' in rec ? rec.potentialRisks : []),
    alternativeRecommendations: 'alternatives' in rec ? rec.alternatives : [],
  };
}
