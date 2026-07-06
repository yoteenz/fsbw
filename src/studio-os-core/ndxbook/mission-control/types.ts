import type { NdxbookPlatformId, NdxbookVolumeId } from '../types';

export type MissionControlNavId =
  | 'mission-control'
  | 'newsroom'
  | 'library'
  | 'publishing'
  | 'analytics'
  | 'experiments'
  | 'studio-intelligence'
  | 'creative-dna'
  | 'knowledge'
  | 'settings';

export type ProductionStageId =
  | 'idea'
  | 'research'
  | 'script'
  | 'review'
  | 'voice'
  | 'animation'
  | 'thumbnail'
  | 'caption'
  | 'scheduled'
  | 'published'
  | 'analytics';

export type TrendDirection = 'up' | 'down' | 'flat';

export type TodaysBriefing = {
  greeting: string;
  pagesPublishingToday: number;
  pagesInProduction: number;
  pendingApprovals: number;
  estimatedReachToday: number;
  estimatedRevenueToday: number;
  highestPerformingPage: string;
  highestPerformingVolume: string;
  highestPerformingHost: string;
  studioRecommendation: string;
  topOpportunity: string;
  topRisk: string;
  nextSuggestedAction: string;
};

export type CompanyHealthMetric = {
  id: string;
  label: string;
  score: number;
  trend: TrendDirection;
  trendLabel: string;
};

export type NewsroomStage = {
  id: ProductionStageId;
  label: string;
  pageCount: number;
  activeItems: number;
  estimatedCompletionMins: number;
  assignedExecutive: string;
};

export type PublishingScheduleItem = {
  id: string;
  scheduledAt: string;
  platform: NdxbookPlatformId;
  pageNumber: number;
  pageLabel: string;
  volumeId: NdxbookVolumeId;
  chapter: string;
  status: 'queued' | 'ready' | 'publishing' | 'published' | 'delayed';
  estimatedPublishAt: string;
};

export type PageOfTheDay = {
  pageNumber: number;
  pageLabel: string;
  title: string;
  volumeId: NdxbookVolumeId;
  chapter: string;
  hostName: string;
  thumbnailNote: string;
  platforms: NdxbookPlatformId[];
  status: string;
  predictedPerformance: string;
  launchAt: string;
};

export type LibraryPageCard = {
  id: string;
  pageNumber: number;
  pageLabel: string;
  volumeId: NdxbookVolumeId;
  chapter: string;
  title: string;
  status: string;
  performanceSnapshot: string;
  updatedAt: string;
  bookmarks?: number;
  shares?: number;
  retentionPct?: number;
};

export type LibrarySection = {
  latestPages: LibraryPageCard[];
  recentlyUpdated: LibraryPageCard[];
  mostBookmarked: LibraryPageCard[];
  highestShared: LibraryPageCard[];
  highestRetention: LibraryPageCard[];
  recentCollections: { id: string; title: string; pageCount: number; updatedAt: string }[];
};

export type VolumeMetrics = {
  volumeId: NdxbookVolumeId;
  label: string;
  pageCount: number;
  chapterCount: number;
  avgRetentionPct: number;
  shares: number;
  growthPct: number;
  trend: TrendDirection;
};

export type ChapterMetrics = {
  id: string;
  name: string;
  pageCount: number;
  performanceScore: number;
  engagementPct: number;
  recommendedNextPage: string;
  knowledgeGaps: string[];
};

export type ReaderIntelligence = {
  newReaders: number;
  returningReaders: number;
  retentionPct: number;
  bookmarks: number;
  shares: number;
  comments: number;
  watchTimeHours: number;
  avgCompletionPct: number;
  bestPublishingHour: string;
  topCountries: string[];
  topAgeGroups: string[];
  topInterests: string[];
};

export type IntelligenceRecommendation = {
  id: string;
  category: 'daily' | 'content' | 'trend' | 'market' | 'algorithm' | 'competitive' | 'risk';
  title: string;
  why: string;
  confidencePct: number;
  expectedImpact: string;
  recommendedAction: string;
};

export type RevenueBreakdown = {
  youtube: number;
  instagram: number;
  tiktok: number;
  facebook: number;
  affiliate: number;
  brandPartnerships: number;
  marketplace: number;
  digitalProducts: number;
  futureMemberships: number;
};

export type RevenueCenter = {
  today: number;
  yesterday: number;
  changeVsYesterdayPct: number;
  topChannel: keyof RevenueBreakdown;
  projectedEndOfDay: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  breakdown: RevenueBreakdown;
  forecastNextMonth: number;
  forecastConfidencePct: number;
};

export type LabsExperiment = {
  id: string;
  name: string;
  type: string;
  winner: string;
  confidencePct: number;
  currentLeader: string;
  historicalResults: string;
  recommendedRollout: string;
  status: 'active' | 'completed' | 'scheduled';
};

export type TalentBoardEntry = {
  id: string;
  displayName: string;
  role: string;
  volumeId: NdxbookVolumeId;
  status: 'available' | 'researching' | 'recording' | 'rendering' | 'editing' | 'scheduled';
  currentPage?: string;
  nextSlot?: string;
};

export type MissionAction = {
  id: string;
  label: string;
  route: string;
  priority: number;
  frequencyScore: number;
};

export type ActivityEvent = {
  id: string;
  timestamp: string;
  message: string;
  category: 'production' | 'experiment' | 'intelligence' | 'social' | 'publish' | 'revenue' | 'talent';
};

export type NdxbookMissionControlStore = {
  version: string;
  lastUpdatedAt: string;
  briefing: TodaysBriefing;
  companyHealth: CompanyHealthMetric[];
  newsroomStages: NewsroomStage[];
  publishingSchedule: PublishingScheduleItem[];
  pageOfTheDay: PageOfTheDay;
  library: LibrarySection;
  volumes: VolumeMetrics[];
  chaptersByVolume: Partial<Record<NdxbookVolumeId, ChapterMetrics[]>>;
  readerIntelligence: ReaderIntelligence;
  intelligence: IntelligenceRecommendation[];
  revenue: RevenueCenter;
  experiments: LabsExperiment[];
  talentBoard: TalentBoardEntry[];
  missionActions: MissionAction[];
  activityFeed: ActivityEvent[];
};
