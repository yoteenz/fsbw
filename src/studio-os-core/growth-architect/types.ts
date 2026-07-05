/** Growth Architect V1.0 — sustainable growth operating system (Milestone 56). */

export type GrowthArchitectWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type GrowthLifecycleStageId =
  | 'idea'
  | 'validation'
  | 'launch'
  | 'traction'
  | 'optimization'
  | 'scale'
  | 'expansion'
  | 'leadership'
  | 'legacy';

export type GrowthLifecycleStage = {
  id: GrowthLifecycleStageId;
  label: string;
  description: string;
  current: boolean;
};

export type GrowthBlueprintPillar = {
  id: string;
  pillar: string;
  strategy: string;
  status: 'planned' | 'active' | 'mature';
};

export type GrowthInitiative = {
  id: string;
  title: string;
  type: string;
  strategyLink: string;
  status: 'planned' | 'active' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export type GoToMarketPlan = {
  id: string;
  initiative: string;
  positioning: string;
  targetAudience: string;
  channelStrategy: string;
  messaging: string;
  launchSequence: string[];
  successMetrics: string[];
  riskLevel: 'low' | 'medium' | 'high';
};

export type GrowthIntelligenceAlert = {
  id: string;
  category: string;
  signal: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export type GrowthSimulation = {
  id: string;
  label: string;
  marketResponsePct: number;
  adoptionPct: number;
  conversionPct: number;
  revenueImpact: string;
  resourceReq: string;
  operationalStrainPct: number;
  confidencePct: number;
  recommendations: string[];
};

export type GrowthOrchestrationLink = {
  id: string;
  system: string;
  role: string;
  status: 'connected' | 'planned';
};

export type GrowthExperiment = {
  id: string;
  type: string;
  hypothesis: string;
  status: 'running' | 'completed' | 'planned';
  learningRecorded: boolean;
};

export type MarketIntelligenceItem = {
  id: string;
  category: string;
  signal: string;
  implication: string;
  urgency: 'watch' | 'act' | 'critical';
};

export type ExpansionOpportunity = {
  id: string;
  type: string;
  opportunity: string;
  sustainability: string;
  confidencePct: number;
};

export type GrowthArchitectDashboard = {
  summary: string;
  growthHealthPct: number;
  acquisitionPct: number;
  retentionPct: number;
  revenueGrowthPct: number;
  relationshipGrowthPct: number;
  knowledgeGrowthPct: number;
  lifecycleStage: GrowthLifecycleStageId;
};

export type GrowthArchitectStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: GrowthArchitectWorkspaceId;
  companyName: string;
  dashboard: GrowthArchitectDashboard;
  growthPhilosophy: string[];
  blueprintPillars: GrowthBlueprintPillar[];
  lifecycleStages: GrowthLifecycleStage[];
  initiatives: GrowthInitiative[];
  gtmPlans: GoToMarketPlan[];
  intelligenceAlerts: GrowthIntelligenceAlert[];
  simulations: GrowthSimulation[];
  orchestration: GrowthOrchestrationLink[];
  experiments: GrowthExperiment[];
  marketIntelligence: MarketIntelligenceItem[];
  expansionOpportunities: ExpansionOpportunity[];
  launchCalendar: { id: string; date: string; label: string; type: string }[];
  futureOpportunities: string[];
};
