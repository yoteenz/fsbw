/** Campaign Engine V1.0 — transforms strategy into coordinated execution (Milestone 44). */

export type CampaignWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type CampaignTypeId =
  | 'product-launch'
  | 'content-series'
  | 'brand-awareness'
  | 'social-media'
  | 'email-marketing'
  | 'partnerships'
  | 'affiliate'
  | 'creator-collaboration'
  | 'events'
  | 'community'
  | 'promotions'
  | 'seasonal'
  | 'internal'
  | 'research'
  | 'marketplace';

export type CampaignStatus = 'draft' | 'planning' | 'active' | 'paused' | 'complete' | 'archived';
export type CampaignPriority = 'critical' | 'high' | 'medium' | 'low';
export type DeliverableType =
  | 'page'
  | 'video'
  | 'article'
  | 'email'
  | 'landing-page'
  | 'product'
  | 'graphic'
  | 'advertisement'
  | 'creator-collaboration'
  | 'newsletter'
  | 'podcast'
  | 'course'
  | 'ebook'
  | 'event';

export type CampaignHierarchyLevel =
  | 'vision'
  | 'mission'
  | 'strategy'
  | 'initiative'
  | 'campaign'
  | 'deliverables'
  | 'distribution'
  | 'analytics'
  | 'institutional-learning';

export type CampaignDeliverable = {
  id: string;
  campaignId: string;
  type: DeliverableType;
  title: string;
  status: 'planned' | 'in-production' | 'review' | 'ready' | 'published';
  owner: string;
  newsroomPageId?: string;
  dueAt: string;
};

export type DepartmentCoordination = {
  department: string;
  responsibilities: string[];
  deadlines: string[];
  dependencies: string[];
  approvals: string[];
};

export type CreatorRecommendation = {
  id: string;
  campaignId: string;
  creatorName: string;
  fitScore: number;
  audienceMatch: string;
  historicalPerformance: string;
  budgetFit: string;
  brandFit: string;
  reputation: string;
};

export type CampaignExperiment = {
  id: string;
  campaignId: string;
  type: 'creative' | 'copy' | 'thumbnail' | 'audience' | 'platform' | 'creator' | 'schedule' | 'pricing';
  label: string;
  status: 'running' | 'complete' | 'planned';
  labsExperimentId?: string;
  winner?: string;
};

export type CampaignAnalytics = {
  reach: string;
  engagement: string;
  watchTime: string;
  clicks: string;
  sales: string;
  conversion: string;
  revenue: string;
  roi: string;
  retention: string;
  customerAcquisition: string;
  readerGrowth: string;
  brandGrowth: string;
  knowledgeContribution: string;
};

export type CampaignHealthScore = {
  clarity: number;
  execution: number;
  delivery: number;
  budget: number;
  engagement: number;
  velocity: number;
  crossFunctionalAlignment: number;
  brandConsistency: number;
  overallPct: number;
  recommendations: string[];
};

export type CampaignSimulation = {
  expectedReach: string;
  expectedEngagement: string;
  budgetImpact: string;
  conversionEstimate: string;
  resourceRequirements: string[];
  timeline: string;
  risks: string[];
  confidencePct: number;
  improvements: string[];
};

export type CampaignIntelligence = {
  momentum: 'accelerating' | 'steady' | 'slowing' | 'fatigued';
  fatigueRisk: string;
  budgetUtilizationPct: number;
  contentVelocity: string;
  recommendations: string[];
};

export type CampaignRetrospective = {
  id: string;
  campaignId: string;
  lessonsLearned: string[];
  successfulPatterns: string[];
  failedAssumptions: string[];
  futureRecommendations: string[];
  playbookUpdates: string[];
  completedAt: string;
};

export type CampaignInheritanceOption = {
  id: string;
  label: string;
  sourceWorkspaceId: CampaignWorkspaceId;
  description: string;
  includesWorkflows: boolean;
};

export type CampaignCalendarEntry = {
  id: string;
  campaignId: string;
  title: string;
  startAt: string;
  endAt: string;
  view: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  overlapTags: string[];
};

export type CampaignRecord = {
  id: string;
  workspaceId: CampaignWorkspaceId;
  type: CampaignTypeId;
  name: string;
  objective: string;
  relatedStrategyId: string;
  relatedStrategyLabel: string;
  relatedInitiativeId: string;
  relatedInitiativeLabel: string;
  owner: string;
  executiveSponsor: string;
  timeline: string;
  status: CampaignStatus;
  priority: CampaignPriority;
  budget: string;
  budgetSpent: string;
  expectedOutcome: string;
  actualOutcome: string;
  confidencePct: number;
  targetAudience: string;
  successMetrics: string[];
  channels: string[];
  healthPct: number;
};

export type CampaignEngineStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: CampaignWorkspaceId;
  dashboard: {
    summary: string;
    activeCampaigns: number;
    deliverablesInProduction: number;
    avgHealthPct: number;
    totalBudgetAllocated: string;
    experimentsRunning: number;
  };
  hierarchyLevels: { level: CampaignHierarchyLevel; label: string; description: string }[];
  campaigns: CampaignRecord[];
  deliverables: CampaignDeliverable[];
  departmentCoordination: DepartmentCoordination[];
  creatorRecommendations: CreatorRecommendation[];
  experiments: CampaignExperiment[];
  analytics: Record<string, CampaignAnalytics>;
  healthScores: Record<string, CampaignHealthScore>;
  intelligence: Record<string, CampaignIntelligence>;
  simulations: Record<string, CampaignSimulation>;
  retrospectives: CampaignRetrospective[];
  calendar: CampaignCalendarEntry[];
  inheritanceOptions: CampaignInheritanceOption[];
  playbooks: { id: string; title: string; sourceCampaignId: string; description: string }[];
  builderStep: number;
  selectedCampaignId: string | null;
};
