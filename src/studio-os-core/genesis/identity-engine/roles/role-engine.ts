import { appendIdentityAuditEntry } from '../audit/history';
import { recomputeIdentityIndexes } from '../identity/registry';
import { mutateIdentityEngineStore, readIdentityEngineStore } from '../persistence';
import type { RoleScope } from '../constants';
import type { RoleAssignment } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createAssignmentId(): string {
  return `ROL-${Date.now().toString(36)}`;
}

/** Role Engine™ — declarative role assignments (Permissions Engine evaluates authority) */
export function listIdentityRoleAssignments(): RoleAssignment[] {
  return [...readIdentityEngineStore().roleAssignments];
}

export function listRolesForIdentity(identityId: string): RoleAssignment[] {
  return listIdentityRoleAssignments().filter(
    (r) => r.identityId === identityId && !r.revokedAt
  );
}

export function assignIdentityRole(input: {
  identityId: string;
  roleTemplate: string;
  scope: RoleScope;
  scopeIdentityId: string;
  source?: RoleAssignment['source'];
  effectiveFrom?: string;
  effectiveUntil?: string;
  actorIdentityId?: string | null;
}): RoleAssignment {
  const timestamp = now();
  const assignment: RoleAssignment = {
    assignmentId: createAssignmentId(),
    identityId: input.identityId,
    roleTemplate: input.roleTemplate,
    scope: input.scope,
    scopeIdentityId: input.scopeIdentityId,
    source: input.source ?? 'assignment',
    effectiveFrom: input.effectiveFrom,
    effectiveUntil: input.effectiveUntil,
    createdAt: timestamp,
  };

  mutateIdentityEngineStore((store) => ({
    ...store,
    roleAssignments: [...store.roleAssignments, assignment],
  }));

  appendIdentityAuditEntry({
    identityId: input.identityId,
    action: 'role_assigned',
    actorIdentityId: input.actorIdentityId ?? null,
    nextSnapshot: { assignment },
  });

  recomputeIdentityIndexes();
  return assignment;
}

export function revokeIdentityRole(
  assignmentId: string,
  actorIdentityId: string | null = null
): RoleAssignment | undefined {
  const timestamp = now();
  let updated: RoleAssignment | undefined;

  mutateIdentityEngineStore((store) => {
    const roleAssignments = store.roleAssignments.map((r) => {
      if (r.assignmentId !== assignmentId) return r;
      updated = { ...r, revokedAt: timestamp };
      return updated;
    });
    return { ...store, roleAssignments };
  });

  if (updated) {
    appendIdentityAuditEntry({
      identityId: updated.identityId,
      action: 'role_revoked',
      actorIdentityId,
      previousSnapshot: { assignmentId },
    });
    recomputeIdentityIndexes();
  }

  return updated;
}

export function listRoleTemplatesInScope(scopeIdentityId: string): string[] {
  const templates = new Set<string>();
  for (const r of listIdentityRoleAssignments()) {
    if (r.scopeIdentityId === scopeIdentityId && !r.revokedAt) {
      templates.add(r.roleTemplate);
    }
  }
  return [...templates];
}
