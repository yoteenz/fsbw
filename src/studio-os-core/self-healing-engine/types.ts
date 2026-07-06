import type {
  HEALING_CATEGORIES,
  HEALING_MODES,
  HEALING_RISK_LEVELS,
  RECOVERY_PRIORITIES,
  REPAIR_STATUSES,
  RESTRICTED_DOMAINS,
  SELF_HEALING_ENGINE_PHILOSOPHY,
} from './constants';

export type HealingCategory = (typeof HEALING_CATEGORIES)[number];
export type HealingMode = (typeof HEALING_MODES)[number];
export type HealingRiskLevel = (typeof HEALING_RISK_LEVELS)[number];
export type RepairStatus = (typeof REPAIR_STATUSES)[number];
export type RecoveryPriority = (typeof RECOVERY_PRIORITIES)[number];
export type RestrictedDomain = (typeof RESTRICTED_DOMAINS)[number];
export type SelfHealingPhilosophyLine = (typeof SELF_HEALING_ENGINE_PHILOSOPHY)[number];

export type HealingThresholds = {
  autoRepairMaxRisk: HealingRiskLevel;
  approvalRequiredRisk: HealingRiskLevel;
  autoRepairConfidenceMin: number;
  maxAutoRepairsPerDay: number;
};

export type HealingIssue = {
  id: string;
  category: HealingCategory;
  categoryLabel: string;
  title: string;
  description: string;
  rootCause: string;
  riskLevel: HealingRiskLevel;
  confidencePct: number;
  systemsAffected: string[];
  restrictedDomain: RestrictedDomain | null;
  autoRepairEligible: boolean;
  detectedAt: string;
  status: RepairStatus;
};

export type HealingRepair = {
  id: string;
  issueId: string;
  issueDetected: string;
  rootCause: string;
  repairPerformed: string;
  confidencePct: number;
  systemsAffected: string[];
  rollbackOption: string;
  mode: HealingMode;
  riskLevel: HealingRiskLevel;
  repairedAt: string;
  auditLogId: string;
};

export type HealingAuditLogEntry = {
  id: string;
  timestamp: string;
  eventType: 'detected' | 'repaired' | 'approved' | 'rolled-back' | 'recovery-planned' | 'dismissed';
  issueId: string;
  title: string;
  summary: string;
  confidencePct: number;
  systemsAffected: string[];
  rollbackAvailable: boolean;
};

export type RecoveryPlan = {
  id: string;
  issueId: string;
  problemSummary: string;
  rootCauseAnalysis: string;
  stepByStepPlan: string[];
  estimatedDowntime: string;
  businessImpact: string;
  recommendedPriority: RecoveryPriority;
  systemsAffected: string[];
  preparedAt: string;
  status: 'draft' | 'ready' | 'in-progress' | 'completed';
};

export type OrganizationSelfHealingEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  resilienceScore: number;
  activeHealingMode: HealingMode;
  healingThresholds: HealingThresholds;
  issuesDetected: number;
  autoRepairsToday: number;
  pendingApprovals: number;
  recoveryPlansReady: number;
  issues: HealingIssue[];
  repairs: HealingRepair[];
  recoveryPlans: RecoveryPlan[];
  auditLog: HealingAuditLogEntry[];
  dockSelfHealingLine: string;
  intelligentResilienceNotAutonomousControl: true;
  lastSyncedAt: string;
};

export type SelfHealingEngineStore = {
  version: string;
  profiles: OrganizationSelfHealingEngineProfile[];
};

export type SelfHealingEngineDockAdvice = {
  response: string;
  concierge: string;
  resilienceScore?: number;
  pendingApprovals?: number;
};

export type SelfHealingEngineSearchHit = {
  type: 'issue' | 'repair' | 'recovery' | 'audit';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
