/**
 * Marketplace v1.0 — professional operating network for modern businesses.
 */

export type ParticipantType =
  | 'brand'
  | 'creator'
  | 'agency'
  | 'photographer'
  | 'videographer'
  | 'editor'
  | 'graphic-designer'
  | 'developer'
  | 'ugc-creator'
  | 'voice-actor'
  | 'model'
  | 'lawyer'
  | 'accountant'
  | 'manufacturer'
  | 'fulfillment'
  | 'marketing-agency'
  | 'virtual-assistant'
  | 'consultant'
  | 'custom';

export type PricingModel =
  | 'hourly'
  | 'fixed-price'
  | 'retainer'
  | 'commission'
  | 'royalty'
  | 'licensing'
  | 'revenue-share'
  | 'custom';

export type VerificationType =
  | 'identity'
  | 'business'
  | 'brand'
  | 'portfolio'
  | 'workspace';

export type DealStage =
  | 'discovery'
  | 'introduction'
  | 'meeting'
  | 'proposal'
  | 'negotiation'
  | 'contract'
  | 'production'
  | 'approval'
  | 'delivery'
  | 'invoice'
  | 'payment'
  | 'renewal'
  | 'completed';

export type PaymentRecordStatus = 'pending' | 'scheduled' | 'escrow' | 'partial' | 'paid' | 'refunded';

export type ParticipantProfile = {
  id: string;
  workspaceId: string;
  displayName: string;
  participantType: ParticipantType;
  biography: string;
  profileImage: string;
  portfolio: string[];
  services: string[];
  industries: string[];
  pricingModel: PricingModel;
  pricingSummary: string;
  availability: string;
  verified: boolean;
  verificationBadges: VerificationType[];
  reviews: MarketplaceReview[];
  completedProjects: number;
  performanceHistory: PerformanceSnapshot;
  workspaceConnections: string[];
  knowledgeGraphNodeId: string;
  trustScore: TrustScoreBreakdown;
  createdAt: string;
  updatedAt: string;
};

export type PerformanceSnapshot = {
  responsiveness: number;
  completionRate: number;
  quality: number;
  timeliness: number;
  clientSatisfaction: number;
  repeatBusinessRate: number;
};

export type TrustScoreBreakdown = {
  overall: number;
  responsiveness: number;
  completionRate: number;
  quality: number;
  timeliness: number;
  clientSatisfaction: number;
  communication: number;
  repeatBusiness: number;
  platformHistory: number;
};

export type MarketplaceReview = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
};

export type MatchRecommendation = {
  id: string;
  workspaceId: string;
  participantId: string;
  targetParticipantId?: string;
  targetNeed: string;
  compatibilityScore: number;
  explanation: string;
  signals: string[];
  context: string;
};

export type MarketplaceDeal = {
  id: string;
  workspaceId: string;
  title: string;
  initiatorId: string;
  counterpartyId: string;
  stage: DealStage;
  pricingModel: PricingModel;
  budget: string;
  value: number;
  startedAt: string;
  updatedAt: string;
  renewalEligible: boolean;
  relationshipHistory: DealHistoryEntry[];
};

export type DealHistoryEntry = {
  id: string;
  stage: DealStage;
  label: string;
  date: string;
  note?: string;
};

export type CollaborationHub = {
  id: string;
  dealId: string;
  workspaceId: string;
  messages: CollaborationMessage[];
  sharedFiles: string[];
  deliverables: string[];
  timeline: CollaborationTimelineItem[];
  approvals: string[];
  contractRef?: string;
  paymentRefs: string[];
  meetingNotes: string[];
  activityFeed: ActivityFeedItem[];
  aiRecommendations: string[];
};

export type CollaborationMessage = {
  id: string;
  author: string;
  body: string;
  date: string;
};

export type CollaborationTimelineItem = {
  id: string;
  label: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'complete';
};

export type ActivityFeedItem = {
  id: string;
  label: string;
  date: string;
};

export type PaymentArchitectureRecord = {
  id: string;
  dealId: string;
  workspaceId: string;
  type: 'milestone' | 'escrow' | 'invoice' | 'partial' | 'tip' | 'refund' | 'payout';
  amount: number;
  status: PaymentRecordStatus;
  label: string;
  scheduledDate?: string;
  note: string;
};

export type EcosystemRecommendation = {
  id: string;
  workspaceId: string;
  fromParticipantId: string;
  toParticipantType: ParticipantType;
  toParticipantId?: string;
  need: string;
  recommendation: string;
  longTermFocus: boolean;
};

export type MarketplaceStore = {
  participants: ParticipantProfile[];
  matches: MatchRecommendation[];
  deals: MarketplaceDeal[];
  collaborationHubs: CollaborationHub[];
  payments: PaymentArchitectureRecord[];
  ecosystemRecommendations: EcosystemRecommendation[];
  version: string;
};
