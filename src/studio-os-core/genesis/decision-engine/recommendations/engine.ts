import { mutateDecisionEngineStore, readDecisionEngineStore } from '../persistence';
import { submitStudioDecision } from '../decisions/engine';
import { buildDecisionConfidence } from '../confidence/model';
import type { DecisionAlternative, DecisionConfidenceRecord, StudioRecommendation } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createRecommendationId(): string {
  return `REC-${Date.now().toString(36)}`;
}

/** Recommendation Engine™ — advisory decisions with explanation */
export function issueStudioRecommendation(input: {
  officialName: string;
  recommendedAction: string;
  explanation: string;
  sourceObjectId: string;
  recipientObjectId: string;
  confidence: DecisionConfidenceRecord | { rationale: string; level?: DecisionConfidenceRecord['level']; score?: number };
  alternatives?: DecisionAlternative[];
  affectedObjectIds?: string[];
  dependencies?: string[];
}): StudioRecommendation {
  const timestamp = now();

  const confidence =
    'calibratedAt' in input.confidence
      ? input.confidence
      : buildDecisionConfidence(input.confidence);

  const decision = submitStudioDecision({
    decisionType: 'recommendation',
    officialName: input.officialName,
    initiatorObjectId: input.sourceObjectId,
    decisionMakerObjectId: input.sourceObjectId,
    purpose: input.explanation,
    affectedObjectIds: input.affectedObjectIds,
    recommendation: input.recommendedAction,
    confidence,
    reasoning: { summary: input.explanation },
    alternatives: input.alternatives,
    dependencies: input.dependencies,
    reviewStatus: 'not_required',
  });

  const recommendation: StudioRecommendation = {
    recommendationId: createRecommendationId(),
    decisionId: decision.decisionId,
    officialName: input.officialName.trim(),
    recommendedAction: input.recommendedAction.trim(),
    explanation: input.explanation.trim(),
    confidence,
    alternatives: input.alternatives ?? [],
    status: 'pending',
    recipientObjectId: input.recipientObjectId,
    sourceObjectId: input.sourceObjectId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateDecisionEngineStore((store) => ({
    ...store,
    recommendations: [...store.recommendations, recommendation],
  }));

  return recommendation;
}

export function acceptStudioRecommendation(
  recommendationId: string,
  actorObjectId: string
): StudioRecommendation | undefined {
  return updateRecommendationStatus(recommendationId, 'accepted', actorObjectId);
}

export function rejectStudioRecommendation(
  recommendationId: string,
  actorObjectId: string
): StudioRecommendation | undefined {
  return updateRecommendationStatus(recommendationId, 'rejected', actorObjectId);
}

function updateRecommendationStatus(
  recommendationId: string,
  status: StudioRecommendation['status'],
  actorObjectId?: string
): StudioRecommendation | undefined {
  let updated: StudioRecommendation | undefined;

  mutateDecisionEngineStore((store) => {
    const idx = store.recommendations.findIndex((r) => r.recommendationId === recommendationId);
    if (idx < 0) return store;

    updated = {
      ...store.recommendations[idx],
      status,
      updatedAt: now(),
    };

    const recommendations = [...store.recommendations];
    recommendations[idx] = updated;

    if (actorObjectId && updated.decisionId) {
      const decisionIdx = store.decisions.findIndex((d) => d.decisionId === updated!.decisionId);
      if (decisionIdx >= 0) {
        const decisions = [...store.decisions];
        decisions[decisionIdx] = {
          ...decisions[decisionIdx],
          status: status === 'accepted' ? 'selected' : 'rejected',
          updatedAt: now(),
        };
        return { ...store, recommendations, decisions };
      }
    }

    return { ...store, recommendations };
  });

  return updated;
}

export function listStudioRecommendations(recipientObjectId?: string): StudioRecommendation[] {
  const recommendations = readDecisionEngineStore().recommendations;
  return recipientObjectId
    ? recommendations.filter((r) => r.recipientObjectId === recipientObjectId)
    : recommendations;
}

export function getStudioRecommendation(
  recommendationId: string
): StudioRecommendation | undefined {
  return readDecisionEngineStore().recommendations.find(
    (r) => r.recommendationId === recommendationId
  );
}

export function listPendingRecommendations(): StudioRecommendation[] {
  return listStudioRecommendations().filter((r) => r.status === 'pending');
}
