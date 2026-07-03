/** Creative Director — shared types for decision engine modules. */

import type {
  ContentPurposeId,
  CreativeTimelineStepId,
  DistributionChannelId,
  CreativeOutputId,
  OutputTier,
  BrandDimensionId,
  ContentScoreId,
} from '../../../utils/adminStudioCreativeDirectorDemo';

export type CreativeDirectorSession = {
  topic: string;
  selectedShowId: string;
  campaignGoal: string;
  targetAudience: string;
  membershipTier: string;
  primaryCtaId: string;
  contentPurpose: ContentPurposeId;
  featuredProductIds: string[];
  rewardId: string;
  environment: string;
  promptFrameworkId: string;
  visualLanguage: string;
  publishingStatus: string;
  approvalStatus: 'draft' | 'needs-review' | 'approved' | 'rejected' | 'scheduled' | 'published';
  timelineStep: CreativeTimelineStepId;
  showRecommendationOverride: boolean;
  manualShowId: string;
  outputs: Record<CreativeOutputId, OutputTier>;
  distribution: Record<DistributionChannelId, boolean>;
};

export type ShowRecommendation = {
  showId: string;
  showName: string;
  reason: string;
  confidence: number;
};

export type DecisionRecommendation = {
  show: ShowRecommendation;
  contentPurpose: ContentPurposeId;
  primaryCtaId: string;
  primaryCtaLabel: string;
  featuredProductIds: string[];
  featuredProductNames: string[];
  rewardId: string;
  rewardLabel: string;
  membershipTier: string;
  environment: string;
  promptFrameworkId: string;
  promptFrameworkLabel: string;
  visualLanguage: string;
  distribution: DistributionChannelId[];
};

export type BrandAlignmentResult = {
  overallScore: number;
  dimensions: Record<BrandDimensionId, number>;
  passesThreshold: boolean;
  improvements: string[];
};

export type ContentScoreResult = {
  overallScore: number;
  scores: Record<ContentScoreId, number>;
};

export type QualityGateResult = {
  checks: Array<{ id: string; label: string; passed: boolean; detail?: string }>;
  allPassed: boolean;
  canGenerate: boolean;
};

export type PromptAssemblerStage = {
  id: string;
  label: string;
  snippet: string;
  included: boolean;
};

export type PromptAssemblerResult = {
  stages: PromptAssemblerStage[];
  masterPrompt: string;
};

export type DistributionRecommendation = {
  channelId: DistributionChannelId;
  label: string;
  activation: 'ACTIVE' | 'COMING_SOON';
  recommended: boolean;
  enabled: boolean;
  engagementEstimate: string;
};

export type CreativeDirectorDecisionPackage = {
  session: CreativeDirectorSession;
  recommendation: DecisionRecommendation;
  brandAlignment: BrandAlignmentResult;
  contentScore: ContentScoreResult;
  qualityGate: QualityGateResult;
  promptAssembly: PromptAssemblerResult;
  distribution: DistributionRecommendation[];
};
