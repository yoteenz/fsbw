import type {
  APPROVAL_STATUSES,
  READINESS_RISK_LEVELS,
  RELEASE_DISCIPLINES,
  RELEASE_GATES,
  RELEASE_READINESS_PHILOSOPHY,
} from './constants';

export type ReleaseDiscipline = (typeof RELEASE_DISCIPLINES)[number];
export type ReleaseGate = (typeof RELEASE_GATES)[number];
export type ReadinessRiskLevel = (typeof READINESS_RISK_LEVELS)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export type ReleaseReadinessPhilosophyLine = (typeof RELEASE_READINESS_PHILOSOPHY)[number];

export type DisciplineApproval = {
  id: string;
  discipline: ReleaseDiscipline;
  disciplineLabel: string;
  score: number;
  status: ApprovalStatus;
  approverSystem: string;
  openIssues: number;
  summary: string;
  requiredBeforeProduction: true;
};

export type ReadinessOpenIssue = {
  id: string;
  discipline: ReleaseDiscipline;
  disciplineLabel: string;
  severity: 'critical' | 'warning' | 'advisory';
  title: string;
  description: string;
  blockedSystems: string[];
  suggestedFix: string;
};

export type ProductionReadinessReport = {
  id: string;
  releaseId: string;
  releaseLabel: string;
  overallReadinessScore: number;
  riskLevel: ReadinessRiskLevel;
  confidence: number;
  releaseGate: ReleaseGate;
  openIssues: string[];
  blockedSystems: string[];
  requiredApprovals: string[];
  rollbackPreparedness: string;
  performanceSummary: string;
  designSummary: string;
  experienceSummary: string;
  securitySummary: string;
  readinessVerdict: string;
  openIssuesCount: number;
  approvalsGranted: number;
  approvalsRequired: number;
  generatedAt: string;
};

export type ExecutiveApprovalBrief = {
  id: string;
  releaseId: string;
  whatChanged: string;
  whyItChanged: string;
  expectedImpact: string;
  potentialRisks: string;
  rollbackPlan: string;
  recommendedDeploymentStrategy: string;
  studioIntelligenceSummary: string;
  executiveVerdict: string;
  briefedAt: string;
};

export type OrganizationReleaseReadinessProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallReadinessScore: number;
  releaseGate: ReleaseGate;
  confidence: number;
  openIssuesCount: number;
  blockedSystemsCount: number;
  approvalsGranted: number;
  approvalsRequired: number;
  disciplineApprovals: DisciplineApproval[];
  openIssues: ReadinessOpenIssue[];
  productionReports: ProductionReadinessReport[];
  executiveBriefs: ExecutiveApprovalBrief[];
  selectedReleaseId: string | null;
  dockReadinessLine: string;
  productionIsAPrivilege: true;
  lastSyncedAt: string;
};

export type ReleaseReadinessStore = {
  version: string;
  profiles: OrganizationReleaseReadinessProfile[];
};

export type ReleaseReadinessDockAdvice = {
  response: string;
  concierge: string;
  overallReadinessScore?: number;
  releaseGate?: ReleaseGate;
};

export type ReleaseReadinessSearchHit = {
  type: 'approval' | 'report' | 'issue' | 'executive' | 'gate';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
