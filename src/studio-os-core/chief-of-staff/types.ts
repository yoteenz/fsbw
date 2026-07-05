/** Chief of Staff V1.0 — founder's primary executive (Milestone 38). */

export type DecisionLevel = 1 | 2 | 3;

export type DelegationMode =
  | 'fully-autonomous'
  | 'chief-of-staff-only'
  | 'soft-approval'
  | 'founder-review'
  | 'manual-approval';

export type ApprovalStatus =
  | 'pending-cos'
  | 'soft-approved'
  | 'auto-approved'
  | 'escalated'
  | 'founder-approved'
  | 'founder-rejected'
  | 'returned-revision';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ExecutiveInboxItem = {
  id: string;
  submittedAt: string;
  executiveId: string;
  executiveTitle: string;
  department: string;
  category: string;
  title: string;
  summary: string;
  decisionLevel: DecisionLevel;
  status: ApprovalStatus;
  confidencePct: number;
  riskLevel: RiskLevel;
  supportingEvidence: string[];
  similarHistoricalApprovals: string[];
  reasoning: string;
  recommendedAction: string;
  evaluatedAgainst: string[];
  workspaceId: string;
};

export type ExecutiveLeader = {
  id: string;
  title: string;
  department: string;
  reportsTo: 'chief-of-staff';
  status: 'active' | 'coaching' | 'idle';
  pendingSubmissions: number;
  autoApprovalRatePct: number;
};

export type DepartmentStatus = {
  id: string;
  name: string;
  healthPct: number;
  autonomy: DelegationMode;
  pendingItems: number;
  autoApprovedToday: number;
  escalatedToday: number;
  executiveId: string;
};

export type FounderDecisionRecord = {
  id: string;
  timestamp: string;
  itemId: string;
  action: 'approved' | 'rejected' | 'edited';
  reason?: string;
  patternsLearned: string[];
};

export type ExecutiveCoachingNote = {
  id: string;
  executiveId: string;
  executiveTitle: string;
  issue: string;
  feedback: string;
  trainingRecommended: string;
  recurring: boolean;
};

export type MorningBriefing = {
  businessHealthSummary: string;
  departmentSummaries: string[];
  majorOpportunities: string[];
  majorRisks: string[];
  importantApprovals: string[];
  todayPriorities: string[];
  executiveRecommendations: string[];
  studioIntelligenceSummary: string;
  estimatedFounderWorkloadMins: number;
};

export type LeadershipTimelineEvent = {
  id: string;
  timestamp: string;
  type: 'approval' | 'decision' | 'delegation' | 'learning' | 'confidence';
  title: string;
  detail: string;
};

export type CrossWorkspaceInsight = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  insight: string;
  founderAttentionImpact: 'high' | 'medium' | 'low';
};

export type StudioIntelligenceAdvisory = {
  id: string;
  signal: string;
  recommendation: string;
  confidencePct: number;
};

export type ExecutiveMemoryProfile = {
  visualTaste: string[];
  writingStyle: string[];
  decisionPatterns: string[];
  qualityExpectations: string[];
  brandPhilosophy: string[];
  communicationPreferences: string[];
  longTermVision: string[];
  sources: string[];
};

export type ChiefOfStaffDashboard = {
  executiveSummary: string;
  todayPriorities: string[];
  itemsRequiringApproval: number;
  itemsAutoApproved: number;
  itemsRejected: number;
  itemsReturnedRevision: number;
  pendingRisks: number;
  pendingOpportunities: number;
  overallConfidencePct: number;
  estimatedFounderReviewMins: number;
  attentionProtectionNote: string;
};

export type ChiefOfStaffStore = {
  version: string;
  lastUpdatedAt: string;
  softApprovalThresholdPct: number;
  dashboard: ChiefOfStaffDashboard;
  morningBriefing: MorningBriefing;
  executiveInbox: ExecutiveInboxItem[];
  executiveLeadership: ExecutiveLeader[];
  departments: DepartmentStatus[];
  founderDecisions: FounderDecisionRecord[];
  coachingNotes: ExecutiveCoachingNote[];
  leadershipTimeline: LeadershipTimelineEvent[];
  crossWorkspaceInsights: CrossWorkspaceInsight[];
  studioIntelligenceAdvisories: StudioIntelligenceAdvisory[];
  executiveMemory: ExecutiveMemoryProfile;
  delegationByDepartment: Record<string, DelegationMode>;
};
