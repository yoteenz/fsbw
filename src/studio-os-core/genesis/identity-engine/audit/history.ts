import { mutateIdentityEngineStore, readIdentityEngineStore } from '../persistence';
import type { IdentityAuditEntry } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function createIdentityAuditId(): string {
  return `AUD-${Date.now().toString(36)}`;
}

export function appendIdentityAuditEntry(
  entry: Omit<IdentityAuditEntry, 'auditId' | 'timestamp'>
): IdentityAuditEntry {
  const audit: IdentityAuditEntry = {
    ...entry,
    auditId: createIdentityAuditId(),
    timestamp: now(),
  };

  mutateIdentityEngineStore((store) => ({
    ...store,
    auditHistory: [...store.auditHistory, audit],
    identities: store.identities.map((identity) =>
      identity.identityId === entry.identityId
        ? {
            ...identity,
            auditHistoryIds: [...identity.auditHistoryIds, audit.auditId],
            updatedAt: audit.timestamp,
          }
        : identity
    ),
  }));

  return audit;
}

export function listIdentityAuditHistory(identityId: string): IdentityAuditEntry[] {
  const store = readIdentityEngineStore();
  const identity = store.identities.find((i) => i.identityId === identityId);
  if (!identity) return [];
  return store.auditHistory.filter((a) => identity.auditHistoryIds.includes(a.auditId));
}

export function listAllIdentityAuditHistory(): IdentityAuditEntry[] {
  return [...readIdentityEngineStore().auditHistory];
}
