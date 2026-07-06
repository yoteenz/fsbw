/** Founder Pilot Mode — real-world organization bootstrap (Milestone 87). */

export type FounderTimelineMilestoneId =
  | 'organization-created'
  | 'instagram-connected'
  | 'first-page-written'
  | 'first-approval'
  | 'first-publish'
  | 'first-comment'
  | 'first-share'
  | 'first-viral-post'
  | 'first-revenue'
  | 'first-100-pages'
  | 'first-1000-followers'
  | 'first-experiment'
  | 'first-ai-recommendation'
  | 'first-automation';

export type FounderTimelineMilestone = {
  id: FounderTimelineMilestoneId;
  label: string;
  description: string;
  recordedAt: string;
  pageNumber?: number;
  metadata?: Record<string, string>;
};

export type IntelligenceMaturityTier = {
  postsRequired: number;
  label: string;
  unlocks: string;
};

export type FounderPilotModeStore = {
  version: string;
  organizationId: string;
  enabled: boolean;
  activatedAt: string;
  pagesPublished: number;
  followers: number;
  knowledgeAssets: number;
  milestones: FounderTimelineMilestone[];
};
