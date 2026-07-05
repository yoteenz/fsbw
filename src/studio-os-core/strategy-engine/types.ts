/** Strategy Engine V1.0 — defines the game each company is playing (Milestone 43). */

export type WorkspaceStrategyId = 'ndxbook' | 'frontal-slayer' | 'vxd' | 'studio-os' | 'custom';

export type StrategyTypeId =
  | 'growth'
  | 'content'
  | 'brand'
  | 'revenue'
  | 'product'
  | 'partnership'
  | 'talent'
  | 'marketplace'
  | 'community'
  | 'distribution'
  | 'customer-experience'
  | 'operational'
  | 'launch';

export type StrategyHierarchyLevel =
  | 'vision'
  | 'mission'
  | 'company-objective'
  | 'strategy'
  | 'initiatives'
  | 'campaigns'
  | 'projects'
  | 'tasks'
  | 'outcomes';

export type GrowthStage = 'idea' | 'validation' | 'traction' | 'scale' | 'maturity';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
export type InitiativeStatus = 'planned' | 'active' | 'paused' | 'complete' | 'cancelled';
export type InitiativePriority = 'critical' | 'high' | 'medium' | 'low';
export type BetStatus = 'hypothesis' | 'testing' | 'validated' | 'invalidated' | 'archived';

export type StrategyProfile = {
  workspaceId: WorkspaceStrategyId;
  workspaceLabel: string;
  companyObjective: string;
  primaryGoal: string;
  secondaryGoals: string[];
  northStarMetric: string;
  northStarCurrent: string;
  northStarTarget: string;
  primaryKpi: string;
  secondaryKpis: string[];
  timeHorizon: string;
  growthStage: GrowthStage;
  businessModel: string;
  targetAudience: string;
  marketPosition: string;
  competitiveAngle: string;
  revenueStrategy: string;
  brandStrategy: string;
  contentStrategy: string;
  partnershipStrategy: string;
  talentStrategy: string;
  riskTolerance: RiskTolerance;
  currentConstraints: string[];
  vision: string;
  mission: string;
};

export type StrategyRecord = {
  id: string;
  workspaceId: WorkspaceStrategyId;
  type: StrategyTypeId;
  title: string;
  approach: string;
  objectiveLink: string;
  status: 'active' | 'draft' | 'paused' | 'archived';
  ownerExecutive: string;
  successMetrics: string[];
  timeHorizon: string;
};

export type Initiative = {
  id: string;
  workspaceId: WorkspaceStrategyId;
  name: string;
  objective: string;
  owner: string;
  relatedStrategyId: string;
  relatedCampaigns: string[];
  relatedProjects: string[];
  successMetrics: string[];
  timeline: string;
  priority: InitiativePriority;
  status: InitiativeStatus;
  risks: string[];
  expectedImpact: string;
  actualImpact: string;
};

export type StrategicBet = {
  id: string;
  workspaceId: WorkspaceStrategyId;
  hypothesis: string;
  status: BetStatus;
  confidencePct: number;
  evidenceFor: string[];
  evidenceAgainst: string[];
  startedAt: string;
  lastReviewedAt: string;
};

export type StrategyHealthScore = {
  clarity: number;
  alignment: number;
  executionProgress: number;
  kpiMovement: number;
  riskLevel: number;
  resourceFit: number;
  timing: number;
  confidence: number;
  marketSignal: number;
  learningVelocity: number;
  overallPct: number;
  weakAreas: string[];
  recommendations: string[];
};

export type StrategyDecision = {
  id: string;
  workspaceId: WorkspaceStrategyId;
  decision: string;
  context: string;
  reasoning: string;
  expectedOutcome: string;
  actualOutcome: string;
  relatedStrategyId: string;
  relatedInitiativeId: string;
  relatedMetrics: string[];
  lessonsLearned: string[];
  decidedAt: string;
};

export type StrategyReview = {
  id: string;
  type: 'weekly-pulse' | 'monthly-review' | 'quarterly-reset' | 'annual-planning';
  title: string;
  schedule: string;
  agenda: string[];
  preparedBy: 'studio-intelligence';
  moderatedBy: 'chief-of-staff';
  founderAttendance: 'optional' | 'scheduled-only' | 'always';
  nextAt: string;
};

export type AlignmentCheck = {
  id: string;
  workItem: string;
  workType: string;
  aligned: boolean;
  strategyId: string;
  initiativeId: string;
  campaignId: string;
  reviewRequired: boolean;
  reason: string;
};

export type IntelligenceSignal = {
  id: string;
  workspaceId: WorkspaceStrategyId;
  signal: string;
  severity: 'info' | 'warning' | 'critical';
  recommendation: string;
  confidencePct: number;
};

export type CosPrioritizationPrompt = {
  question: string;
  guidance: string;
};

export type StrategySimulationPreview = {
  id: string;
  strategyId: string;
  label: string;
  bestCase: string;
  expectedCase: string;
  worstCase: string;
  budgetImpact: string;
  timeline: string;
  risks: string[];
  resourceRequirements: string[];
  successProbabilityPct: number;
};

export type StrategyInheritanceOption = {
  id: string;
  label: string;
  sourceWorkspaceId: WorkspaceStrategyId;
  description: string;
  includesInitiatives: boolean;
};

export type StrategyBoardSnapshot = {
  currentObjective: string;
  northStarMetric: string;
  northStarProgress: string;
  activeStrategies: string[];
  activeInitiatives: string[];
  keyRisks: string[];
  keyOpportunities: string[];
  strategicBets: string[];
  recommendedNextMoves: string[];
  recentDecisions: string[];
  strategyHealthPct: number;
};

export type StrategyEngineStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: WorkspaceStrategyId;
  dashboard: {
    summary: string;
    activeStrategies: number;
    activeInitiatives: number;
    strategicBets: number;
    alignmentRatePct: number;
    strategyHealthPct: number;
  };
  hierarchyLevels: { level: StrategyHierarchyLevel; label: string; description: string }[];
  profiles: StrategyProfile[];
  strategies: StrategyRecord[];
  initiatives: Initiative[];
  bets: StrategicBet[];
  health: StrategyHealthScore;
  decisions: StrategyDecision[];
  reviews: StrategyReview[];
  alignmentChecks: AlignmentCheck[];
  intelligenceSignals: IntelligenceSignal[];
  cosPrioritization: CosPrioritizationPrompt[];
  simulations: StrategySimulationPreview[];
  inheritanceOptions: StrategyInheritanceOption[];
  board: StrategyBoardSnapshot;
  builderStep: number;
  selectedStrategyId: string | null;
  selectedInitiativeId: string | null;
};
