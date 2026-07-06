import type { HEADQUARTERS_REVIEW_CRITERIA } from './constants';

export type HeadquartersReviewCriterionId = (typeof HEADQUARTERS_REVIEW_CRITERIA)[number]['id'];

export type CanonPageId =
  | 'concierge'
  | 'build-a-wig'
  | 'hair-analysis'
  | 'orders'
  | 'rewards'
  | 'appointments'
  | 'client-profile'
  | 'products';

export type CanonPageStatus = 'protected' | 'reference';

export type DesignDnaNavId = 'canon-pages' | 'principles' | 'design-review' | 'spatial-rooms';

export type CanonPage = {
  id: CanonPageId;
  label: string;
  route: string;
  roomMetaphor: string;
  dominantEmotion: string;
  status: CanonPageStatus;
  protectedNote: string;
  visualRelationships: string[];
  rhythmNotes: string[];
  interactionNotes: string[];
};

export type DesignDnaPrincipleCategory =
  | 'philosophy'
  | 'canon-protection'
  | 'optical-alignment'
  | 'spatial-storytelling'
  | 'emotional-design'
  | 'visual-rhythm'
  | 'interaction'
  | 'component-evolution'
  | 'do-not-copy-pixels'
  | 'intentional-imperfection';

export type DesignDnaPrinciple = {
  id: string;
  category: DesignDnaPrincipleCategory;
  title: string;
  body: string;
  whyItMatters: string;
};

export type ReviewCriterionScore = {
  score: number;
  note: string;
};

export type PageDesignReviewStatus = 'pending' | 'in-review' | 'passed' | 'needs-refinement';

export type PageDesignReview = {
  id: string;
  pageLabel: string;
  route: string;
  canonPageId?: CanonPageId;
  isNewPage: boolean;
  status: PageDesignReviewStatus;
  confidenceScore: number;
  criteria: Record<HeadquartersReviewCriterionId, ReviewCriterionScore>;
  finalTestAnswer: string;
  reviewedAt?: string;
};

export type DesignDnaCanonStore = {
  version: string;
  lastUpdatedAt: string;
  organizationName: string;
  selectedCanonPageId: CanonPageId | null;
  selectedReviewId: string | null;
  activeNavId: DesignDnaNavId;
  philosophy: string[];
  canonProtection: string[];
  finalDesignTest: string;
  canonPages: CanonPage[];
  principles: DesignDnaPrinciple[];
  visualRelationshipPatterns: string[];
  reviews: PageDesignReview[];
  dashboard: {
    summary: string;
    protectedCanonCount: number;
    principleCount: number;
    avgReviewConfidence: number;
    pendingReviews: number;
  };
};
