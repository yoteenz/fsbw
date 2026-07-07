/** Master Content Pipeline™ — canonical Studio OS content operating model. */

/** Single source of truth asset type — replaces "page" as the product unit. */
export type MasterContentAssetKind =
  | 'page'
  | 'episode'
  | 'article'
  | 'video'
  | 'interview'
  | 'tutorial'
  | 'guide'
  | 'lesson'
  | 'case-study'
  | 'other';

export type MasterContentLifecycleStageId =
  | 'concept-opportunity'
  | 'campaign-assignment'
  | 'research-knowledge'
  | 'storyboard-script'
  | 'talent-selection'
  | 'production-planning'
  | 'master-content-creation'
  | 'internal-editing'
  | 'concierge-review-board'
  | 'founder-approval'
  | 'content-expansion'
  | 'multi-platform-review'
  | 'scheduling'
  | 'publishing'
  | 'performance-evaluation'
  | 'studio-intelligence-learning'
  | 'knowledge-library';

export type ConciergeReviewVerdict = 'pass' | 'warning' | 'fail';

export type ConciergeReviewerId =
  | 'creative-director'
  | 'brand'
  | 'editorial'
  | 'seo'
  | 'accessibility'
  | 'legal'
  | 'marketing'
  | 'social-media'
  | 'visual-design'
  | 'studio-intelligence';

export type ConciergeReviewResult = {
  reviewerId: ConciergeReviewerId;
  label: string;
  verdict: ConciergeReviewVerdict;
  scorePct: number;
  recommendations: string[];
  reviewedAt?: string;
};

export type ContentDerivativeKind =
  | 'instagram-carousel'
  | 'instagram-caption'
  | 'instagram-story'
  | 'instagram-reel'
  | 'facebook-post'
  | 'facebook-story'
  | 'tiktok-script'
  | 'tiktok-caption'
  | 'pinterest-pin'
  | 'pinterest-description'
  | 'linkedin-article'
  | 'linkedin-post'
  | 'x-thread'
  | 'newsletter'
  | 'email-campaign'
  | 'push-notification'
  | 'sms'
  | 'podcast-outline'
  | 'podcast-script'
  | 'youtube-short'
  | 'youtube-longform'
  | 'website-article'
  | 'faq-entry'
  | 'knowledge-base-article'
  | 'landing-page-copy'
  | 'ad-copy'
  | 'press-release';

export type ContentDerivativeAsset = {
  id: string;
  masterContentAssetId: string;
  kind: ContentDerivativeKind;
  platform: string;
  title: string;
  lifecycleStageId: MasterContentLifecycleStageId;
  approvalRequired: boolean;
  scheduledAt?: string;
  publishedAt?: string;
};

export type MasterContentAsset = {
  id: string;
  kind: MasterContentAssetKind;
  title: string;
  label?: string;
  campaignId?: string;
  opportunityId?: string;
  lifecycleStageId: MasterContentLifecycleStageId;
  conciergeReviews?: ConciergeReviewResult[];
  overallReadinessScorePct?: number;
  founderApprovalRequired?: boolean;
  founderApprovedAt?: string;
  derivatives?: ContentDerivativeAsset[];
  knowledgeLibraryEntryId?: string;
  createdAt: string;
  updatedAt: string;
};
