import type {
  ACCESSIBILITY_AUDITOR_PHILOSOPHY,
  ACCESSIBILITY_ISSUE_TYPES,
  ACCESSIBILITY_SEVERITIES,
  AUDIT_DIMENSIONS,
  SIMULATION_USER_TYPES,
  WCAG_LEVELS,
} from './constants';

export type AuditDimension = (typeof AUDIT_DIMENSIONS)[number];
export type SimulationUserType = (typeof SIMULATION_USER_TYPES)[number];
export type AccessibilityIssueType = (typeof ACCESSIBILITY_ISSUE_TYPES)[number];
export type AccessibilitySeverity = (typeof ACCESSIBILITY_SEVERITIES)[number];
export type WcagLevel = (typeof WCAG_LEVELS)[number];
export type AccessibilityPhilosophyLine = (typeof ACCESSIBILITY_AUDITOR_PHILOSOPHY)[number];

export type AccessibilityFinding = {
  id: string;
  issueType: AccessibilityIssueType;
  issueLabel: string;
  dimension: AuditDimension;
  dimensionLabel: string;
  severity: AccessibilitySeverity;
  pageId: string;
  pageLabel: string;
  affectedComponents: string[];
  description: string;
  estimatedUserImpact: string;
  suggestedImprovement: string;
};

export type AccessibilityPageReport = {
  id: string;
  pageId: string;
  pageLabel: string;
  route: string;
  accessibilityScore: number;
  wcagComplianceStatus: WcagLevel;
  issuesFound: number;
  highestSeverity: AccessibilitySeverity;
  affectedComponents: string[];
  suggestedImprovements: string[];
  estimatedUserImpact: string;
  inclusivelyUsable: boolean;
  accessibilityVerdict: string;
  auditedAt: string;
};

export type UserSimulationResult = {
  id: string;
  userType: SimulationUserType;
  userTypeLabel: string;
  pageId: string;
  pageLabel: string;
  accessibilityScore: number;
  barriersEncountered: number;
  summary: string;
  passed: boolean;
};

export type DimensionAuditScore = {
  dimension: AuditDimension;
  label: string;
  score: number;
  status: 'excellent' | 'watch' | 'needs-work';
  summary: string;
};

export type OrganizationAccessibilityAuditorProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallAccessibilityScore: number;
  pagesAudited: number;
  issuesOpen: number;
  pagesNeedingWork: number;
  averageWcagLevel: WcagLevel;
  dimensionScores: DimensionAuditScore[];
  findings: AccessibilityFinding[];
  pageReports: AccessibilityPageReport[];
  simulations: UserSimulationResult[];
  selectedPageId: string | null;
  dockAccessibilityLine: string;
  inclusiveDesignPhilosophy: true;
  lastSyncedAt: string;
};

export type AccessibilityAuditorStore = {
  version: string;
  profiles: OrganizationAccessibilityAuditorProfile[];
};

export type AccessibilityAuditorDockAdvice = {
  response: string;
  concierge: string;
  overallAccessibilityScore?: number;
  issuesOpen?: number;
};

export type AccessibilityAuditorSearchHit = {
  type: 'finding' | 'report' | 'simulation' | 'dimension';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
