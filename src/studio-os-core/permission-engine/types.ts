import type {
  APPROVAL_CHAIN_STEPS,
  CAPABILITY_VERBS,
  CONTEXT_DIMENSIONS,
  PERMISSION_ENGINE_PHILOSOPHY,
  ROLE_PROFILES,
} from './constants';

export type CapabilityVerb = (typeof CAPABILITY_VERBS)[number];
export type RoleProfileId = (typeof ROLE_PROFILES)[number];
export type ContextDimension = (typeof CONTEXT_DIMENSIONS)[number];
export type ApprovalChainStep = (typeof APPROVAL_CHAIN_STEPS)[number];
export type PermissionPhilosophyLine = (typeof PERMISSION_ENGINE_PHILOSOPHY)[number];

export type CapabilityEntry = {
  capabilityId: string;
  verb: CapabilityVerb;
  name: string;
  description: string;
  resource: string;
  modular: true;
  registered: boolean;
};

export type RoleComposition = {
  roleId: RoleProfileId;
  label: string;
  description: string;
  capabilityIds: string[];
  customizable: boolean;
  defaultForDepartment?: string;
};

export type ContextualPermissionRule = {
  ruleId: string;
  dimension: ContextDimension;
  label: string;
  description: string;
  conditions: string[];
  grantedCapabilities: string[];
  active: boolean;
};

export type ApprovalChainRecord = {
  chainId: string;
  action: string;
  requester: string;
  currentStep: ApprovalChainStep;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  steps: { step: ApprovalChainStep; actor?: string; actedAt?: string; decision?: string }[];
  traceable: true;
  createdAt: string;
};

export type PermissionAuditRecord = {
  auditId: string;
  eventType: 'granted' | 'revoked' | 'modified' | 'delegated' | 'expired' | 'security';
  actor: string;
  targetUser?: string;
  capabilityId?: string;
  roleId?: RoleProfileId;
  reason: string;
  affectedSystems: string[];
  organizationId: string;
  department?: string;
  occurredAt: string;
};

export type PermissionGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
};

export type PermissionHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type PermissionImprovementRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type OrganizationPermissionEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  engineScore: number;
  totalCapabilities: number;
  totalRoles: number;
  activeDelegations: number;
  capabilities: CapabilityEntry[];
  roles: RoleComposition[];
  contextualRules: ContextualPermissionRule[];
  approvalChains: ApprovalChainRecord[];
  auditHistory: PermissionAuditRecord[];
  recommendations: PermissionImprovementRecommendation[];
  governanceFindings: PermissionGovernanceFinding[];
  healthMetrics: PermissionHealthMetric[];
  capabilityCoveragePct: number;
  dockPermissionLine: string;
  capabilityBasedAccess: true;
  lastSyncedAt: string;
};

export type PermissionEngineStore = {
  version: string;
  profiles: OrganizationPermissionEngineProfile[];
};

export type PermissionEngineDockAdvice = {
  response: string;
  concierge: string;
  engineScore?: number;
};

export type PermissionSearchHit =
  | { type: 'capability'; entry: CapabilityEntry; score: number; matchReason: string }
  | { type: 'role'; entry: RoleComposition; score: number; matchReason: string };

export type AccessCheckResult = {
  allowed: boolean;
  capabilityId: string;
  roleId?: RoleProfileId;
  explanation: string;
  missingCapabilities?: string[];
  contextualBlock?: string;
};
