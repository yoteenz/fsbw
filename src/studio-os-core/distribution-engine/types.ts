/** Distribution Engine V1.0 — global distribution system for knowledge assets (Milestone 46). */

export type DistributionWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type DistributionHierarchyLevel =
  | 'knowledge-asset'
  | 'campaign'
  | 'distribution-strategy'
  | 'channel-selection'
  | 'platform-adaptation'
  | 'publishing'
  | 'audience-engagement'
  | 'performance'
  | 'institutional-learning';

export type DistributionFormatId =
  | 'instagram-reel'
  | 'tiktok'
  | 'youtube-shorts'
  | 'youtube-long'
  | 'facebook'
  | 'threads'
  | 'x-thread'
  | 'linkedin-post'
  | 'linkedin-carousel'
  | 'pinterest-pin'
  | 'newsletter'
  | 'blog-article'
  | 'podcast-outline'
  | 'podcast-episode'
  | 'ebook-chapter'
  | 'course-lesson'
  | 'community-discussion'
  | 'press-release'
  | 'speaker-notes'
  | 'webinar';

export type DistributionChannelId =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'facebook'
  | 'threads'
  | 'x'
  | 'linkedin'
  | 'pinterest'
  | 'newsletter'
  | 'blog'
  | 'podcast'
  | 'ebook'
  | 'course'
  | 'community'
  | 'press'
  | 'webinar';

export type CalendarEntryStatus =
  | 'scheduled'
  | 'publishing'
  | 'processing'
  | 'completed'
  | 'evergreen'
  | 'republishing'
  | 'future-update';

export type KnowledgeAssetStatus = 'draft' | 'approved' | 'distributing' | 'published' | 'evergreen' | 'archived';

export type KnowledgeAsset = {
  id: string;
  workspaceId: DistributionWorkspaceId;
  title: string;
  sourceType: 'page' | 'video' | 'article' | 'course' | 'podcast' | 'ebook';
  sourceId?: string;
  campaignId?: string;
  campaignLabel?: string;
  status: KnowledgeAssetStatus;
  knowledgeValueScore: number;
  maturityPct: number;
  potentialFormats: DistributionFormatId[];
  approvedFormats: DistributionFormatId[];
  unifiedSourceOfTruth: string;
  createdAt: string;
};

export type DistributionStrategy = {
  id: string;
  assetId: string;
  campaignId: string;
  label: string;
  objective: string;
  founderApproved: boolean;
  status: 'proposed' | 'approved' | 'active' | 'complete';
  targetAudiences: string[];
  primaryChannels: DistributionChannelId[];
  confidencePct: number;
  rationale: string;
};

export type PlatformAdaptation = {
  id: string;
  assetId: string;
  formatId: DistributionFormatId;
  channelId: DistributionChannelId;
  status: 'proposed' | 'generating' | 'ready' | 'published';
  hook?: string;
  caption?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  thumbnail?: string;
  timing?: string;
  tone?: string;
  seo?: string;
  cta?: string;
  preservesKnowledge: boolean;
};

export type DistributionIntelligenceRec = {
  id: string;
  assetId: string;
  where: string;
  when: string;
  how: string;
  why: string;
  confidencePct: number;
  factors: {
    platformFit: number;
    audienceFit: number;
    historicalPerformance: number;
    campaignObjective: number;
    trends: number;
    seasonality: number;
    competition: number;
    timing: number;
    contentMaturity: number;
    knowledgeValue: number;
  };
};

export type DistributionCalendarEntry = {
  id: string;
  assetId: string;
  formatId: DistributionFormatId;
  channelId: DistributionChannelId;
  label: string;
  scheduledAt: string;
  status: CalendarEntryStatus;
  timezone: string;
  campaignId?: string;
};

export type EvergreenRecommendation = {
  id: string;
  assetId: string;
  title: string;
  action: 'republish' | 'refresh' | 'update' | 'remix' | 'expand' | 'bundle' | 'archive';
  reason: string;
  confidencePct: number;
  lastPublishedAt: string;
  projectedLift: string;
};

