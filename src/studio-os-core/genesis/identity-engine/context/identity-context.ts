import { listPermissionRefsForIdentity } from '../permissions/permission-engine';
import { listRolesForIdentity } from '../roles/role-engine';
import { listMembershipsForActor } from '../memberships/memberships';
import { listOutboundIdentityGraphEdges } from '../identity-graph/graph';
import { getIdentityRecord } from '../identity/registry';
import type { IdentityContext } from '../types';

/** Identity Context™ — resolved actor view for Authentication and Permissions Engine */
export function resolveIdentityContext(
  actorIdentityId: string,
  scopeIdentityId?: string
): IdentityContext | null {
  const actor = getIdentityRecord(actorIdentityId);
  if (!actor || actor.kind !== 'actor') return null;
  if (actor.lifecycleState !== 'active' && actor.lifecycleState !== 'pending') return null;

  const affiliations = listMembershipsForActor(actorIdentityId).filter(
    (m) => m.status === 'active' || m.status === 'pending'
  );

  const roles = listRolesForIdentity(actorIdentityId).filter((r) => {
    if (!scopeIdentityId) return true;
    return r.scopeIdentityId === scopeIdentityId;
  });

  const permissionRefs = listPermissionRefsForIdentity(actorIdentityId).filter((p) => {
    if (!scopeIdentityId) return true;
    return p.scopeIdentityId === scopeIdentityId;
  });

  const inheritedScopeIdentityIds: string[] = [];
  for (const edge of listOutboundIdentityGraphEdges(actorIdentityId)) {
    if (edge.edgeType === 'inherits_scope') {
      inheritedScopeIdentityIds.push(edge.toIdentityId);
    }
  }

  return {
    actorIdentityId,
    actorKind: actor.kind,
    identityType: actor.identityType,
    displayName: actor.displayName,
    lifecycleState: actor.lifecycleState,
    affiliations,
    roles,
    permissionRefs,
    organizationIds: actor.organizationIds,
    companyIds: actor.companyIds,
    inheritedScopeIdentityIds,
  };
}

export function resolveIdentityContextForCompany(
  actorIdentityId: string,
  companyIdentityId: string
): IdentityContext | null {
  return resolveIdentityContext(actorIdentityId, companyIdentityId);
}
