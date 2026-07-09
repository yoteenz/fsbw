import { submitStudioDecision, type SubmitDecisionInput } from '../decisions/engine';
import { issueStudioRecommendation } from '../recommendations/engine';
import { registerStudioStrategy } from '../strategies/strategies';
import type { StudioDecision } from '../types';

export type DecisionPayload = SubmitDecisionInput;

/** Batch ingest — zero engineering changes when payload matches schema */
export function ingestDecisionPayload(payload: DecisionPayload): StudioDecision {
  return submitStudioDecision(payload);
}

export function ingestDecisionBatch(payloads: DecisionPayload[]): {
  ingested: StudioDecision[];
  errors: string[];
} {
  const ingested: StudioDecision[] = [];
  const errors: string[] = [];

  for (const payload of payloads) {
    try {
      if (!payload.decisionType?.trim()) {
        errors.push('Missing decisionType');
        continue;
      }
      if (
        !payload.officialName?.trim() ||
        !payload.initiatorObjectId ||
        !payload.decisionMakerObjectId
      ) {
        errors.push('Missing required decision fields');
        continue;
      }
      ingested.push(ingestDecisionPayload(payload));
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return { ingested, errors };
}

export type RecommendationPayload = Parameters<typeof issueStudioRecommendation>[0];
export type StrategyPayload = Parameters<typeof registerStudioStrategy>[0];

export function ingestRecommendationPayload(payload: RecommendationPayload) {
  return issueStudioRecommendation(payload);
}

export function ingestStrategyPayload(payload: StrategyPayload) {
  return registerStudioStrategy(payload);
}
