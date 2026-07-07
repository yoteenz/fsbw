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
  | 'event'
  | 'script'
  | 'caption'
  | 'thumbnail'
  | 'notes';

/** State Engine™ — content production workflow */
export type DeliverableWorkflowStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'learning';

export type DeliverableApprovalStatus =
  | 'none'
  | 'pending'
  | 'approved'
  | 'revision-requested'
  | 'rejected';

export type DeliverablePublishingStatus = 'unpublished' | 'scheduled' | 'published';

export type DeliverablePlatform =
  | 'ndxbook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'newsletter'
  | 'pinterest'
  | 'web'
  | 'internal';

export type DeliverableFormat =
  | 'page'
  | 'post'
  | 'carousel'
  | 'reel'
  | 'short'
  | 'script'
  | 'email'
  | 'graphic'
  | 'section'
  | 'notes'
  | 'article'
  | 'caption';

export type CampaignWorkspaceTab = 'overview' | 'deliverables' | 'calendar' | 'research' | 'analytics';

export type DeliverableApprovalEvent = {
  at: string;
  actor: string;
  action: string;
};

export type DeliverableComment = {
  id: string;
  author: string;
  text: string;
  at: string;
};

export type DeliverableVersion = {
  version: number;
  at: string;
  summary: string;
};

export type DeliverableLearningMetrics = {
  engagement?: string;
  reach?: string;
  saves?: string;
  clicks?: string;
  comments?: string;
  completion?: string;
  platformPerformance?: string;
  topicPerformance?: string;
  formatPerformance?: string;
};

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
  format?: DeliverableFormat;
  title: string;
  /** @deprecated legacy seed — use workflowStatus */
  status?: 'planned' | 'in-production' | 'review' | 'ready' | 'published';
  workflowStatus: DeliverableWorkflowStatus;
  approvalStatus: DeliverableApprovalStatus;
  publishingStatus: DeliverablePublishingStatus;
  owner: string;
  platform: DeliverablePlatform;
  newsroomPageId?: string;
  dueAt: string;
  updatedAt: string;
  scheduledAt?: string;
  publishedAt?: string;
  bodyPreview?: string;
  caption?: string;
  thumbnailPreview?: string;
  researchSources?: string[];
  aiSuggestions?: string[];
  factCheckStatus?: 'pending' | 'passed' | 'flagged';
  approvalTimeline?: DeliverableApprovalEvent[];
  comments?: DeliverableComment[];
  versionHistory?: DeliverableVersion[];
  knowledgeAssetId?: string;
  learningMetrics?: DeliverableLearningMetrics;
  studioIntelligenceNotes?: string[];
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
  workspaceTab: CampaignWorkspaceTab;
  selectedDeliverableId: string | null;
  autoPublishEnabled: boolean;
};