export type KnowledgeCollection = {
  id: string;
  workspaceId: DistributionWorkspaceId;
  type: 'series' | 'collection' | 'playlist' | 'learning-path' | 'ebook' | 'course' | 'resource-library';
  title: string;
  assetIds: string[];
  assetCount: number;
  bundlingOpportunity: string;
  status: 'proposed' | 'active' | 'complete';
};

export type AudienceSegment = {
  id: string;
  label: string;
  description: string;
  distributionStrategy: string;
  personalizationLevel: 'standard' | 'tailored' | 'custom';
};

export type CreatorCollaborationRec = {
  id: string;
  assetId: string;
  type: 'partnership' | 'guest' | 'affiliate' | 'ugc' | 'sponsorship' | 'expert';
  creatorName: string;
  fitScore: number;
  reachEstimate: string;
  rationale: string;
};

export type DistributionSimulation = {
  id: string;
  assetId: string;
  strategyLabel: string;
  reach: string;
  engagement: string;
  watchTime: string;
  clickThrough: string;
  conversion: string;
  readerGrowth: string;
  revenue: string;
  resourceUtilization: string;
  platformSaturation: string;
  confidencePct: number;
};

export type DistributionPerformance = {
  assetId: string;
  reach: string;
  views: string;
  watchTime: string;
  retention: string;
  completion: string;
  shares: string;
  bookmarks: string;
  comments: string;
  clicks: string;
  conversions: string;
  revenue: string;
  readerGrowth: string;
  brandGrowth: string;
  knowledgeContribution: string;
  topPatterns: string[];
};

export type DistributionFeedbackInsight = {
  id: string;
  assetId: string;
  worked: string[];
  failed: string[];
  unexpected: string[];
  platformDifferences: string[];
  audienceBehavior: string[];
  improvements: string[];
  updatesFutureRecs: boolean;
};

export type DistributionLineageNode = {
  id: string;
  assetId: string;
  type: 'source' | 'derived' | 'published' | 'experiment' | 'revision' | 'evergreen-update';
  label: string;
  formatId?: DistributionFormatId;
  channelId?: DistributionChannelId;
  at: string;
  performanceNote?: string;
};

export type CrossCompanyDistribution = {
  id: string;
  assetId: string;
  topic: string;
  sourceCompany: string;
  targetCompanies: string[];
  safe: boolean;
  identityProtection: string;
  recommendation: string;
};

export type DistributionHealth = {
  executionVelocity: number;
  channelEfficiency: number;
  formatCoverage: number;
  evergreenUtilization: number;
  knowledgeLongevity: number;
  overallPct: number;
  bottlenecks: string[];
  recommendations: string[];
};

export type DistributionEngineStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: DistributionWorkspaceId;
  dashboard: {
    summary: string;
    knowledgeAssets: number;
    formatsGenerated: number;
    scheduledThisWeek: number;
    evergreenActive: number;
    avgHealthPct: number;
    knowledgeReach: string;
  };
  hierarchyLevels: { level: DistributionHierarchyLevel; label: string; description: string }[];
  knowledgeAssets: KnowledgeAsset[];
  strategies: DistributionStrategy[];
  adaptations: PlatformAdaptation[];
  intelligenceRecs: DistributionIntelligenceRec[];
  calendar: DistributionCalendarEntry[];
  evergreen: EvergreenRecommendation[];
  collections: KnowledgeCollection[];
  audienceSegments: AudienceSegment[];
  creatorRecs: CreatorCollaborationRec[];
  simulations: DistributionSimulation[];
  performance: Record<string, DistributionPerformance>;
  feedback: DistributionFeedbackInsight[];
  lineage: DistributionLineageNode[];
  crossCompany: CrossCompanyDistribution[];
  health: DistributionHealth;
  selectedAssetId: string | null;
};
