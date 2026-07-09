import { appendIdentityAuditEntry } from '../audit/history';
import { mutateIdentityEngineStore, readIdentityEngineStore } from '../persistence';
import type { OwnershipRecord } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createOwnershipId(): string {
  return `OWN-${Date.now().toString(36)}`;
}

/** Ownership Registry™ */
export function listOwnershipRecords(): OwnershipRecord[] {
  return [...readIdentityEngineStore().ownershipRecords];
}

export function getOwnershipForIdentity(subjectIdentityId: string): OwnershipRecord | undefined {
  return listOwnershipRecords().find((o) => o.subjectIdentityId === subjectIdentityId);
}

export function registerOwnership(input: {
  subjectIdentityId: string;
  stewardIdentityId: string;
  organizationIdentityId: string | null;
  companyIdentityId: string | null;
  operatorIdentityIds?: string[];
}): OwnershipRecord {
  const timestamp = now();
  const record: OwnershipRecord = {
    ownershipId: createOwnershipId(),
    subjectIdentityId: input.subjectIdentityId,
    stewardIdentityId: input.stewardIdentityId,
    organizationIdentityId: input.organizationIdentityId,
    companyIdentityId: input.companyIdentityId,
    operatorIdentityIds: input.operatorIdentityIds ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateIdentityEngineStore((store) => ({
    ...store,
    ownershipRecords: [...store.ownershipRecords, record],
  }));

  return record;
}

export function transferOwnership(input: {
  subjectIdentityId: string;
  newStewardIdentityId: string;
  actorIdentityId?: string | null;
}): OwnershipRecord | undefined {
  const timestamp = now();
  let updated: OwnershipRecord | undefined;

  mutateIdentityEngineStore((store) => {
    const ownershipRecords = store.ownershipRecords.map((o) => {
      if (o.subjectIdentityId !== input.subjectIdentityId) return o;
      updated = {
        ...o,
        stewardIdentityId: input.newStewardIdentityId,
        transferredFrom: o.stewardIdentityId,
        updatedAt: timestamp,
      };
      return updated;
    });
    return { ...store, ownershipRecords };
  });

  if (updated) {
    appendIdentityAuditEntry({
      identityId: input.subjectIdentityId,
      action: 'ownership_transferred',
      actorIdentityId: input.actorIdentityId ?? null,
      previousSnapshot: { steward: updated.transferredFrom },
      nextSnapshot: { steward: input.newStewardIdentityId },
    });
  }

  return updated;
}

export function listStewardedIdentities(stewardIdentityId: string): OwnershipRecord[] {
  return listOwnershipRecords().filter((o) => o.stewardIdentityId === stewardIdentityId);
}
