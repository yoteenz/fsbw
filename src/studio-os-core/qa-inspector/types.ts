import type {
  INSPECTOR_AUDIT_DOMAINS,
  INSPECTOR_FINDING_STATUSES,
  INSPECTOR_ISSUE_TYPES,
  INSPECTOR_SEVERITIES,
  QA_INSPECTOR_PHILOSOPHY,
} from './constants';

export type InspectorAuditDomain = (typeof INSPECTOR_AUDIT_DOMAINS)[number];
export type InspectorIssueType = (typeof INSPECTOR_ISSUE_TYPES)[number];
export type InspectorSeverity = (typeof INSPECTOR_SEVERITIES)[number];
export type InspectorFindingStatus = (typeof INSPECTOR_FINDING_STATUSES)[number];
export type QaInspectorPhilosophyLine = (typeof QA_INSPECTOR_PHILOSOPHY)[number];

export type QaInspectorFinding = {
  id: string;
  issueType: InspectorIssueType;
  issueLabel: string;
  domain: InspectorAuditDomain;
  domainLabel: string;
  severity: InspectorSeverity;
  confidencePct: number;
  rootCause: string;
  recommendedSolution: string;
  estimatedImpact: string;
  affectedSystems: string[];
  status: InspectorFindingStatus;
  detectedAt: string;
  recommendsOnly: true;
};

export type InspectorAuditRun = {
  id: string;
  startedAt: string;
  completedAt: string;
  domainsScanned: number;
  findingsCount: number;
  criticalCount: number;
  summary: string;
};

export type OrganizationQaInspectorProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  inspectorScore: number;
  openFindings: number;
  criticalFindings: number;
  lastAuditAt: string;
  findings: QaInspectorFinding[];
  recentAudits: InspectorAuditRun[];
  dockInspectorLine: string;
  inspectorActive: true;
  neverModifiesSilently: true;
  lastSyncedAt: string;
};

export type QaInspectorStore = {
  version: string;
  profiles: OrganizationQaInspectorProfile[];
};

export type QaInspectorDockAdvice = {
  response: string;
  concierge: string;
  openFindings?: number;
};

export type QaInspectorSearchHit = {
  type: 'finding' | 'domain' | 'audit';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
