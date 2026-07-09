import { mutateDecisionEngineStore, readDecisionEngineStore } from '../persistence';
import { submitStudioDecision } from '../decisions/engine';
import type { PriorityLevel } from '../constants';
import type { StudioPriorityRanking } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createPriorityId(): string {
  return `PRI-${Date.now().toString(36)}`;
}

/** Priority Engine™ — rank what matters now */
export function createStudioPriorityRanking(input: {
  ownerObjectId: string;
  level: PriorityLevel;
  rankedItems: { objectId: string; rank: number; rationale?: string }[];
  rationale: string;
  officialName?: string;
}): StudioPriorityRanking {
  const timestamp = now();

  const decision = submitStudioDecision({
    decisionType: 'priority',
    officialName: input.officialName ?? 'Priority Ranking',
    initiatorObjectId: input.ownerObjectId,
    decisionMakerObjectId: input.ownerObjectId,
    purpose: input.rationale,
    affectedObjectIds: input.rankedItems.map((i) => i.objectId),
    reasoning: { summary: input.rationale },
    metadata: { level: input.level, rankedItems: input.rankedItems },
  });

  const priority: StudioPriorityRanking = {
    priorityId: createPriorityId(),
    decisionId: decision.decisionId,
    ownerObjectId: input.ownerObjectId,
    level: input.level,
    rankedItems: [...input.rankedItems].sort((a, b) => a.rank - b.rank),
    rationale: input.rationale.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateDecisionEngineStore((store) => ({
    ...store,
    priorities: [...store.priorities, priority],
  }));

  return priority;
}

export function updateStudioPriorityRanking(
  priorityId: string,
  rankedItems: { objectId: string; rank: number; rationale?: string }[]
): StudioPriorityRanking | undefined {
  let updated: StudioPriorityRanking | undefined;

  mutateDecisionEngineStore((store) => {
    const idx = store.priorities.findIndex((p) => p.priorityId === priorityId);
    if (idx < 0) return store;

    updated = {
      ...store.priorities[idx],
      rankedItems: [...rankedItems].sort((a, b) => a.rank - b.rank),
      updatedAt: now(),
    };

    const priorities = [...store.priorities];
    priorities[idx] = updated;
    return { ...store, priorities };
  });

  return updated;
}

export function listStudioPriorityRankings(ownerObjectId?: string): StudioPriorityRanking[] {
  const priorities = readDecisionEngineStore().priorities;
  return ownerObjectId ? priorities.filter((p) => p.ownerObjectId === ownerObjectId) : priorities;
}

export function getStudioPriorityRanking(priorityId: string): StudioPriorityRanking | undefined {
  return readDecisionEngineStore().priorities.find((p) => p.priorityId === priorityId);
}

export function getTopPriorityObject(ownerObjectId: string): string | undefined {
  const latest = listStudioPriorityRankings(ownerObjectId).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
  return latest?.rankedItems[0]?.objectId;
}
