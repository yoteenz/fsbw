import {
  ACTOR_IDENTITY_TYPES,
  ENTITY_IDENTITY_TYPES,
  type IdentityKind,
  type IdentityLifecycleState,
  type IdentityType,
} from '../constants';
import { appendIdentityAuditEntry } from '../audit/history';
import { mutateIdentityEngineStore, readIdentityEngineStore } from '../persistence';
import type {
  CreateIdentityInput,
  IdentityEngineValidationReport,
  IdentityRecord,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

export function createIdentityId(identityType: IdentityType): string {
  return `IDN-${identityType}-${Date.now().toString(36)}`;
}

function resolveKind(identityType: IdentityType): IdentityKind {
  if ((ACTOR_IDENTITY_TYPES as readonly string[]).includes(identityType)) return 'actor';
  if ((ENTITY_IDENTITY_TYPES as readonly string[]).includes(identityType)) return 'entity';
  return 'entity';
}

/** Identity Registry™ */
export function listIdentityRegistry(): IdentityRecord[] {
  return [...readIdentityEngineStore().identities];
}

export function getIdentityRecord(identityId: string): IdentityRecord | undefined {
  return readIdentityEngineStore().identities.find((i) => i.identityId === identityId);
}

export function searchIdentityRegistry(query: string): IdentityRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return listIdentityRegistry();
  return listIdentityRegistry().filter(
    (i) =>
      i.identityId.includes(q) ||
      i.displayName.toLowerCase().includes(q) ||
      i.officialName.toLowerCase().includes(q) ||
      i.identityType.includes(q)
  );
}

export function listIdentitiesByType(identityType: IdentityType): IdentityRecord[] {
  return listIdentityRegistry().filter((i) => i.identityType === identityType);
}

export function listIdentitiesByKind(kind: IdentityKind): IdentityRecord[] {
  return listIdentityRegistry().filter((i) => i.kind === kind);
}

export function createIdentityRecord(
  input: CreateIdentityInput,
  actorIdentityId: string | null = null
): IdentityRecord {
  const timestamp = now();
  const identityId = createIdentityId(input.identityType);
  const lifecycleState: IdentityLifecycleState = input.lifecycleState ?? 'active';

  const record: IdentityRecord = {
    identityId,
    identityType: input.identityType,
    kind: resolveKind(input.identityType),
    displayName: input.displayName,
    officialName: input.officialName ?? input.displayName,
    purpose: input.purpose,
    lifecycleState,
    status: lifecycleState,
    ownerIdentityId: input.ownerIdentityId ?? null,
    organizationIds: [],
    companyIds: [],
    relationshipIds: [],
    roleAssignmentIds: [],
    permissionRefIds: [],
    metadata: input.metadata ?? {},
    auditHistoryIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    version: '1.0.0',
  };

  mutateIdentityEngineStore((store) => ({
    ...store,
    identities: [...store.identities, record],
  }));

  appendIdentityAuditEntry({
    identityId,
    action: 'created',
    actorIdentityId,
    nextSnapshot: { ...record },
  });

  return record;
}

export function updateIdentityRecord(
  identityId: string,
  patch: Partial<
    Pick<
      IdentityRecord,
      'displayName' | 'officialName' | 'purpose' | 'metadata' | 'ownerIdentityId'
    >
  >,
  actorIdentityId: string | null = null
): IdentityRecord | undefined {
  const existing = getIdentityRecord(identityId);
  if (!existing) return undefined;

  const timestamp = now();
  let updated: IdentityRecord | undefined;

  mutateIdentityEngineStore((store) => {
    const identities = store.identities.map((identity) => {
      if (identity.identityId !== identityId) return identity;
      updated = {
        ...identity,
        ...patch,
        updatedAt: timestamp,
        version: identity.version,
      };
      return updated;
    });
    return { ...store, identities };
  });

  if (updated) {
    appendIdentityAuditEntry({
      identityId,
      action: 'updated',
      actorIdentityId,
      previousSnapshot: { ...existing },
      nextSnapshot: { ...updated },
    });
  }

  return updated;
}

export function setIdentityLifecycleState(
  identityId: string,
  lifecycleState: IdentityLifecycleState,
  actorIdentityId: string | null = null
): IdentityRecord | undefined {
  const existing = getIdentityRecord(identityId);
  if (!existing) return undefined;

  const action =
    lifecycleState === 'suspended'
      ? 'suspended'
      : lifecycleState === 'archived'
        ? 'archived'
        : 'updated';

  const timestamp = now();
  let updated: IdentityRecord | undefined;

  mutateIdentityEngineStore((store) => {
    const identities = store.identities.map((identity) => {
      if (identity.identityId !== identityId) return identity;
      updated = {
        ...identity,
        lifecycleState,
        status: lifecycleState,
        updatedAt: timestamp,
      };
      return updated;
    });
    return { ...store, identities };
  });

  if (updated) {
    appendIdentityAuditEntry({
      identityId,
      action,
      actorIdentityId,
      previousSnapshot: { lifecycleState: existing.lifecycleState },
      nextSnapshot: { lifecycleState },
    });
  }

  return updated;
}

