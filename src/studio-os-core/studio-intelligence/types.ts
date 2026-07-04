/**
 * Studio Intelligence v1.0 — strategic operating intelligence layer for Studio OS.
 * Not another AI assistant — the chief intelligence officer for every workspace.
 */

export type BriefingCadence = 'morning' | 'weekly' | 'monthly' | 'quarterly';

export type ExecutiveBriefing = {
  id: string;
  workspaceId: string;
  cadence: BriefingCadence;
  generatedAt: string;
  topOpportunities: string[];
  topRisks: string[];
  performanceChanges: string[];
  recommendedActions: string[];
  deadlines: string[];
  marketplaceOpportunities: string[];
  revenueInsights: string[];
  experimentResults: string[];
  executiveAiSummaries: string[];
  growthRecommendations: string[];
};

export type WorkspaceSignal = {
  id: string;
  workspaceId: string;
  category:
    | 'traffic'
    | 'sales'
    | 'conversion'
    | 'content'
    | 'engagement'
    | 'automation'
    | 'campaigns'
    | 'revenue'
    | 'expenses'
    | 'marketplace'
    | 'contracts'
    | 'customer-behavior'
    | 'team-activity';
  metric: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  trendPct: number;
  insight: string;
  updatedAt: string;
};

export type OpportunityRecommendation = {
  id: string;
  workspaceId: string;
  title: string;
  category:
    | 'sponsorship'
    | 'partnership'
    | 'affiliate'
    | 'product-idea'
    | 'asset-optimization'
    | 'campaign-expansion'
    | 'industry-entry'
    | 'collaborator'
    | 'hire';
  why: string;
  expectedImpact: string;
  confidence: number;
  supportingEvidence: string[];
  knowledgeGraphNodeIds: string[];
  createdAt: string;
};

export type RiskAlert = {
  id: string;
  workspaceId: string;
  title: string;
  category:
    | 'revenue-concentration'
    | 'declining-engagement'
    | 'customer-churn'
    | 'underperforming-campaign'
    | 'workflow-bottleneck'
    | 'team-overload'
    | 'contract-risk'
    | 'cash-flow'
    | 'dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendedAction: string;
  supportingEvidence: string[];
  createdAt: string;
};

export type ExecutiveSynthesis = {
  id: string;
  workspaceId: string;
  executiveId: string;
  executiveName: string;
  role: string;
  unifiedSummary: string;
  keyFindings: string[];
  synthesizedAt: string;
};

export type CrossWorkspaceInsight = {
  id: string;
  ownerId: string;
  insightType:
    | 'shared-audience'
    | 'shared-assets'
    | 'cross-sell'
    | 'shared-vendor'
    | 'duplicate-workflow'
    | 'shared-automation'
    | 'knowledge-reuse';
  workspaceIds: string[];
  title: string;
  recommendation: string;
  expectedImpact: string;
  confidence: number;
};

export type InstitutionalLearning = {
  id: string;
  workspaceId: string;
  sourceType: 'launch' | 'campaign' | 'marketplace' | 'experiment' | 'milestone' | 'failure';
  title: string;
  outcome: 'success' | 'failure' | 'mixed';
  learning: string;
  approvedByFounder: boolean;
  memoryBibleLinked: boolean;
  knowledgeGraphNodeId: string;
  recordedAt: string;
};

export type IntelligenceRecommendation = {
  id: string;
  workspaceId: string;
  recommendType:
    | 'campaign'
    | 'experiment'
    | 'hire'
    | 'partnership'
    | 'product'
    | 'automation'
    | 'platform'
    | 'revenue-stream';
  title: string;
  why: string;
  historicalEvidence: string[];
  confidence: number;
  relatedExperiments: string[];
  similarOutcomes: string[];
  potentialRisks: string[];
  alternatives: string[];
  knowledgeGraphNodeIds: string[];
  createdAt: string;
};

export type BusinessHealthCategory =
  | 'financial'
  | 'growth'
  | 'operations'
  | 'automation'
  | 'customer-satisfaction'
  | 'brand-strength'
  | 'marketplace'
  | 'team-health'
  | 'risk-exposure'
  | 'knowledge-maturity';

export type BusinessHealthScore = {
  workspaceId: string;
  overall: number;
  trend: 'up' | 'down' | 'flat';
  categoryScores: Record<BusinessHealthCategory, number>;
  priorityImprovements: string[];
  updatedAt: string;
};

export type DecisionJournalEntry = {
  id: string;
  workspaceId: string;
  decision: string;
  reason: string;
  expectedOutcome: string;
  actualOutcome?: string;
  lessonsLearned?: string;
  memoryBibleNodeId: string;
  knowledgeGraphNodeId: string;
  decidedAt: string;
  reviewedAt?: string;
};

export type LearningRecord = {
  id: string;
  workspaceId: string;
  sourceType: 'experiment' | 'campaign' | 'partnership' | 'launch' | 'success' | 'failure';
  title: string;
  pattern: 'temporary-trend' | 'durable-pattern';
  insight: string;
  confidence: number;
  recordedAt: string;
};

export type ConfidenceBreakdown = {
  recommendationId: string;
  confidenceScore: number;
  supportingData: string[];
  relatedExperiments: string[];
  similarHistoricalOutcomes: string[];
  potentialRisks: string[];
  alternativeRecommendations: string[];
};

export type IntelligenceDashboardSnapshot = {
  briefingReady: boolean;
  priorityQueueCount: number;
  businessHealthScore: number;
  opportunityCount: number;
  riskAlertCount: number;
  activeRecommendations: number;
  learningHighlights: number;
  institutionalUpdates: number;
  executiveSummaries: number;
  crossWorkspaceInsights: number;
};

export type StudioIntelligenceStore = {
  briefings: ExecutiveBriefing[];
  workspaceSignals: WorkspaceSignal[];
  opportunities: OpportunityRecommendation[];
  risks: RiskAlert[];
  executiveSynthesis: ExecutiveSynthesis[];
  crossWorkspaceInsights: CrossWorkspaceInsight[];
  institutionalLearnings: InstitutionalLearning[];
  recommendations: IntelligenceRecommendation[];
  businessHealth: BusinessHealthScore | null;
  decisionJournal: DecisionJournalEntry[];
  learningRecords: LearningRecord[];
  confidenceBreakdowns: ConfidenceBreakdown[];
  dashboard: IntelligenceDashboardSnapshot;
  version: number;
};
