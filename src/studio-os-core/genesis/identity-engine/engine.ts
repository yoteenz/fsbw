import { readIdentityEngineStore } from './persistence';
import {
  ensureIdentityEngineStore,
  recomputeIdentityEngine,
  seedIdentityEngineStore,
} from './bootstrap/seed';
import {
  listIdentityRegistry,
  getIdentityRecord,
  searchIdentityRegistry,
  listIdentitiesByType,
  listIdentitiesByKind,
  createIdentityRecord,
  updateIdentityRecord,
  setIdentityLifecycleState,
  validateIdentityEngineStore,
  recomputeIdentityIndexes,
} from './identity/registry';
import {
  listUserIdentities,
  getUserIdentity,
  createUserIdentity,
  suspendUserIdentity,
  archiveUserIdentity,
} from './users/users';
import {
  listOrganizationIdentities,
  getOrganizationIdentity,
  createOrganizationIdentity,
  listActorsInOrganization,
} from './organizations/organizations';
import {
  listCompanyIdentities,
  getCompanyIdentity,
  createCompanyIdentity,
  listCompaniesInOrganization,
} from './companies/companies';
import {
  listIdentityRoleAssignments,
  listRolesForIdentity,
  assignIdentityRole,
  revokeIdentityRole,
  listRoleTemplatesInScope,
} from './roles/role-engine';
import {
  listIdentityPermissionRefs,
  listPermissionRefsForIdentity,
  assignIdentityPermissionRef,
  revokeIdentityPermissionRef,
  buildIdentityPermissionSubjectBundle,
} from './permissions/permission-engine';
import {
  listCompanyMemberships,
  listMembershipsForActor,
  listMembershipsForCompany,
  createCompanyMembership,
  terminateCompanyMembership,
  getPrimaryMembership,
} from './memberships/memberships';
import {
  listOwnershipRecords,
  getOwnershipForIdentity,
  registerOwnership,
  transferOwnership,
  listStewardedIdentities,
} from './ownership/ownership-registry';
import {
  listIdentityInvitations,
  listPendingInvitations,
  issueIdentityInvitation,
  acceptIdentityInvitation,
  revokeIdentityInvitation,
} from './invitations/invitation-system';
import {
  listAiWorkerIdentities,
  getAiWorkerIdentity,
  createAiWorkerIdentity,
  pauseAiWorkerIdentity,
  retireAiWorkerIdentity,
  listAiWorkersInOrganization,
} from './ai-workers/ai-workers';
import {
  addIdentityGraphEdge,
  removeIdentityGraphEdge,
  listIdentityGraphEdges,
  getIdentityGraphView,
  detectIdentityGraphCycles,
  listIdentityGraphDependents,
  listIdentityGraphDependencies,
} from './identity-graph/graph';
import {
  resolveIdentityContext,
  resolveIdentityContextForCompany,
} from './context/identity-context';
import {
  listIdentityAuditHistory,
  listAllIdentityAuditHistory,
} from './audit/history';
import {
  IDENTITY_ENGINE_SUBSYSTEM_NAME,
  IDENTITY_ENGINE_SUBSYSTEM_VERSION,
  IDENTITY_TYPES,
  IDENTITY_KINDS,
  IDENTITY_LIFECYCLE_STATES,
  IDENTITY_GRAPH_EDGE_TYPES,
} from './constants';
import type { IdentityEngineStats } from './types';
import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';

export function ensureIdentityEngineSubsystem() {
  const store = ensureIdentityEngineStore();
  if (store.seededAt && store.identities.length > 0) {
    updateBuildOrderSystemStatus('identity-engine', 'implemented');
  }
  return store;
}

export function getIdentityEnginePlatformStats(): IdentityEngineStats {
  const store = readIdentityEngineStore();
  const identities = store.identities;
  return {
    identityCount: identities.length,
    actorCount: identities.filter((i) => i.kind === 'actor').length,
    entityCount: identities.filter((i) => i.kind === 'entity').length,
    organizationCount: identities.filter((i) => i.identityType === 'organization').length,
    companyCount: identities.filter((i) => i.identityType === 'company').length,
    userCount: identities.filter((i) =>
      ['user', 'founder', 'employee', 'citizen'].includes(i.identityType)
    ).length,
    aiWorkerCount: identities.filter((i) => i.identityType === 'ai_worker').length,
    membershipCount: store.memberships.length,
    roleAssignmentCount: store.roleAssignments.filter((r) => !r.revokedAt).length,
    permissionRefCount: store.permissionRefs.filter((p) => p.status === 'active').length,
    invitationCount: store.invitations.length,
    graphEdgeCount: store.graphEdges.length,
  };
}

export {
  IDENTITY_ENGINE_SUBSYSTEM_NAME,
  IDENTITY_ENGINE_SUBSYSTEM_VERSION,
  IDENTITY_TYPES,
  IDENTITY_KINDS,
  IDENTITY_LIFECYCLE_STATES,
  IDENTITY_GRAPH_EDGE_TYPES,
  readIdentityEngineStore,
  ensureIdentityEngineStore,
  seedIdentityEngineStore,
  recomputeIdentityEngine,
  listIdentityRegistry,
  getIdentityRecord,
  searchIdentityRegistry,
  listIdentitiesByType,
  listIdentitiesByKind,
  createIdentityRecord,
  updateIdentityRecord,
  setIdentityLifecycleState,
  validateIdentityEngineStore,
  recomputeIdentityIndexes,
  listUserIdentities,
  getUserIdentity,
  createUserIdentity,
  suspendUserIdentity,
  archiveUserIdentity,
  listOrganizationIdentities,
  getOrganizationIdentity,
  createOrganizationIdentity,
  listActorsInOrganization,
  listCompanyIdentities,
  getCompanyIdentity,
  createCompanyIdentity,
  listCompaniesInOrganization,
  listIdentityRoleAssignments,
  listRolesForIdentity,
  assignIdentityRole,
  revokeIdentityRole,
  listRoleTemplatesInScope,
  listIdentityPermissionRefs,
  listPermissionRefsForIdentity,
  assignIdentityPermissionRef,
  revokeIdentityPermissionRef,
  buildIdentityPermissionSubjectBundle,
  listCompanyMemberships,
  listMembershipsForActor,
  listMembershipsForCompany,
  createCompanyMembership,
  terminateCompanyMembership,
  getPrimaryMembership,
  listOwnershipRecords,
  getOwnershipForIdentity,
  registerOwnership,
  transferOwnership,
  listStewardedIdentities,
  listIdentityInvitations,
  listPendingInvitations,
  issueIdentityInvitation,
  acceptIdentityInvitation,
  revokeIdentityInvitation,
  listAiWorkerIdentities,
  getAiWorkerIdentity,
  createAiWorkerIdentity,
  pauseAiWorkerIdentity,
  retireAiWorkerIdentity,
  listAiWorkersInOrganization,
  addIdentityGraphEdge,
  removeIdentityGraphEdge,
  listIdentityGraphEdges,
  getIdentityGraphView,
  detectIdentityGraphCycles,
  listIdentityGraphDependents,
  listIdentityGraphDependencies,
  resolveIdentityContext,
  resolveIdentityContextForCompany,
  listIdentityAuditHistory,
  listAllIdentityAuditHistory,
};

export type {
  IdentityEngineStats,
  IdentityRecord,
  IdentityGraphEdge,
  IdentityGraphView,
  RoleAssignment,
  IdentityPermissionRef,
  CompanyMembership,
  OwnershipRecord,
  IdentityInvitation,
  IdentityAuditEntry,
  IdentityContext,
  IdentityEngineValidationReport,
} from './types';
