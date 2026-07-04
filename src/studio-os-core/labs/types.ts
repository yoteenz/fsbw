/**
 * Studio OS Labs v1.0 — Experiment Engine types.
 * Research & experimentation division — every published asset becomes an experiment.
 */

export type ExperimentStatus = 'active' | 'collecting' | 'completed' | 'promoted' | 'archived';

export type PublishingPlatform =
  | 'tiktok'
  | 'instagram-reels'
  | 'youtube-shorts'
  | 'youtube-long'
  | 'facebook'
  | 'linkedin'
  | 'twitter'
  | 'pinterest'
  | 'snapchat'
  | 'other';

export type ContentPillar =
  | 'money'
  | 'health'
  | 'psychology'
  | 'ai'
  | 'consumer-protection'
  | 'home'
  | 'technology'
  | 'other';

export type ExperimentVariables = {
  topic: string;
  pillar: ContentPillar;
  series: string;
  campaign: string;
  workspace: string;
  publishingPlatform: PublishingPlatform;
  publishDate: string;
  publishTime: string;
  hook: string;
  openingLine: string;
  script: string;
  storyboard: string;
  voice: string;
  thumbnail: string;
  caption: string;
  hashtags: string[];
  cta: string;
  music: string;
  videoDurationSec: number;
  animationStyle: string;
  editingStyle: string;
  aiModelsUsed: string[];
  promptVersions: string[];
  creativeDnaVersion: string;
  writingBibleVersion: string;
  companyDnaVersion: string;
};

export type PerformanceMetrics = {
  views: number;
  watchTimeSec: number;
  averageViewDurationSec: number;
  completionRate: number;
  rewatches: number;
  likes: number;
  shares: number;
  comments: number;
  saves: number;
  follows: number;
  profileVisits: number;
  websiteClicks: number;
  emailSignups: number;
  affiliateClicks: number;
  sales: number;
  revenue: number;
  platformRpm: number;
  platformCpm: number;
  platformCpc: number;
  engagementRate: number;
  conversionRate: number;
  returnViewers: number;
  retentionCurve: number[];
  audienceDemographics: string;
  trafficSources: string;
  collectedAt: string;
};

export type ThumbnailIntel = {
  composition: string;
  colors: string[];
  textPlacement: string;
  subjectPlacement: string;
  cameraFraming: string;
  emotion: string;
  contrast: string;
  ctr: number;
};

export type Experiment = {
  id: string;
  workspaceId: string;
  status: ExperimentStatus;
  variables: ExperimentVariables;
  metrics: PerformanceMetrics;
  thumbnailIntel?: ThumbnailIntel;
  knowledgeGraphNodeId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type LearningInsight = {
  id: string;
  workspaceId: string;
  experimentIds: string[];
  category: 'hook' | 'thumbnail' | 'caption' | 'series' | 'pillar' | 'platform' | 'timing' | 'length' | 'voice' | 'revenue' | 'retention' | 'general';
  insight: string;
  confidence: number;
  deltaPercent?: number;
  generatedAt: string;
  promotedToMemory: boolean;
};

export type HookRecord = {
  id: string;
  workspaceId: string;
  template: string;
  timesUsed: number;
  averageRetention: number;
  averageWatchTimeSec: number;
  averageRevenue: number;
  bestNiche: ContentPillar;
  bestPlatform: PublishingPlatform;
  successScore: number;
  experimentIds: string[];
};

export type CaptionIntelRecord = {
  id: string;
  workspaceId: string;
  captionLength: number;
  emojiUsage: boolean;
  questionUsage: boolean;
  ctaPlacement: string;
  hashtags: string[];
  lineSpacing: string;
  engagementRate: number;
  experimentIds: string[];
};

export type SeriesIntelRecord = {
  id: string;
  workspaceId: string;
  seriesName: string;
  growthTrend: number;
  audienceLoyalty: number;
  revenue: number;
  bestPostingSchedule: string;
  recommendedFrequency: string;
  experimentCount: number;
};

export type PillarIntelRecord = {
  id: string;
  workspaceId: string;
  pillar: ContentPillar;
  totalRevenue: number;
  growth: number;
  engagement: number;
  lifetimeValue: number;
  productionCost: number;
  roi: number;
  experimentCount: number;
};

export type BenchmarkRecord = {
  id: string;
  workspaceId: string;
  category: 'retention' | 'ctr' | 'revenue' | 'affiliate-conversion' | 'engagement' | 'watch-time' | 'rpm';
  label: string;
  value: number;
  unit: string;
  experimentId: string;
  setAt: string;
};

export type PromotionTarget =
  | 'creative-dna'
  | 'writing-bible'
  | 'company-dna'
  | 'content-templates'
  | 'thumbnail-templates'
  | 'hook-library'
  | 'automation-rules'
  | 'future-campaigns';

export type PromotionRecord = {
  id: string;
  workspaceId: string;
  experimentId: string;
  learningId: string;
  target: PromotionTarget;
  status: 'pending' | 'approved' | 'promoted';
  promotedAt?: string;
  note: string;
};

export type LabsRecommendation = {
  id: string;
  workspaceId: string;
  category: 'topic' | 'hook' | 'posting-time' | 'platform' | 'thumbnail' | 'voice' | 'length' | 'cta' | 'frequency';
  recommendation: string;
  basedOnExperimentIds: string[];
  confidence: number;
  generatedAt: string;
};

export type ExperimentComparison = {
  experimentAId: string;
  experimentBId: string;
  differences: Array<{
    field: string;
    valueA: string | number;
    valueB: string | number;
    statisticallyMeaningful: boolean;
    metricDelta?: number;
  }>;
};

export type LabsStore = {
  experiments: Experiment[];
  learnings: LearningInsight[];
  hooks: HookRecord[];
  captions: CaptionIntelRecord[];
  series: SeriesIntelRecord[];
  pillars: PillarIntelRecord[];
  benchmarks: BenchmarkRecord[];
  promotions: PromotionRecord[];
  recommendations: LabsRecommendation[];
  institutionalMemory: string[];
  version: string;
};

export type PublishAssetInput = Partial<ExperimentVariables> & {
  workspaceId: string;
  topic: string;
  pillar: ContentPillar;
  hook: string;
};
