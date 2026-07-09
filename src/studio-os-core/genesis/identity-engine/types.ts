import type {
  IdentityGraphEdgeType,
  IdentityKind,
  IdentityLifecycleState,
  IdentityType,
  InvitationStatus,
  MembershipStatus,
  PermissionRefStatus,
  RoleScope,
} from './constants';

/** Canonical identity record — every actor and entity in Studio World */
export type IdentityRecord = {
  identityId: string;
  identityType: IdentityType;
  kind: IdentityKind;
  displayName: string;
  officialName: string;
  purpose?: string;
  lifecycleState: IdentityLifecycleState;
  status: IdentityLifecycleState;
  ownerIdentityId: string | null;
  organizationIds: string[];
  companyIds: string[];
  relationshipIds: string[];
  roleAssignmentIds: string[];
  permissionRefIds: string[];
  metadata: Record<string, unknown>;
  auditHistoryIds: string[];
  createdAt: string;
  updatedAt: string;
  version: string;
};

export type IdentityGraphEdge = {
  edgeId: string;
  fromIdentityId: string;
  toIdentityId: string;
  edgeType: IdentityGraphEdgeType;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type RoleAssignment = {
  assignmentId: string;
  identityId: string;
  roleTemplate: string;
  scope: RoleScope;
  scopeIdentityId: string;
  source: 'invitation' | 'assignment' | 'inheritance' | 'system';
  effectiveFrom?: string;
  effectiveUntil?: string;
  createdAt: string;
  revokedAt?: string;
};

export type IdentityPermissionRef = {
  permissionRefId: string;
  identityId: string;
  permissionKey: string;
  scope: RoleScope;
  scopeIdentityId: string;
  status: PermissionRefStatus;
  /** Declarative subject ref — evaluated by Permissions Engine™, not Identity Engine */
  declarativeOnly: true;
  grantedByIdentityId: string | null;
  createdAt: string;
  revokedAt?: string;
};

export type CompanyMembership = {
  membershipId: string;
  actorIdentityId: string;
  companyIdentityId: string;
  organizationIdentityId: string;
  membershipType: 'employee' | 'founder' | 'contractor' | 'ai_worker' | 'client' | 'partner';
  status: MembershipStatus;
  primary: boolean;
  joinedAt: string;
  terminatedAt?: string;
};

export type OwnershipRecord = {
  ownershipId: string;
  subjectIdentityId: string;
  stewardIdentityId: string;
  organizationIdentityId: string | null;
  companyIdentityId: string | null;
  operatorIdentityIds: string[];
  transferredFrom?: string;
  createdAt: string;
  updatedAt: string;
};

export type IdentityInvitation = {
  invitationId: string;
  invitationType: 'membership' | 'role' | 'partner' | 'client' | 'vendor' | 'ai_worker';
  targetEmail: string | null;
  targetIdentityId: string | null;
  invitedByIdentityId: string;
  scopeIdentityId: string;
  roleTemplate?: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
};

export type IdentityAuditEntry = {
  auditId: string;
  identityId: string;
  action:
    | 'created'
    | 'updated'
    | 'suspended'
    | 'archived'
    | 'role_assigned'
    | 'role_revoked'
    | 'ownership_transferred'
    | 'membership_created'
    | 'membership_terminated'
    | 'invitation_issued'
    | 'invitation_accepted'
    | 'graph_edge_added'
    | 'graph_edge_removed';
  actorIdentityId: string | null;
  previousSnapshot?: Record<string, unknown>;
  nextSnapshot?: Record<string, unknown>;
  correlationId?: string;
  timestamp: string;
};

export type IdentityEngineStore = {
  version: string;
  identities: IdentityRecord[];
  graphEdges: IdentityGraphEdge[];
  roleAssignments: RoleAssignment[];
  permissionRefs: IdentityPermissionRef[];
  memberships: CompanyMembership[];
  ownershipRecords: OwnershipRecord[];
  invitations: IdentityInvitation[];
  auditHistory: IdentityAuditEntry[];
  seededAt?: string;
  bootstrappedAt?: string;
  lastRecomputedAt?: string;
};

export type IdentitySeedInput = Omit<
  IdentityRecord,
  | 'relationshipIds'
  | 'roleAssignmentIds'
  | 'permissionRefIds'
  | 'organizationIds'
  | 'companyIds'
  | 'auditHistoryIds'
  | 'createdAt'
  | 'updatedAt'
  | 'version'
>;

export type IdentityGraphView = {
  nodes: string[];
  edges: IdentityGraphEdge[];
};

export type IdentityContext = {
  actorIdentityId: string;
  actorKind: IdentityKind;
  identityType: IdentityType;
  displayName: string;
  lifecycleState: IdentityLifecycleState;
  affiliations: CompanyMembership[];
  roles: RoleAssignment[];
  permissionRefs: IdentityPermissionRef[];
  organizationIds: string[];
  companyIds: string[];
  inheritedScopeIdentityIds: string[];
};

export type IdentityEngineStats = {
  identityCount: number;
  actorCount: number;
  entityCount: number;
  organizationCount: number;
  companyCount: number;
  userCount: number;
  aiWorkerCount: number;
  membershipCount: number;
  roleAssignmentCount: number;
  permissionRefCount: number;
  invitationCount: number;
  graphEdgeCount: number;
};

export type IdentityEngineValidationReport = {
  valid: boolean;
  issues: { code: string; message: string; identityId?: string }[];
};

export type CreateIdentityInput = {
  identityType: IdentityType;
  displayName: string;
  officialName?: string;
  purpose?: string;
  ownerIdentityId?: string | null;
  lifecycleState?: IdentityLifecycleState;
  metadata?: Record<string, unknown>;
};

export type CreateUserInput = {
  displayName: string;
  officialName?: string;
  identityType?: Extract<IdentityType, 'user' | 'founder' | 'employee' | 'citizen'>;
  ownerIdentityId?: string | null;
  metadata?: Record<string, unknown>;
};

export type CreateAiWorkerInput = {
  displayName: string;
  officialName?: string;
  ownerIdentityId: string;
  organizationIdentityId: string;
  companyIdentityId?: string;
  roleTemplate?: string;
  metadata?: Record<string, unknown>;
};

export type CreateOrganizationInput = {
  displayName: string;
  officialName?: string;
  stewardIdentityId: string;
  metadata?: Record<string, unknown>;
};

export type CreateCompanyInput = {
  displayName: string;
  officialName?: string;
  organizationIdentityId: string;
  stewardIdentityId: string;
  metadata?: Record<string, unknown>;
};
