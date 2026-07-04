/**
 * AI Media Network v1.0 — digital media network types.
 * Television network + AI-powered publishing company operating model.
 */

export type NetworkPillarId =
  | 'money'
  | 'health'
  | 'psychology'
  | 'ai-technology'
  | 'consumer-intelligence';

export type NetworkShowId =
  | 'money-monday'
  | 'truth-tuesday'
  | 'workflow-wednesday'
  | 'smart-living-thursday'
  | 'future-friday';

export type CrossPlatformId =
  | 'instagram'
  | 'tiktok'
  | 'youtube-shorts'
  | 'facebook'
  | 'threads'
  | 'x'
  | 'pinterest';

export type MonetizationChannel =
  | 'affiliate'
  | 'sponsorship'
  | 'digital-products'
  | 'licensing'
  | 'platform-payouts'
  | 'future-offerings';

export type EpisodeStatus = 'planned' | 'in-production' | 'scheduled' | 'published' | 'archived';

export type CompanyDna = {
  workspaceId: string;
  mission: string;
  brandValues: string[];
  pilotRole: string;
  updatedAt: string;
};

export type ContentPillar = {
  id: NetworkPillarId;
  label: string;
  strategy: string;
  topics: string[];
  knowledgeGraphNodeId: string;
};

export type NetworkShow = {
  id: NetworkShowId;
  name: string;
  weekday: string;
  primaryPillar: NetworkPillarId;
  description: string;
  branding: string;
  thumbnailStyle: string;
  intro: string;
  outro: string;
  host: string;
  creativeDnaRef: string;
  knowledgeGraphNodeId: string;
};

export type ShowAnalytics = {
  episodes: number;
  season: number;
  publishingCadence: string;
  bestPerformingTopics: string[];
  averageWatchTimeSec: number;
  audienceGrowth: number;
  revenue: number;
  affiliatePerformance: number;
  recommendations: string[];
};

export type NetworkEpisode = {
  id: string;
  workspaceId: string;
  showId: NetworkShowId;
  pillarId: NetworkPillarId;
  title: string;
  topic: string;
  season: number;
  episodeNumber: number;
  status: EpisodeStatus;
  scheduledAt: string;
  publishedAt?: string;
  hook: string;
  platforms: CrossPlatformId[];
  experimentId?: string;
  metrics: {
    views: number;
    averageWatchTimeSec: number;
    revenue: number;
    affiliateClicks: number;
  };
};

export type CalendarSlot = {
  id: string;
  workspaceId: string;
  date: string;
  time: string;
  showId: NetworkShowId;
  episodeId?: string;
  label: string;
  type: 'daily' | 'weekly' | 'special' | 'campaign';
};

export type SeasonPlan = {
  id: string;
  workspaceId: string;
  showId: NetworkShowId;
  seasonNumber: number;
  episodeCount: number;
  theme: string;
  startDate: string;
  endDate: string;
};

export type CrossPlatformPackage = {
  episodeId: string;
  platform: CrossPlatformId;
  ready: boolean;
  aspectRatio: string;
  captionVariant: string;
  hashtagSet: string[];
};

export type MonetizationRecord = {
  id: string;
  workspaceId: string;
  channel: MonetizationChannel;
  seriesId?: NetworkShowId;
  pillarId?: NetworkPillarId;
  platform?: CrossPlatformId;
  label: string;
  amount: number;
  period: string;
};

export type AiMediaNetworkStore = {
  companyDna: CompanyDna | null;
  pillars: ContentPillar[];
  shows: NetworkShow[];
  showAnalytics: Record<NetworkShowId, ShowAnalytics>;
  episodes: NetworkEpisode[];
  calendar: CalendarSlot[];
  seasonPlans: SeasonPlan[];
  crossPlatform: CrossPlatformPackage[];
  monetization: MonetizationRecord[];
  version: string;
};

export type PublishEpisodeInput = {
  episodeId: string;
  workspaceId?: string;
};
