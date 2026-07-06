import type {
  APPROVAL_STATUSES,
  AUDIT_SOURCES,
  DECISION_AUDIT_PHILOSOPHY,
  DECISION_TYPES,
  TIMELINE_FILTERS,
} from './constants';

export type AuditSource = (typeof AUDIT_SOURCES)[number];
export type DecisionType = (typeof DECISION_TYPES)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export type TimelineFilter = (typeof TIMELINE_FILTERS)[number];
export type DecisionAuditPhilosophyLine = (typeof DECISION_AUDIT_PHILOSOPHY)[number];

export type DecisionRecord = {
  id: string;
  decisionType: DecisionType;
  decisionTypeLabel: string;
  decision: string;
  timestamp: string;
  decisionMaker: string;
  auditSource: AuditSource;
  auditSourceLabel: string;
  confidencePct: number;
  supportingEvidence: string[];
  knowledgeSourcesUsed: string[];
  alternativeOptionsConsidered: string[];
  potentialRisks: string[];
  businessImpact: string;
  organizationAffected: string;
  department: string;
  workflow: string;
  approvalStatus: ApprovalStatus;
  whyItHappened: string;
  relatedDocuments: string[];
  relatedConversations: string[];
  relatedWorkflows: string[];
  approvedBy: string | null;
};

export type DecisionTimelineEntry = {
  id: string;
  decisionId: string;
  timestamp: string;
  label: string;
  decisionMaker: string;
  approvalStatus: ApprovalStatus;
  auditSource: AuditSource;
  summary: string;
};

export type DecisionTimelineFilter = {
  period: TimelineFilter;
  source: AuditSource | 'all';
  department: string | 'all';
};

export type OrganizationDecisionAuditProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  accountabilityScore: number;
  totalDecisions: number;
  explainableDecisions: number;
  pendingApprovals: number;
  decisionsToday: number;
  decisions: DecisionRecord[];
  timeline: DecisionTimelineEntry[];
  activeFilter: DecisionTimelineFilter;
  selectedDecisionId: string | null;
  dockDecisionAuditLine: string;
  neverBlackBox: true;
  lastSyncedAt: string;
};

export type DecisionAuditStore = {
  version: string;
  profiles: OrganizationDecisionAuditProfile[];
};

export type DecisionAuditDockAdvice = {
  response: string;
  concierge: string;
  accountabilityScore?: number;
  totalDecisions?: number;
};

export type DecisionAuditSearchHit = {
  type: 'decision' | 'timeline';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
