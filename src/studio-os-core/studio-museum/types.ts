/**
 * Studio Museum™ — permanent archive of a company's greatest achievements.
 * Warehouse builds the future. Museum preserves it.
 */

export const MUSEUM_EXHIBIT_TYPES = [
  'golden-build',
  'launch-campaign',
  'brand-refresh',
  'website-version',
  'viral-campaign',
  'revenue-milestone',
  'product-release',
  'award-design',
  'historic-packaging',
  'company-timeline',
  'founder-milestone',
  'historic-headquarters',
  'retired-environment',
  'retired-brand-system',
] as const;

export type MuseumExhibitType = (typeof MUSEUM_EXHIBIT_TYPES)[number];

export type MuseumLegacyMilestoneKind =
  | 'first-sale'
  | 'first-launch'
  | 'golden-build'
  | 'headquarters-complete'
  | 'campaign-of-year'
  | 'customer-milestone'
  | 'revenue-milestone'
  | 'founder-milestone';

export type MuseumTimelineNode = {
  id: string;
  label: string;
  date: string;
  era: string;
  summary: string;
};

export type MuseumSceneRecipeLine = {
  role: string;
  assetName: string;
  version: string;
};

export type MuseumAssetRecipeLine = {
  category: string;
  count: number;
  reusableCount: number;
};

export type MuseumReplayStep = {
  id: string;
  label: string;
  durationSec: number;
};

export type MuseumMarketplaceHistory = {
  downloads: number;
  revenueUsd: number;
  creator: string;
  forks: number;
  companiesUsing: number;
  communityRating: number;
  evolutionBranches: string[];
};

export type MuseumExhibit = {
  id: string;
  type: MuseumExhibitType;
  title: string;
  subtitle: string;
  company: string;
  launchDate: string;
  heroGradient: string;
  heroEnvironment: string;
  rooms: string[];
  generationCostUsd: number;
  revenueImpactUsd: number;
  runtimeStats: { sessions: number; avgDurationMin: number; reuseAssets: number };
  creativeDecisions: string[];
  founderNotes: string[];
  moodReferences: string[];
  voiceNoteLabels: string[];
  originalPromptExcerpt: string;
  iterationCount: number;
  approvalHistory: string[];
  sceneRecipe: MuseumSceneRecipeLine[];
  assetRecipe: MuseumAssetRecipeLine[];
  companyGenomeSnapshot: string;
  marketplace?: MuseumMarketplaceHistory;
  timeline: MuseumTimelineNode[];
  replaySteps: MuseumReplayStep[];
  historianQuotes: string[];
  tags: string[];
  archivedAt: string;
};

export type MuseumLegacyWallItem = {
  id: string;
  kind: MuseumLegacyMilestoneKind;
  icon: string;
  title: string;
  date: string;
  caption: string;
  exhibitId?: string;
};

export type MuseumViewMode =
  | 'exhibits'
  | 'time-machine'
  | 'legacy-wall'
  | 'memory-sphere'
  | 'replay'
  | 'marketplace-history';