export function validateIdentityEngineStore(): IdentityEngineValidationReport {
  const store = readIdentityEngineStore();
  const issues: IdentityEngineValidationReport['issues'] = [];
  const ids = new Set(store.identities.map((i) => i.identityId));

  for (const identity of store.identities) {
    if (!identity.displayName.trim()) {
      issues.push({
        code: 'MISSING_DISPLAY_NAME',
        message: 'Display name is required',
        identityId: identity.identityId,
      });
    }
    if (identity.ownerIdentityId && !ids.has(identity.ownerIdentityId)) {
      issues.push({
        code: 'UNKNOWN_OWNER',
        message: `Unknown owner "${identity.ownerIdentityId}"`,
        identityId: identity.identityId,
      });
    }
  }

  for (const edge of store.graphEdges) {
    if (!ids.has(edge.fromIdentityId)) {
      issues.push({
        code: 'UNKNOWN_GRAPH_FROM',
        message: `Graph edge from unknown identity "${edge.fromIdentityId}"`,
      });
    }
    if (!ids.has(edge.toIdentityId)) {
      issues.push({
        code: 'UNKNOWN_GRAPH_TO',
        message: `Graph edge to unknown identity "${edge.toIdentityId}"`,
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export function recomputeIdentityIndexes(): void {
  const store = readIdentityEngineStore();
  const timestamp = now();

  const orgIdsByIdentity = new Map<string, Set<string>>();
  const companyIdsByIdentity = new Map<string, Set<string>>();
  const edgeIdsByIdentity = new Map<string, Set<string>>();

  for (const edge of store.graphEdges) {
    if (!edgeIdsByIdentity.has(edge.fromIdentityId)) {
      edgeIdsByIdentity.set(edge.fromIdentityId, new Set());
    }
    edgeIdsByIdentity.get(edge.fromIdentityId)!.add(edge.edgeId);

    if (edge.edgeType === 'belongs_to') {
      const target = getIdentityRecord(edge.toIdentityId);
      if (target?.identityType === 'organization') {
        if (!orgIdsByIdentity.has(edge.fromIdentityId)) {
          orgIdsByIdentity.set(edge.fromIdentityId, new Set());
        }
        orgIdsByIdentity.get(edge.fromIdentityId)!.add(edge.toIdentityId);
      }
      if (target?.identityType === 'company') {
        if (!companyIdsByIdentity.has(edge.fromIdentityId)) {
          companyIdsByIdentity.set(edge.fromIdentityId, new Set());
        }
        companyIdsByIdentity.get(edge.fromIdentityId)!.add(edge.toIdentityId);
      }
    }
  }

  for (const membership of store.memberships) {
    if (membership.status === 'active' || membership.status === 'pending') {
      if (!orgIdsByIdentity.has(membership.actorIdentityId)) {
        orgIdsByIdentity.set(membership.actorIdentityId, new Set());
      }
      orgIdsByIdentity.get(membership.actorIdentityId)!.add(membership.organizationIdentityId);

      if (!companyIdsByIdentity.has(membership.actorIdentityId)) {
        companyIdsByIdentity.set(membership.actorIdentityId, new Set());
      }
      companyIdsByIdentity.get(membership.actorIdentityId)!.add(membership.companyIdentityId);
    }
  }

  const identities = store.identities.map((identity) => ({
    ...identity,
    organizationIds: [...(orgIdsByIdentity.get(identity.identityId) ?? [])],
    companyIds: [...(companyIdsByIdentity.get(identity.identityId) ?? [])],
    relationshipIds: [...(edgeIdsByIdentity.get(identity.identityId) ?? [])],
    roleAssignmentIds: store.roleAssignments
      .filter((r) => r.identityId === identity.identityId && !r.revokedAt)
      .map((r) => r.assignmentId),
    permissionRefIds: store.permissionRefs
      .filter((p) => p.identityId === identity.identityId && p.status === 'active')
      .map((p) => p.permissionRefId),
    updatedAt: timestamp,
  }));

  mutateIdentityEngineStore((current) => ({
    ...current,
    identities,
    lastRecomputedAt: timestamp,
  }));
}
