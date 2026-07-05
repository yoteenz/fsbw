/** Leadership DNA V1.0 — founder operating blueprint (Milestone 39). */

export type LeadershipProfileSectionId =
  | 'leadership-philosophy'
  | 'decision-framework'
  | 'communication-style'
  | 'creative-philosophy'
  | 'management-philosophy'
  | 'risk-profile'
  | 'delegation-profile'
  | 'approval-philosophy'
  | 'feedback-philosophy'
  | 'growth-philosophy'
  | 'long-term-vision';

export type LeadershipProfileSection = {
  id: LeadershipProfileSectionId;
  title: string;
  principles: string[];
  evolutionNotes: string[];
  lastUpdatedAt: string;
  confidencePct: number;
};

export type DecisionJournalEntry = {
  id: string;
  timestamp: string;
  decision: string;
  context: string;
  reasoning: string;
  alternativesConsidered: string[];
  expectedOutcome: string;
  actualOutcome?: string;
  lessonsLearned: string[];
  confidencePct: number;
  timeHorizon: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  workspaceId: string;
  knowledgeGraphNodeIds: string[];
  category: string;
};

export type ApprovalPattern = {
  id: string;
  domain: string;
  pattern: string;
  evidenceCount: number;
  confidencePct: number;
  examples: string[];
};

export type CreativeTasteSignal = {
  id: string;
  dimension: string;
  preference: string;
  strengthPct: number;
  lastObservedAt: string;
};

export type WritingIntelligenceSignal = {
  id: string;
  dimension: string;
  preference: string;
  writingDnaLink: string;
  strengthPct: number;
};

export type DelegationRecommendation = {
  id: string;
  domain: string;
  currentLevel: 'founder-only' | 'chief-of-staff' | 'soft-approval' | 'fully-delegated';
  recommendedLevel: 'founder-only' | 'chief-of-staff' | 'soft-approval' | 'fully-delegated';
  rationale: string;
  confidencePct: number;
};

export type RiskIntelligenceSignal = {
  id: string;
  category: string;
  tolerance: 'conservative' | 'moderate' | 'aggressive';
  trigger: string;
  observedPattern: string;
};

export type FeedbackIntelligenceSignal = {
  id: string;
  type: 'revision' | 'praise' | 'objection' | 'coaching';
  pattern: string;
  frequency: number;
  coachingNote: string;
};

export type LeadershipTimelineEvent = {
  id: string;
  timestamp: string;
  type: 'decision' | 'evolution' | 'confidence' | 'delegation' | 'trust' | 'maturity';
  title: string;
  detail: string;
  metricDelta?: string;
};

export type CrossCompanyLeadershipInsight = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  insight: string;
  appliesToAll: boolean;
};

export type LeadershipSimulatorScenario = {
  id: string;
  title: string;
  situation: string;
  historicalParallels: string[];
  pastOutcomes: string[];
  alternativeStrategies: string[];
  recommendedApproach: string;
  confidencePct: number;
};

export type InstitutionalLeadershipLesson = {
  id: string;
  sourceWorkspace: string;
  lesson: string;
  pattern: string;
  transferable: boolean;
};

export type ChiefOfStaffAlignmentCheck = {
  itemTitle: string;
  category: string;
  alignmentPct: number;
  wouldFounderApprove: boolean;
  recommendation: 'soft-approve' | 'revise' | 'escalate';
  evaluatedDimensions: string[];
  reasoning: string;
};

export type LeadershipDnaDashboard = {
  summary: string;
  principlesCount: number;
  decisionsLogged: number;
  approvalPatternsIdentified: number;
  overallConfidencePct: number;
  delegationGrowthPct: number;
  executiveTrustPct: number;
  organizationalMaturityPct: number;
  chiefOfStaffTrainingStatus: string;
};

export type LeadershipDnaStore = {
  version: string;
  lastUpdatedAt: string;
  cosAlignmentThresholdPct: number;
  dashboard: LeadershipDnaDashboard;
  founderProfile: LeadershipProfileSection[];
  leadershipPrinciples: string[];
  decisionJournal: DecisionJournalEntry[];
  approvalPatterns: ApprovalPattern[];
  creativeTaste: CreativeTasteSignal[];
  writingIntelligence: WritingIntelligenceSignal[];
  delegationRecommendations: DelegationRecommendation[];
  riskIntelligence: RiskIntelligenceSignal[];
  feedbackIntelligence: FeedbackIntelligenceSignal[];
  leadershipTimeline: LeadershipTimelineEvent[];
  crossCompanyInsights: CrossCompanyLeadershipInsight[];
  simulatorScenarios: LeadershipSimulatorScenario[];
  institutionalLessons: InstitutionalLeadershipLesson[];
  knowledgeGraphLinks: string[];
  connectedLayers: string[];
};
