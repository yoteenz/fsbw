import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { INTERACTION_MODEL_SUBSYSTEM_VERSION } from './constants';
import type { InteractionModelStore } from './types';

export function emptyInteractionModelStore(): InteractionModelStore {
  return {
    version: INTERACTION_MODEL_SUBSYSTEM_VERSION,
    interactions: [],
    events: [],
    workflows: [],
    commands: [],
    messages: [],
    notifications: [],
    auditLog: [],
    automations: [],
    synchronizations: [],
  };
}

export function readInteractionModelStore(): InteractionModelStore {
  const genesis = readGenesisStore();
  return genesis.interactionModel ?? emptyInteractionModelStore();
}

export function writeInteractionModelStore(interactionModel: InteractionModelStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    interactionModel: {
      ...emptyInteractionModelStore(),
      ...interactionModel,
      version: INTERACTION_MODEL_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateInteractionModelStore(
  mutator: (store: InteractionModelStore) => InteractionModelStore
): InteractionModelStore {
  const current = readInteractionModelStore();
  const next = mutator(current);
  writeInteractionModelStore(next);
  return next;
}

export function ensureInteractionModelStore(): InteractionModelStore {
  const store = readInteractionModelStore();
  if (!store.bootstrappedAt) {
    const seeded = {
      ...store,
      bootstrappedAt: new Date().toISOString(),
    };
    writeInteractionModelStore(seeded);
    return seeded;
  }
  return store;
}
