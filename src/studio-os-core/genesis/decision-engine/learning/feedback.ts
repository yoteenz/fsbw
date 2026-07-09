import { mutateDecisionEngineStore, readDecisionEngineStore } from '../persistence';
import { calibrateConfidenceFromOutcome } from '../confidence/model';
import type { DecisionLearningRecord } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createLearningId(): string {
  return `LRN-${Date.now().toString(36)}`;
}

/** Learning Feedback™ — observation -> evaluation -> memory -> future decision */
export function recordLearningFeedback(input: {
  decisionId: string;
  observation: string;
  outcome?: string;
  adjustment?: string;
  memoryObjectId?: string;
  outcomeMatched?: boolean;
}): DecisionLearningRecord {
  const record: DecisionLearningRecord = {
    learningId: createLearningId(),
    observation: input.observation.trim(),
    outcome: input.outcome,
    adjustment: input.adjustment,
    memoryObjectId: input.memoryObjectId,
    createdAt: now(),
  };

  mutateDecisionEngineStore((store) => {
    const idx = store.decisions.findIndex((d) => d.decisionId === input.decisionId);
    if (idx < 0) {
      return {
        ...store,
        learningRecords: [...store.learningRecords, record],
      };
    }

    const decision = store.decisions[idx];
    let confidence = decision.confidence;
    if (input.outcomeMatched !== undefined) {
      confidence = calibrateConfidenceFromOutcome({
        prior: decision.confidence,
        outcomeMatched: input.outcomeMatched,
      });
    }

    const updated = {
      ...decision,
      confidence,
      learningHistory: [...decision.learningHistory, record],
      updatedAt: now(),
    };

    const decisions = [...store.decisions];
    decisions[idx] = updated;

    return {
      ...store,
      decisions,
      learningRecords: [...store.learningRecords, record],
    };
  });

  return record;
}

export function listLearningRecords(decisionId?: string): DecisionLearningRecord[] {
  if (decisionId) {
    const decision = readDecisionEngineStore().decisions.find((d) => d.decisionId === decisionId);
    return decision?.learningHistory ?? [];
  }
  return readDecisionEngineStore().learningRecords;
}

export function getLearningFeedbackStats() {
  const records = readDecisionEngineStore().learningRecords;
  return {
    totalRecords: records.length,
    withOutcome: records.filter((r) => r.outcome).length,
    withAdjustment: records.filter((r) => r.adjustment).length,
  };
}
