import { recomputeIdentityIndexes } from '../identity/registry';
import { mutateIdentityEngineStore, readIdentityEngineStore } from '../persistence';
import type { RoleScope } from '../constants';
import type { IdentityPermissionRef } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createPermissionRefId(): string {
  return `PRF-${Date.now().toString(36)}`;
}

/**
 * Identity Permission Engine™ — declarative permission subject refs only.
 * Does NOT evaluate allow/deny. Permissions Engine™ consumes these refs.
 */
export function listIdentityPermissionRefs(): IdentityPermissionRef[] {
  return [...readIdentityEngineStore().permissionRefs];
}

export function listPermissionRefsForIdentity(identityId: string): IdentityPermissionRef[] {
  return listIdentityPermissionRefs().filter(
    (p) => p.identityId === identityId && p.status === 'active'
  );
}

export function assignIdentityPermissionRef(input: {
  identityId: string;
  permissionKey: string;
  scope: RoleScope;
  scopeIdentityId: string;
  grantedByIdentityId?: string | null;
}): IdentityPermissionRef {
  const ref: IdentityPermissionRef = {
    permissionRefId: createPermissionRefId(),
    identityId: input.identityId,
    permissionKey: input.permissionKey,
    scope: input.scope,
    scopeIdentityId: input.scopeIdentityId,
    status: 'active',
    declarativeOnly: true,
    grantedByIdentityId: input.grantedByIdentityId ?? null,
    createdAt: now(),
  };

  mutateIdentityEngineStore((store) => ({
    ...store,
    permissionRefs: [...store.permissionRefs, ref],
  }));

  recomputeIdentityIndexes();
  return ref;
}

export function revokeIdentityPermissionRef(
  permissionRefId: string
): IdentityPermissionRef | undefined {
  const timestamp = now();
  let updated: IdentityPermissionRef | undefined;

  mutateIdentityEngineStore((store) => {
    const permissionRefs = store.permissionRefs.map((p) => {
      if (p.permissionRefId !== permissionRefId) return p;
      updated = { ...p, status: 'revoked', revokedAt: timestamp };
      return updated;
    });
    return { ...store, permissionRefs };
  });

  if (updated) recomputeIdentityIndexes();
  return updated;
}

export function buildIdentityPermissionSubjectBundle(identityId: string): {
  identityId: string;
  permissionRefs: IdentityPermissionRef[];
  declarativeOnly: true;
} {
  return {
    identityId,
    permissionRefs: listPermissionRefsForIdentity(identityId),
    declarativeOnly: true,
  };
}
