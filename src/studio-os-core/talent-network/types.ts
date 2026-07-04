/**
 * Talent Network v1.0 — unified talent operating system (AI + human).
 */

export type TalentType =
  | 'ai-presenter'
  | 'human-creator'
  | 'actor'
  | 'voice-actor'
  | 'model'
  | 'photographer'
  | 'videographer'
  | 'editor'
  | 'designer'
  | 'developer'
  | 'writer'
  | 'producer'
  | 'creative-director'
  | 'executive'
  | 'contractor'
  | 'assistant'
  | 'custom';

export type TalentStatus = 'active' | 'onboarding' | 'standby' | 'archived';

export type CastingRole =
  | 'host'
  | 'co-host'
  | 'expert'
  | 'narrator'
  | 'guest'
  | 'background'
  | 'voiceover'
  | 'interviewer'
  | 'moderator';

export type WardrobeCategory =
  | 'business'
  | 'casual'
  | 'luxury'
  | 'medical'
  | 'fitness'
  | 'technology'
  | 'formal'
  | 'streetwear'
  | 'seasonal'
  | 'holiday'
  | 'custom';

export type TalentProfile = {
  id: string;
  workspaceId: string;
  displayName: string;
  legalName?: string;
  talentType: TalentType;
  status: TalentStatus;
  biography: string;
  profileImage: string;
  portfolio: string[];
  contactEmail?: string;
  representation?: string;
  availability: string;
  verified: boolean;
  onboardingStatus: 'complete' | 'in-progress' | 'pending';
  knowledgeGraphNodeId: string;
  aiProfile?: AiTalentProfile;
  performance: TalentPerformanceMetrics;
  talentScore: TalentScoreBreakdown;
  createdAt: string;
  updatedAt: string;
};

export type AiTalentProfile = {
  appearance: string;
  ageRange: string;
  voice: string;
  accent: string;
  speakingSpeed: string;
  tone: string;
  personality: string;
  facialExpressions: string[];
  emotionPresets: string[];
  bodyLanguage: string;
  cameraConfidence: number;
  defaultWardrobeId: string;
  alternateWardrobeIds: string[];
  signatureColors: string[];
  brandRestrictions: string[];
  catchphrases: string[];
  knowledgeDomains: string[];
  approvedTopics: string[];
  restrictedTopics: string[];
  creativeDnaVersion: string;
  voiceModel: string;
  imageModel: string;
  animationModel: string;
};

export type WardrobeLook = {
  id: string;
  workspaceId: string;
  name: string;
  category: WardrobeCategory;
  description: string;
  colors: string[];
  reusable: boolean;
  assignedTalentIds: string[];
};

export type CastingAssignment = {
  id: string;
  workspaceId: string;
  productionId: string;
  productionTitle: string;
  talentId: string;
  role: CastingRole;
  status: 'cast' | 'audition' | 'confirmed' | 'completed';
};

export type SeriesAssignment = {
  id: string;
  workspaceId: string;
  talentId: string;
  showId: string;
  showName: string;
  seriesName?: string;
  campaign?: string;
  episodeIds: string[];
  recurring: boolean;
};

export type TalentPerformanceMetrics = {
  views: number;
  watchTimeSec: number;
  retention: number;
  engagement: number;
  shares: number;
  comments: number;
  followers: number;
  revenue: number;
  affiliateRevenue: number;
  sponsorshipRevenue: number;
  conversion: number;
  brandSafety: number;
  sentiment: number;
};

export type TalentScoreBreakdown = {
  overall: number;
  viewerRetention: number;
  audienceTrust: number;
  engagement: number;
  brandFit: number;
  consistency: number;
  revenueGeneration: number;
  professionalism: number;
  availability: number;
  growth: number;
};

export type AudienceIntelRecord = {
  id: string;
  talentId: string;
  bestDemographics: string;
  bestPlatforms: string[];
  bestPillars: string[];
  bestPublishingTimes: string[];
  bestVoice?: string;
  bestWardrobeId?: string;
  bestHooks: string[];
  bestCollaborations: string[];
};

export type CharacterVersion = {
  id: string;
  talentId: string;
  version: number;
  label: string;
  appearanceSnapshot: string;
  voiceSnapshot: string;
  wardrobeSnapshot: string;
  personalitySnapshot: string;
  creativeDnaVersion: string;
  createdAt: string;
};

export type TalentContract = {
  id: string;
  talentId: string;
  workspaceId: string;
  title: string;
  rate: string;
  deliverables: string[];
  exclusivity: string;
  usageRights: string;
  renewalDate?: string;
  representation?: string;
  notes: string;
  paymentHistory: Array<{ date: string; amount: number; label: string }>;
};

export type GrowthTalentRecommendation = {
  id: string;
  workspaceId: string;
  talentId?: string;
  talentType?: TalentType;
  recommendation: string;
  context: string;
  confidence: number;
};

export type HumanOnboardingDraft = {
  id: string;
  workspaceId: string;
  displayName: string;
  bio: string;
  platforms: string[];
  portfolio: string[];
  rates: string;
  audience: string;
  niche: string;
  goals: string[];
  availability: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
};

export type TalentNetworkStore = {
  talents: TalentProfile[];
  wardrobes: WardrobeLook[];
  castings: CastingAssignment[];
  seriesAssignments: SeriesAssignment[];
  audienceIntel: AudienceIntelRecord[];
  characterVersions: CharacterVersion[];
  contracts: TalentContract[];
  growthRecommendations: GrowthTalentRecommendation[];
  onboardingDrafts: HumanOnboardingDraft[];
  version: string;
};
