/** Relationship Engine V1.0 — active relationship management (Milestone 48). */

export type RelationshipEngineWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type LifecycleStageId =
  | 'discover'
  | 'reader'
  | 'engaged-reader'
  | 'community-member'
  | 'subscriber'
  | 'customer'
  | 'repeat-customer'
  | 'member'
  | 'affiliate'
  | 'creator'
  | 'ambassador'
  | 'partner'
  | 'advisor'
  | 'legacy';

export type NextBestActionType =
  | 'membership'
  | 'affiliate'
  | 'creator-marketplace'
  | 'ambassador'
  | 'product'
  | 'event'
  | 'community'
  | 'educational-series'
  | 'partnership'
  | 'mentorship'
  | 'exclusive-access'
  | 'loyalty-reward';

export type CommunicationChannel = 'email' | 'sms' | 'push' | 'community' | 'social' | 'event' | 'creator-outreach';

export type RecognitionType =
  | 'anniversary'
  | 'milestone'
  | 'top-contributor'
  | 'community-helper'
  | 'top-affiliate'
  | 'early-supporter'
  | 'founding-member'
  | 'purchase-anniversary';

export type RelationshipWorkspace = {
  id: string;
  readerGraphId: string;
  workspaceId: RelationshipEngineWorkspaceId;
  displayName: string;
  currentStage: LifecycleStageId;
  trustScore: number;
  engagementScore: number;
  advocacyScore: number;
  communityScore: number;
  knowledgeScore: number;
  relationshipHealthPct: number;
  purchaseHistory: string[];
  interactionSummary: string;
  communicationSummary: string;
  campaignParticipation: string[];
  companyIds: string[];
};

export type NextBestAction = {
  id: string;
  relationshipId: string;
  type: NextBestActionType;
  label: string;
  why: string;
  expectedImpact: string;
  confidencePct: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
};

export type RelationshipHealthDetail = {
  relationshipId: string;
  trust: number;
  consistency: number;
  engagement: number;
  communication: number;
  communityParticipation: number;
  knowledgeProgression: number;
  brandAffinity: number;
  purchaseBehavior: number;
  referrals: number;
  advocacy: number;
  overallPct: number;
};

export type RelationshipTimelineEvent = {
  id: string;
  relationshipId: string;
  type:
    | 'first-discovery'
    | 'first-interaction'
    | 'first-bookmark'
    | 'first-comment'
    | 'first-share'
    | 'first-purchase'
    | 'first-membership'
    | 'first-referral'
    | 'first-collaboration'
    | 'first-event'
    | 'milestone'
    | 'celebration'
    | 'recognition';
  label: string;
  at: string;
  detail?: string;
};

export type RelationshipIntelligenceSignal = {
  id: string;
  relationshipId: string;
  category:
    | 'future-member'
    | 'future-affiliate'
    | 'future-creator'
    | 'future-ambassador'
    | 'future-partner'
    | 'future-advisor'
    | 'future-employee'
    | 'future-advocate'
    | 'future-enterprise';
  label: string;
  confidencePct: number;
  proactiveAction: string;
};

export type CommunityEngineGroup = {
  id: string;
  workspaceId: RelationshipEngineWorkspaceId;
  label: string;
  description: string;
  memberCount: number;
  sharedInterests: string[];
  recommendations: string[];
};

export type CommunicationOrchestration = {
  id: string;
  relationshipId: string;
  channel: CommunicationChannel;
  label: string;
  scheduledAt: string;
  frequency: string;
  fatigueRisk: 'low' | 'medium' | 'high';
  personalized: boolean;
};

export type RecognitionEvent = {
  id: string;
  relationshipId: string;
  type: RecognitionType;
  title: string;
  message: string;
  at: string;
  sent: boolean;
};

export type LoyaltyIntelligence = {
  relationshipId: string;
  participation: number;
  education: number;
  contributions: number;
  communityImpact: number;
  referrals: number;
  support: number;
  brandAdvocacy: number;
  knowledgeSharing: number;
  overallLoyaltyPct: number;
  rewardRecommendation: string;
};

export type PortfolioRelationship = {
  id: string;
  relationshipId: string;
  displayName: string;
  companies: string[];
  roles: string[];
  portfolioValue: string;
  opportunities: string[];
};

export type CosRelationshipAlert = {
  id: string;
  relationshipId: string;
  type: 'needs-attention' | 'recognition-due' | 'future-partner' | 'weakening' | 'intervention';
  label: string;
  recommendation: string;
  urgency: 'critical' | 'high' | 'medium';
};

export type RelationshipSimulation = {
  id: string;
  campaignId: string;
  campaignLabel: string;
  relationshipImpact: string;
  trustImpact: string;
  communityGrowth: string;
  memberGrowth: string;
  advocacy: string;
  retention: string;
  referralGrowth: string;
  confidencePct: number;
};

export type InstitutionalLearningEntry = {
  id: string;
  type: 'successful-engagement' | 'failed-outreach' | 'community-insight' | 'preference' | 'communication' | 'trust-builder' | 'pattern';
  title: string;
  detail: string;
  updatesSystems: string[];
};

export type RelationshipEngineStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: RelationshipEngineWorkspaceId;
  dashboard: {
    summary: string;
    activeRelationships: number;
    avgHealthPct: number;
    pendingActions: number;
    communityLeaders: number;
    recognitionsDue: number;
    portfolioRelationships: number;
    trustTrendPct: number;
  };
  lifecycleStages: { stage: LifecycleStageId; label: string; description: string }[];
  relationships: RelationshipWorkspace[];
  healthDetails: Record<string, RelationshipHealthDetail>;
  nextBestActions: NextBestAction[];
  timelines: RelationshipTimelineEvent[];
  intelligenceSignals: RelationshipIntelligenceSignal[];
  communities: CommunityEngineGroup[];
  communications: CommunicationOrchestration[];
  recognitions: RecognitionEvent[];
  loyaltyIntel: Record<string, LoyaltyIntelligence>;
  portfolio: PortfolioRelationship[];
  cosAlerts: CosRelationshipAlert[];
  simulations: RelationshipSimulation[];
  institutionalLearning: InstitutionalLearningEntry[];
  selectedRelationshipId: string | null;
};
