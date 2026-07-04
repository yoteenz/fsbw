/**
 * Studio OS Governance Engine v1.0 — trust, quality, compliance, and ecosystem health layer.
 */

export type TrustParticipantType =
  | 'workspace'
  | 'brand'
  | 'creator'
  | 'consultant'
  | 'developer'
  | 'agency'
  | 'enterprise'
  | 'service-provider'
  | 'ai-executive'
  | 'blueprint'
  | 'ecosystem-asset';

export type TrustScore = {
  id: string;
  workspaceId: string;
  participantId: string;
  participantName: string;
  participantType: TrustParticipantType;
  score: number;
  factors: {
    accountHistory: number;
    verification: number;
    projectCompletion: number;
    ratings: number;
    customerSatisfaction: number;
    policyCompliance: number;
    responseTime: number;
    paymentHistory: number;
    disputes: number;
    quality: number;
    communityContributions: number;
  };
  updatedAt: string;
};

export type VerificationType =
  | 'identity'
  | 'business'
  | 'workspace'
  | 'creator'
  | 'enterprise'
  | 'portfolio'
  | 'agency'
  | 'developer'
  | 'professional';

export type VerificationRequest = {
  id: string;
  workspaceId: string;
  participantId: string;
  participantName: string;
  type: VerificationType;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  submittedAt: string;
  reviewedAt?: string;
  badgeIssued: boolean;
};

export type QualityReviewStatus = 'pass' | 'pending' | 'fail';

export type QualityReview = {
  id: string;
  workspaceId: string;
  assetId: string;
  assetTitle: string;
  documentation: QualityReviewStatus;
  compatibility: QualityReviewStatus;
  security: QualityReviewStatus;
  dependencies: QualityReviewStatus;
  performance: QualityReviewStatus;
  branding: QualityReviewStatus;
  userExperience: QualityReviewStatus;
  reviewerNotes: string;
  reviewedAt: string;
};

export type CertificationType =
  | 'studio-os-consultant'
  | 'blueprint-architect'
  | 'automation-engineer'
  | 'creative-dna-designer'
  | 'executive-ai-designer'
  | 'implementation-partner'
  | 'enterprise-advisor';

export type Certification = {
  id: string;
  workspaceId: string;
  holderId: string;
  holderName: string;
  type: CertificationType;
  status: 'active' | 'expired' | 'pending-renewal' | 'revoked';
  issuedAt: string;
  expiresAt: string;
  renewalDueAt: string;
  examHistory: string[];
  continuingEducationHours: number;
  badgeId: string;
};

export type ModerationCategory =
  | 'abuse'
  | 'fraud'
  | 'spam'
  | 'impersonation'
  | 'copyright'
  | 'inappropriate-content'
  | 'unsafe-ai'
  | 'misleading-listing';

export type ModerationCase = {
  id: string;
  workspaceId: string;
  category: ModerationCategory;
  subjectId: string;
  subjectName: string;
  reporterId: string;
  status: 'open' | 'warned' | 'suspended' | 'removed' | 'restored' | 'escalated';
  policyRef: string;
  actionLog: string[];
  createdAt: string;
  resolvedAt?: string;
};

export type PolicyCategory =
  | 'terms'
  | 'community-guidelines'
  | 'marketplace-rules'
  | 'ai-policies'
  | 'privacy'
  | 'licensing'
  | 'developer'
  | 'partner';

export type Policy = {
  id: string;
  category: PolicyCategory;
  title: string;
  version: string;
  effectiveAt: string;
  summary: string;
};

export type AppealType = 'moderation' | 'verification' | 'trust-score' | 'certification' | 'marketplace';

export type Appeal = {
  id: string;
  workspaceId: string;
  participantId: string;
  participantName: string;
  type: AppealType;
  reason: string;
  status: 'submitted' | 'under-review' | 'approved' | 'denied';
  resolution?: string;
  submittedAt: string;
  resolvedAt?: string;
};

export type FraudAlert = {
  id: string;
  workspaceId: string;
  alertType:
    | 'fake-account'
    | 'fake-reviews'
    | 'payment-abuse'
    | 'duplicate-workspace'
    | 'identity-abuse'
    | 'marketplace-manipulation'
    | 'bot-activity'
    | 'artificial-engagement'
    | 'suspicious-behavior';
  subjectId: string;
  subjectName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'flagged' | 'investigating' | 'confirmed' | 'dismissed';
  flaggedAt: string;
};

export type ReputationRecord = {
  id: string;
  workspaceId: string;
  participantId: string;
  participantName: string;
  overall: number;
  professionalism: number;
  communication: number;
  quality: number;
  reliability: number;
  repeatBusiness: number;
  platformContributions: number;
  industryReputation: number;
  workspaceReputation: number;
  updatedAt: string;
};

export type EcosystemHealthMetrics = {
  creatorSuccessPct: number;
  businessSuccessPct: number;
  marketplaceLiquidity: number;
  customerSatisfaction: number;
  retentionPct: number;
  networkGrowthPct: number;
  qualityIndex: number;
  trustIndex: number;
  collaborationIndex: number;
  industryDiversity: number;
  overallHealthScore: number;
};

export type AiGovernanceRecord = {
  id: string;
  workspaceId: string;
  executiveId: string;
  executiveName: string;
  version: string;
  decisionLogCount: number;
  promptHistoryCount: number;
  knowledgeSources: string[];
  capabilityScope: string[];
  allowedActions: string[];
  restrictedActions: string[];
  humanApprovalRequired: boolean;
  confidenceLevel: 'low' | 'medium' | 'high';
  lastAuditAt: string;
};

export type AuditEventType =
  | 'verification'
  | 'certification'
  | 'payment'
  | 'marketplace-approval'
  | 'policy-change'
  | 'workspace-creation'
  | 'governance-action'
  | 'appeal'
  | 'executive-ai-update'
  | 'moderation'
  | 'quality-review';

export type AuditEvent = {
  id: string;
  workspaceId: string;
  type: AuditEventType;
  actorId: string;
  actorName: string;
  subjectId: string;
  subjectName: string;
  policyRef?: string;
  summary: string;
  timestamp: string;
  knowledgeGraphNodeId: string;
};

export type EnterpriseGovernanceRule = {
  id: string;
  workspaceId: string;
  orgName: string;
  departmentPolicies: string[];
  approvalChains: string[];
  workspacePermissions: string[];
  complianceReports: string[];
  auditExportEnabled: boolean;
  privateRules: string[];
};

export type GovernanceDashboardSnapshot = {
  ecosystemHealthScore: number;
  platformTrustScore: number;
  verificationQueue: number;
  moderationQueue: number;
  qualityReviewQueue: number;
  activeCertifications: number;
  policyViolations: number;
  openAppeals: number;
  securityAlerts: number;
  fraudFlags: number;
  complianceScore: number;
  platformHealthScore: number;
  aiGovernanceRecords: number;
  auditEventsToday: number;
};

export type GovernanceStore = {
  trustScores: TrustScore[];
  verificationRequests: VerificationRequest[];
  qualityReviews: QualityReview[];
  certifications: Certification[];
  moderationCases: ModerationCase[];
  policies: Policy[];
  appeals: Appeal[];
  fraudAlerts: FraudAlert[];
  reputations: ReputationRecord[];
  ecosystemHealth: EcosystemHealthMetrics;
  aiGovernance: AiGovernanceRecord[];
  auditEvents: AuditEvent[];
  enterpriseRules: EnterpriseGovernanceRule[];
  dashboard: GovernanceDashboardSnapshot;
  version: number;
};
