import { mutateDecisionEngineStore, readDecisionEngineStore } from '../persistence';
import { submitStudioDecision } from '../decisions/engine';
import type { StudioStrategy } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createStrategyId(slug: string): string {
  const token = (slug.trim() || 'strategy')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `STR-${token}-${Date.now().toString(36)}`;
}

export function registerStudioStrategy(input: {
  officialName: string;
  description: string;
  ownerObjectId: string;
  goalObjectIds?: string[];
  guardrails?: string[];
  successMeasures?: string[];
}): StudioStrategy {
  const timestamp = now();

  const decision = submitStudioDecision({
    decisionType: 'strategy',
    officialName: input.officialName,
    initiatorObjectId: input.ownerObjectId,
    decisionMakerObjectId: input.ownerObjectId,
    purpose: input.description,
    affectedObjectIds: input.goalObjectIds,
    reasoning: { summary: input.description },
    reviewStatus: 'pending',
    reviewThreshold: 'founder-approval',
  });

  const strategy: StudioStrategy = {
    strategyId: createStrategyId(input.officialName),
    decisionId: decision.decisionId,
    officialName: input.officialName.trim(),
    description: input.description.trim(),
    goalObjectIds: input.goalObjectIds ?? [],
    ownerObjectId: input.ownerObjectId,
    guardrails: input.guardrails ?? [],
    successMeasures: input.successMeasures ?? [],
    status: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateDecisionEngineStore((store) => ({
    ...store,
    strategies: [...store.strategies, strategy],
  }));

  return strategy;
}

export function activateStudioStrategy(strategyId: string): StudioStrategy | undefined {
  return updateStrategyStatus(strategyId, 'active');
}

export function listStudioStrategies(ownerObjectId?: string): StudioStrategy[] {
  const strategies = readDecisionEngineStore().strategies;
  return ownerObjectId ? strategies.filter((s) => s.ownerObjectId === ownerObjectId) : strategies;
}

export function getStudioStrategy(strategyId: string): StudioStrategy | undefined {
  return readDecisionEngineStore().strategies.find((s) => s.strategyId === strategyId);
}

function updateStrategyStatus(
  strategyId: string,
  status: StudioStrategy['status']
): StudioStrategy | undefined {
  let updated: StudioStrategy | undefined;

  mutateDecisionEngineStore((store) => {
    const idx = store.strategies.findIndex((s) => s.strategyId === strategyId);
    if (idx < 0) return store;

    updated = {
      ...store.strategies[idx],
      status,
      updatedAt: now(),
    };

    const strategies = [...store.strategies];
    strategies[idx] = updated;
    return { ...store, strategies };
  });

  return updated;
}
