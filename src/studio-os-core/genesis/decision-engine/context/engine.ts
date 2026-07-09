import { mutateDecisionEngineStore, readDecisionEngineStore } from '../persistence';
import type { ContextScope, ContextTimeframe } from '../constants';
import type { DecisionContextPackage } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createContextId(): string {
  return `CTX-${Date.now().toString(36)}`;
}

/** Context Engine™ — gather and persist decision context packages */
export function buildDecisionContext(input: {
  scope: ContextScope;
  timeframe?: ContextTimeframe;
  constraintObjectIds?: string[];
  relevantObjectIds?: string[];
  summary?: string;
  metadata?: Record<string, unknown>;
}): DecisionContextPackage {
  const context: DecisionContextPackage = {
    contextId: createContextId(),
    scope: input.scope,
    timeframe: input.timeframe ?? 'immediate',
    constraintObjectIds: input.constraintObjectIds ?? [],
    relevantObjectIds: input.relevantObjectIds ?? [],
    summary: input.summary,
    metadata: input.metadata ?? {},
    createdAt: now(),
  };

  mutateDecisionEngineStore((store) => ({
    ...store,
    contextPackages: [...store.contextPackages, context],
  }));

  return context;
}

export function getDecisionContext(contextId: string): DecisionContextPackage | undefined {
  return readDecisionEngineStore().contextPackages.find((c) => c.contextId === contextId);
}

export function listDecisionContexts(scope?: ContextScope): DecisionContextPackage[] {
  const packages = readDecisionEngineStore().contextPackages;
  return scope ? packages.filter((p) => p.scope === scope) : packages;
}

export function enrichDecisionContext(
  contextId: string,
  patch: Partial<
    Pick<
      DecisionContextPackage,
      'constraintObjectIds' | 'relevantObjectIds' | 'summary' | 'metadata'
    >
  >
): DecisionContextPackage | undefined {
  let updated: DecisionContextPackage | undefined;

  mutateDecisionEngineStore((store) => {
    const idx = store.contextPackages.findIndex((c) => c.contextId === contextId);
    if (idx < 0) return store;

    updated = {
      ...store.contextPackages[idx],
      ...patch,
      constraintObjectIds:
        patch.constraintObjectIds ?? store.contextPackages[idx].constraintObjectIds,
      relevantObjectIds:
        patch.relevantObjectIds ?? store.contextPackages[idx].relevantObjectIds,
      metadata: {
        ...store.contextPackages[idx].metadata,
        ...(patch.metadata ?? {}),
      },
    };

    const contextPackages = [...store.contextPackages];
    contextPackages[idx] = updated;
    return { ...store, contextPackages };
  });

  return updated;
}

export function resolveContextForObjects(objectIds: string[]): DecisionContextPackage[] {
  return readDecisionEngineStore().contextPackages.filter((ctx) =>
    objectIds.some(
      (id) =>
        ctx.relevantObjectIds.includes(id) ||
        ctx.constraintObjectIds.includes(id)
    )
  );
}
