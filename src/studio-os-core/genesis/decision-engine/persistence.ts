import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { DECISION_ENGINE_SUBSYSTEM_VERSION } from './constants';
import type { DecisionEngineStore } from './types';

export function emptyDecisionEngineStore(): DecisionEngineStore {
  return {
    version: DECISION_ENGINE_SUBSYSTEM_VERSION,
    decisions: [],
    recommendations: [],
    priorities: [],
    strategies: [],
    contextPackages: [],
    evidenceRecords: [],
    auditLog: [],
    learningRecords: [],
    history: [],
  };
}

export function readDecisionEngineStore(): DecisionEngineStore {
  const genesis = readGenesisStore();
  return genesis.decisionEngine ?? emptyDecisionEngineStore();
}

export function writeDecisionEngineStore(decisionEngine: DecisionEngineStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    decisionEngine: {
      ...emptyDecisionEngineStore(),
      ...decisionEngine,
      version: DECISION_ENGINE_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateDecisionEngineStore(
  mutator: (store: DecisionEngineStore) => DecisionEngineStore
): DecisionEngineStore {
  const current = readDecisionEngineStore();
  const next = mutator(current);
  writeDecisionEngineStore(next);
  return next;
}

export function ensureDecisionEngineStore(): DecisionEngineStore {
  const store = readDecisionEngineStore();
  if (!store.bootstrappedAt) {
    const seeded = {
      ...store,
      bootstrappedAt: new Date().toISOString(),
    };
    writeDecisionEngineStore(seeded);
    return seeded;
  }
  return store;
}
