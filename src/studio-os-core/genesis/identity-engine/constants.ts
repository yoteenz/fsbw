/** Studio OS Identity Engine™ — infrastructure constants */

export const IDENTITY_ENGINE_SUBSYSTEM_VERSION = '1.0.0';
export const IDENTITY_ENGINE_SUBSYSTEM_NAME = 'Identity Engine™';

export const IDENTITY_KINDS = ['actor', 'entity'] as const;
export type IdentityKind = (typeof IDENTITY_KINDS)[number];

export const IDENTITY_LIFECYCLE_STATES = [
  'pending',
  'active',
  'suspended',
  'archived',
  'deprecated',
] as const;
export type IdentityLifecycleState = (typeof IDENTITY_LIFECYCLE_STATES)[number];

export const IDENTITY_TYPES = [
  'user',
  'founder',
  'employee',
  'citizen',
  'ai_worker',
  'organization',
  'company',
  'department',
  'headquarters',
  'room',
  'workspace',
  'team',
  'client',
  'vendor',
  'partner',
  'mentor',
  'student',
  'profession_brain',
  'asset',
  'product',
  'community',
] as const;
export type IdentityType = (typeof IDENTITY_TYPES)[number];

export const ACTOR_IDENTITY_TYPES = [
  'user',
  'founder',
  'employee',
  'citizen',
  'ai_worker',
  'client',
  'vendor',
  'partner',
  'mentor',
  'student',
] as const;

export const ENTITY_IDENTITY_TYPES = [
  'organization',
  'company',
  'department',
  'headquarters',
  'room',
  'workspace',
  'team',
  'profession_brain',
  'asset',
  'product',
  'community',
] as const;

export const IDENTITY_GRAPH_EDGE_TYPES = [
  'belongs_to',
  'owns',
  'contains',
  'operates',
  'affiliated_with',
  'represents',
  'inherits_scope',
  'composed_of',
  'credential_linked',
  'cross_company_link',
  'shared_asset_access',
] as const;
export type IdentityGraphEdgeType = (typeof IDENTITY_GRAPH_EDGE_TYPES)[number];

export const MEMBERSHIP_STATUSES = ['pending', 'active', 'suspended', 'terminated'] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const INVITATION_STATUSES = ['pending', 'accepted', 'expired', 'revoked'] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export const PERMISSION_REF_STATUSES = ['active', 'revoked'] as const;
export type PermissionRefStatus = (typeof PERMISSION_REF_STATUSES)[number];

export const ROLE_SCOPES = [
  'organization',
  'company',
  'department',
  'workspace',
  'team',
  'asset',
  'system',
] as const;
export type RoleScope = (typeof ROLE_SCOPES)[number];
