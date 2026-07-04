/**
 * Simulation Engine v1.0 — model business decisions before committing real resources.
 * Never present outcomes as guaranteed predictions — explore possibilities and tradeoffs.
 */

export type SimulationType =
  | 'new-business-launch'
  | 'product-launch'
  | 'pricing-change'
  | 'subscription-change'
  | 'marketing-campaign'
  | 'brand-partnership'
  | 'content-strategy'
  | 'marketplace-participation'
  | 'new-hire'
  | 'layoff'
  | 'team-expansion'
  | 'new-workspace'
  | 'budget-allocation'
  | 'advertising-spend'
  | 'affiliate-program'
  | 'inventory-planning'
  | 'automation-investment'
  | 'software-cost'
  | 'international-expansion'
  | 'new-revenue-stream'
  | 'acquisition'
  | 'merger'
  | 'licensing'
  | 'custom';

export type SimulationDepth = 'quick' | 'standard' | 'deep' | 'strategic';

export type SimulationStatus = 'draft' | 'running' | 'completed' | 'archived';

export type TimelineHorizon = '30-day' | '90-day' | '6-month' | '1-year' | '3-year' | '5-year';

export type SimulationAssumptions = {
  budget?: string;
  timeline?: string;
  teamSize?: number;
  industry?: string;
  pricing?: string;
  marketingSpend?: string;
  traffic?: string;
  conversion?: string;
  riskTolerance?: 'low' | 'medium' | 'high';
  custom?: Record<string, string>;
};

export type SimulationRecord = {
  id: string;
  workspaceId: string;
  title: string;
  type: SimulationType;
  status: SimulationStatus;
  depth: SimulationDepth;
  assumptions: SimulationAssumptions;
  confidence: number;
  createdAt: string;
  completedAt?: string;
  knowledgeGraphNodeId: string;
  recommendedByIntelligence: boolean;
};

export type ScenarioVariant = {
  id: string;
  simulationId: string;
  label: string;
  parameters: Record<string, string>;
  projectedRevenue: string;
  projectedConversion: string;
  projectedRetention: string;
  projectedProfit: string;
  projectedGrowth: string;
  customerAcquisition: string;
  confidence: number;
  recommended: boolean;
};

export type RiskAnalysis = {
  simulationId: string;
  bestCase: string;
  expectedCase: string;
  worstCase: string;
  confidenceScore: number;
  majorAssumptions: string[];
  keyRisks: string[];
  mitigationStrategies: string[];
};

export type FinancialSimulation = {
  simulationId: string;
  cashFlow: string;
  expenses: string;
  profit: string;
  runway: string;
  burnRate: string;
  revenueGrowth: string;
  subscriptionGrowth: string;
  marketplaceRevenue: string;
  royalties: string;
  walletBalance: string;
  teamCosts: string;
};

export type MarketingSimulation = {
  simulationId: string;
  campaignPerformance: string;
  reach: string;
  engagement: string;
  conversions: string;
  affiliateRevenue: string;
  emailGrowth: string;
  audienceGrowth: string;
  cac: string;
  roas: string;
};

export type ContentSimulation = {
  simulationId: string;
  publishingFrequency: string;
  contentPillars: string[];
  thumbnailImpact: string;
  hookVariation: string;
  voiceChange: string;
  platformSelection: string;
  seriesExpansion: string;
  historicalBasis: string[];
};

export type OrganizationSimulation = {
  simulationId: string;
  hiringPlan: string;
  restructuring: string;
  outsourcing: string;
  newAiExecutives: string[];
  newDepartments: string[];
  estimatedCost: string;
  efficiencyGain: string;
  deliverySpeed: string;
  operationalComplexity: string;
};

export type MarketplaceSimulation = {
  simulationId: string;
  brandDeals: string;
  creatorPartnerships: string;
  pricingNegotiations: string;
  affiliatePartnerships: string;
  serviceProviders: string;
  revenueImpact: string;
};

export type TimelineProjection = {
  simulationId: string;
  horizon: TimelineHorizon;
  milestones: string[];
  revenueProjection: string;
  growthProjection: string;
  confidence: number;
};

export type DecisionSupportReport = {
  simulationId: string;
  executiveSummary: string;
  confidenceScore: number;
  supportingEvidence: string[];
  majorAssumptions: string[];
  keyOpportunities: string[];
  majorRisks: string[];
  recommendedActions: string[];
  alternativeScenarios: string[];
};

export type ExecutiveAiContribution = {
  simulationId: string;
  executiveRole: 'cfo' | 'cmo' | 'coo' | 'cgo' | 'cco';
  executiveName: string;
  contribution: string;
  confidence: number;
};

export type SimulationLibraryEntry = {
  id: string;
  workspaceId: string;
  title: string;
  type: SimulationType;
  version: string;
  forkedFrom?: string;
  shared: boolean;
  archived: boolean;
  templateReady: boolean;
  createdAt: string;
};

export type LearningLoopRecord = {
  id: string;
  simulationId: string;
  workspaceId: string;
  predictedOutcome: string;
  actualOutcome: string;
  accuracyPct: number;
  incorrectAssumptions: string[];
  unexpectedVariables: string[];
  confidenceImprovement: number;
  recordedAt: string;
};

export type IntelligenceSimulationRecommendation = {
  id: string;
  workspaceId: string;
  trigger: string;
  suggestedSimulationType: SimulationType;
  reason: string;
  confidence: number;
};

export type SimulationDashboardSnapshot = {
  activeSimulations: number;
  completedSimulations: number;
  savedScenarios: number;
  highestConfidenceModel: number;
  historicalComparisons: number;
  recommendedSimulations: number;
};

export type SimulationEngineStore = {
  simulations: SimulationRecord[];
  scenarios: ScenarioVariant[];
  riskAnalyses: RiskAnalysis[];
  financialSims: FinancialSimulation[];
  marketingSims: MarketingSimulation[];
  contentSims: ContentSimulation[];
  organizationSims: OrganizationSimulation[];
  marketplaceSims: MarketplaceSimulation[];
  timelineProjections: TimelineProjection[];
  decisionReports: DecisionSupportReport[];
  executiveContributions: ExecutiveAiContribution[];
  library: SimulationLibraryEntry[];
  learningLoops: LearningLoopRecord[];
  intelligenceRecommendations: IntelligenceSimulationRecommendation[];
  dashboard: SimulationDashboardSnapshot;
  version: number;
};
