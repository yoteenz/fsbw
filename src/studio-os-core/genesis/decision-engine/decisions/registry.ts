import { readDecisionEngineStore } from '../persistence';
import type { DecisionEngineRegistryStats, StudioDecision } from '../types';
import { CANONICAL_DECISION_TYPES } from '../constants';

/** Decision Registry™ */
export function listDecisionRegistry(): StudioDecision[] {
  return readDecisionEngineStore().decisions;
}

export function getDecisionRegistryStats(): Pick<
  DecisionEngineRegistryStats,
  'decisionCount' | 'pendingDecisionCount' | 'pendingReviewCount'
> {
  const decisions = listDecisionRegistry();
  return {
    decisionCount: decisions.length,
    pendingDecisionCount: decisions.filter(
      (d) =>
        d.status === 'proposed' ||
        d.status === 'recommended' ||
        d.status === 'selected'
    ).length,
    pendingReviewCount: decisions.filter(
      (d) => d.reviewStatus === 'pending' || d.reviewStatus === 'in_review'
    ).length,
  };
}

export function searchDecisionRegistry(query: string, limit = 20): StudioDecision[] {
  const q = query.trim().toLowerCase();
  if (!q) return listDecisionRegistry().slice(0, limit);

  return listDecisionRegistry()
    .map((item) => {
      let score = 0;
      if (item.decisionId.toLowerCase().includes(q)) score += 6;
      if (item.officialName.toLowerCase().includes(q)) score += 5;
      if (item.decisionType.toLowerCase().includes(q)) score += 4;
      if (item.intent.summary.toLowerCase().includes(q)) score += 3;
      if (item.recommendation?.toLowerCase().includes(q)) score += 2;
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function listDecisionsByType(
  decisionType: StudioDecision['decisionType']
): StudioDecision[] {
  return listDecisionRegistry().filter((d) => d.decisionType === decisionType);
}

export function listDecisionsByStatus(status: StudioDecision['status']): StudioDecision[] {
  return listDecisionRegistry().filter((d) => d.status === status);
}

export function listDecisionsForObject(objectId: string): StudioDecision[] {
  return listDecisionRegistry().filter(
    (d) =>
      d.initiatorObjectId === objectId ||
      d.decisionMakerObjectId === objectId ||
      d.affectedObjectIds.includes(objectId) ||
      d.reviewerObjectIds.includes(objectId)
  );
}

export function getDecisionTypeCoverage(): { type: string; count: number }[] {
  return CANONICAL_DECISION_TYPES.map((type) => ({
    type,
    count: listDecisionsByType(type).length,
  }));
}

export function listDecisionsByCorrelation(correlationId: string): StudioDecision[] {
  return listDecisionRegistry().filter((d) => d.correlationId === correlationId);
}
