/** Reader Graph V1.0 — living relationship map between companies and people (Milestone 47). */

export type ReaderGraphWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type RelationshipStageId =
  | 'discover'
  | 'engage'
  | 'return'
  | 'bookmark'
  | 'share'
  | 'subscribe'
  | 'member'
  | 'customer'
  | 'advocate'
  | 'ambassador'
  | 'partner'
  | 'mentor';

export type GraphZoomLevel = 'individual' | 'community' | 'company' | 'portfolio';

export type KnowledgeInterestId =
  | 'entrepreneurship'
  | 'finance'
  | 'luxury'
  | 'hair'
  | 'beauty'
  | 'psychology'
  | 'health'
  | 'technology'
  | 'ai'
  | 'marketing'
  | 'design'
  | 'relationships'
  | 'wellness';

export type ReaderIntelligenceCategory =
  | 'high-potential'
  | 'future-advocate'
  | 'future-customer'
  | 'future-creator'
  | 'future-partner'
  | 'future-ambassador'
  | 'at-risk'
  | 'inactive'
  | 'reemerging';

export type RelationshipRecommendationType =
  | 'membership'
  | 'creator-collaboration'
  | 'affiliate'
  | 'premium-content'
  | 'community'
  | 'product'
  | 'event'
  | 'mentorship'
  | 'partnership';

export type ReaderProfile = {
  id: string;
  workspaceId: ReaderGraphWorkspaceId;
  displayName: string;
  relationshipStage: RelationshipStageId;
  joinedAt: string;
  preferredPlatforms: string[];
  preferredContent: string[];
  favoriteVolumes: string[];
  favoriteChapters: string[];
  favoritePages: string[];
  favoriteCreators: string[];
  favoriteHosts: string[];
  favoriteProducts: string[];
  favoriteCampaigns: string[];
  favoriteBrands: string[];
  readerScore: number;
  trustScore: number;
  engagementScore: number;
  knowledgeScore: number;
  communityScore: number;
  advocacyScore: number;
  lifetimeValue: string;
  companyIds: string[];
};

export type RelationshipHealth = {
  readerId: string;
  engagement: number;
  trust: number;
  consistency: number;
  recency: number;
  growth: number;
  advocacy: number;
  knowledgeDepth: number;
  brandAffinity: number;
  communityInvolvement: number;
  overallPct: number;
};

export type ReaderTimelineEvent = {
  id: string;
  readerId: string;
  type:
    | 'first-interaction'
    | 'first-bookmark'
    | 'first-share'
    | 'subscribe'
    | 'first-purchase'
    | 'membership'
    | 'community-milestone'
    | 'campaign'
    | 'creator-interaction'
    | 'knowledge-growth'
    | 'relationship-milestone';
  label: string;
  at: string;
  detail?: string;
};

export type KnowledgeInterest = {
  id: string;
  readerId: string;
  interestId: KnowledgeInterestId;
  label: string;
  strengthPct: number;
  trend: 'rising' | 'stable' | 'declining';
  firstSeenAt: string;
  lastSeenAt: string;
};

export type BehaviorIntelligence = {
  readerId: string;
  readingHabits: string;
  watchHabits: string;
  purchaseHabits: string;
  learningPreferences: string;
  preferredPlatforms: string[];
  preferredPublishingTimes: string[];
  favoriteFormats: string[];
  completionBehavior: string;
  bookmarkBehavior: string;
  sharingBehavior: string;
  commentBehavior: string;
  strategyConnection: string;
};

export type CommunityCluster = {
  id: string;
  workspaceId: ReaderGraphWorkspaceId;
  label: string;
  description: string;
  memberCount: number;
  readerIds: string[];
  sharedInterests: KnowledgeInterestId[];
  recommendation: string;
};

export type ReaderIntelligenceSignal = {
  id: string;
  readerId: string;
  category: ReaderIntelligenceCategory;
  label: string;
  confidencePct: number;
  engagementStrategy: string;
};

export type RelationshipRecommendation = {
  id: string;
  readerId: string;
  type: RelationshipRecommendationType;
  label: string;
  rationale: string;
  longTermValue: string;
  confidencePct: number;
};

export type CrossCompanyRelationship = {
  id: string;
  readerId: string;
  displayName: string;
  companies: string[];
  sharedInterests: KnowledgeInterestId[];
  crossBrandBehavior: string;
  opportunities: string[];
  portfolioLifetimeValue: string;
};

export type CreatorMarketplaceOpportunity = {
  id: string;
  readerId: string;
  type: 'creator' | 'ambassador' | 'affiliate' | 'collaborator' | 'employee' | 'talent';
  label: string;
  fitScore: number;
  rationale: string;
};

export type RelationshipSimulation = {
  id: string;
  campaignId: string;
  campaignLabel: string;
  readerResponse: string;
  communityGrowth: string;
  engagement: string;
  retention: string;
  advocacy: string;
  trust: string;
  relationshipImpact: string;
  confidencePct: number;
};

export type GraphNode = {
  id: string;
  type: 'reader' | 'community' | 'interest' | 'creator' | 'campaign' | 'company' | 'knowledge-path';
  label: string;
  size: number;
  connections: string[];
};

export type PrivacyControl = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  founderControlled: boolean;
};

export type ReaderGraphStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ReaderGraphWorkspaceId;
  graphZoom: GraphZoomLevel;
  dashboard: {
    summary: string;
    totalReaders: number;
    activeRelationships: number;
    avgHealthPct: number;
    topAdvocates: number;
    emergingCommunities: number;
    crossCompanyReaders: number;
    relationshipGrowthPct: number;
  };
  relationshipPhilosophy: string[];
  journeyStages: { stage: RelationshipStageId; label: string; description: string }[];
  readers: ReaderProfile[];
  relationshipHealth: Record<string, RelationshipHealth>;
  timelines: ReaderTimelineEvent[];
  interests: KnowledgeInterest[];
  behaviorIntel: BehaviorIntelligence[];
  communities: CommunityCluster[];
  intelligenceSignals: ReaderIntelligenceSignal[];
  recommendations: RelationshipRecommendation[];
  crossCompany: CrossCompanyRelationship[];
  creatorOpportunities: CreatorMarketplaceOpportunity[];
  simulations: RelationshipSimulation[];
  graphNodes: GraphNode[];
  privacyControls: PrivacyControl[];
  selectedReaderId: string | null;
};
