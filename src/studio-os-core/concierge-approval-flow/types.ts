import type { FOUNDER_ACTIONS, REVIEW_ORDER, REVIEW_VERDICT_LABELS } from './constants';

export type ReviewConciergeId = (typeof REVIEW_ORDER)[number]['id'];
export type ReviewVerdict = keyof typeof REVIEW_VERDICT_LABELS;
export type FounderActionId = (typeof FOUNDER_ACTIONS)[number]['id'];

export type ConciergeReviewStep = {
  conciergeId: ReviewConciergeId;
  title: string;
  accent: string;
  criteria: string[];
  status: 'pending' | 'in-review' | 'complete';
  verdict?: ReviewVerdict;
  confidencePct?: number;
  reasoning?: string;
  historicalComparison?: string;
  completedAt?: string;
};

export type FounderBrief = {
  chiefSummary: string;
  overallReadiness: string;
  recommendedChanges: string[];
  confidencePct: number;
  predictedOutcome: string;
  remainingConcerns: string[];
  preparedAt: string;
};

export type ApprovalContentItem = {
  id: string;
  title: string;
  pageRoute: string;
  contentType: string;
  submittedAt: string;
  requiresFounderAlways: boolean;
  trustAutoEligible: boolean;
  currentStepIndex: number;
  reviews: ConciergeReviewStep[];
  founderBrief?: FounderBrief;
  founderDecision?: { action: FounderActionId; at: string; note: string };
};

export type ConciergeApprovalFlowStore = {
  version: string;
  lastUpdatedAt: string;
  companyName: string;
  selectedItemId: string | null;
  futureTrustVision: string;
  dashboard: {
    summary: string;
    inConciergeReview: number;
    awaitingFounder: number;
    approvedToday: number;
    avgConfidencePct: number;
  };
  philosophy: string[];
  items: ApprovalContentItem[];
  lastAction?: { action: FounderActionId; at: string; note: string };
};
