import type { COMPARISON_FIELDS } from './constants';

export type ComparisonFieldId = (typeof COMPARISON_FIELDS)[number]['id'];

export type ConciergeReviewerId =
  | 'brand-concierge'
  | 'experience-concierge'
  | 'growth-concierge'
  | 'technology-concierge'
  | 'chief-concierge';

export type ScreeningVersion = {
  id: string;
  label: string;
  isCurrent: boolean;
  runtimeSec: number;
  thumbnailNote: string;
  voiceNote: string;
  hook: string;
  caption: string;
  title: string;
  description: string;
  performancePrediction: string;
  confidencePct: number;
  renderQualityPct: number;
};

export type ConciergeReview = {
  id: ConciergeReviewerId;
  title: string;
  accent: string;
  notes: string;
  analysis: string;
};

export type ScreeningProduction = {
  id: string;
  title: string;
  pageRoute: string;
  readyAt: string;
  versions: ScreeningVersion[];
};

export type ScreeningReviewAction =
  | 'approve'
  | 'request-changes'
  | 'regenerate'
  | 'compare'
  | 'experiment'
  | 'publish-later'
  | 'send-to-render';

export type ScreeningRoomStore = {
  version: string;
  lastUpdatedAt: string;
  companyName: string;
  selectedProductionId: string | null;
  currentVersionId: string | null;
  compareMode: boolean;
  compareVersionIds: string[];
  compareField: ComparisonFieldId;
  playerPlaying: boolean;
  dashboard: {
    summary: string;
    awaitingReview: number;
    approvedToday: number;
    experimentsQueued: number;
    avgConfidencePct: number;
  };
  philosophy: string[];
  productions: ScreeningProduction[];
  conciergeReviews: ConciergeReview[];
  lastAction?: { action: ScreeningReviewAction; at: string; note: string };
};
