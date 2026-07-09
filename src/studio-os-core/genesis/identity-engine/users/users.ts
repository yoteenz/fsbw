import {
  createIdentityRecord,
  getIdentityRecord,
  listIdentitiesByKind,
  listIdentitiesByType,
  setIdentityLifecycleState,
  updateIdentityRecord,
} from '../identity/registry';
import type { CreateUserInput, IdentityRecord } from '../types';

/** User actor identities — human actors (user, founder, employee, citizen) */
export function listUserIdentities(): IdentityRecord[] {
  return listIdentitiesByKind('actor').filter((i) =>
    ['user', 'founder', 'employee', 'citizen'].includes(i.identityType)
  );
}

export function getUserIdentity(identityId: string): IdentityRecord | undefined {
  const record = getIdentityRecord(identityId);
  if (!record || record.kind !== 'actor') return undefined;
  if (!['user', 'founder', 'employee', 'citizen'].includes(record.identityType)) {
    return undefined;
  }
  return record;
}

export function createUserIdentity(
  input: CreateUserInput,
  actorIdentityId: string | null = null
): IdentityRecord {
  return createIdentityRecord(
    {
      identityType: input.identityType ?? 'user',
      displayName: input.displayName,
      officialName: input.officialName,
      ownerIdentityId: input.ownerIdentityId ?? null,
      metadata: input.metadata,
      lifecycleState: 'active',
    },
    actorIdentityId
  );
}

export function suspendUserIdentity(
  identityId: string,
  actorIdentityId: string | null = null
): IdentityRecord | undefined {
  const user = getUserIdentity(identityId);
  if (!user) return undefined;
  return setIdentityLifecycleState(identityId, 'suspended', actorIdentityId);
}

export function archiveUserIdentity(
  identityId: string,
  actorIdentityId: string | null = null
): IdentityRecord | undefined {
  const user = getUserIdentity(identityId);
  if (!user) return undefined;
  return setIdentityLifecycleState(identityId, 'archived', actorIdentityId);
}

export function updateUserIdentityMetadata(
  identityId: string,
  metadata: Record<string, unknown>,
  actorIdentityId: string | null = null
): IdentityRecord | undefined {
  const user = getUserIdentity(identityId);
  if (!user) return undefined;
  return updateIdentityRecord(
    identityId,
    { metadata: { ...user.metadata, ...metadata } },
    actorIdentityId
  );
}

export function listUsersByType(
  identityType: Extract<IdentityRecord['identityType'], 'user' | 'founder' | 'employee' | 'citizen'>
): IdentityRecord[] {
  return listIdentitiesByType(identityType);
}
