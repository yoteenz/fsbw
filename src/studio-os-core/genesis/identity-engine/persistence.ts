import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { IDENTITY_ENGINE_SUBSYSTEM_VERSION } from './constants';
import type { IdentityEngineStore } from './types';

export function emptyIdentityEngineStore(): IdentityEngineStore {
  return {
    version: IDENTITY_ENGINE_SUBSYSTEM_VERSION,
    identities: [],
    graphEdges: [],
    roleAssignments: [],
    permissionRefs: [],
    memberships: [],
    ownershipRecords: [],
    invitations: [],
    auditHistory: [],
  };
}

export function readIdentityEngineStore(): IdentityEngineStore {
  const genesis = readGenesisStore();
  return genesis.identityEngine ?? emptyIdentityEngineStore();
}

export function writeIdentityEngineStore(identityEngine: IdentityEngineStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    identityEngine: {
      ...emptyIdentityEngineStore(),
      ...identityEngine,
      version: IDENTITY_ENGINE_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateIdentityEngineStore(
  mutator: (store: IdentityEngineStore) => IdentityEngineStore
): IdentityEngineStore {
  const current = readIdentityEngineStore();
  const next = mutator(current);
  writeIdentityEngineStore(next);
  return next;
}
