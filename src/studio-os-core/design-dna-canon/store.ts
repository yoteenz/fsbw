import {
  CANON_PROTECTION_RULES,
  DESIGN_DNA_CANON_STORAGE_KEY,
  DESIGN_DNA_CANON_VERSION,
  DESIGN_DNA_PHILOSOPHY,
  FINAL_DESIGN_TEST,
  VISUAL_RELATIONSHIP_PATTERNS,
} from './constants';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import type {
  CanonPageId,
  DesignDnaCanonStore,
  DesignDnaNavId,
  PageDesignReview,
  PageDesignReviewStatus,
} from './types';

function emptyStore(): DesignDnaCanonStore {
  return {
    version: DESIGN_DNA_CANON_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    organizationName: 'FRONTAL SLAYER',
    selectedCanonPageId: null,
    selectedReviewId: null,
    activeNavId: 'canon-pages',
    philosophy: [...DESIGN_DNA_PHILOSOPHY],
    canonProtection: [...CANON_PROTECTION_RULES],
    finalDesignTest: FINAL_DESIGN_TEST,
    canonPages: [],
    principles: [],
    visualRelationshipPatterns: [...VISUAL_RELATIONSHIP_PATTERNS],
    reviews: [],
    dashboard: {
      summary: 'DESIGN DNA & CANON SYSTEM — permanent creative compass for Frontal Slayer Headquarters.',
      protectedCanonCount: 0,
      principleCount: 0,
      avgReviewConfidence: 0,
      pendingReviews: 0,
    },
  };
}

function refreshDashboard(store: DesignDnaCanonStore): DesignDnaCanonStore['dashboard'] {
  const protectedCanonCount = store.canonPages.filter((p) => p.status === 'protected').length;
  const scores = store.reviews.map((r) => r.confidenceScore).filter((n) => n > 0);
  const avgReviewConfidence =
    scores.length === 0 ? 0 : Math.round(scores.reduce((s, n) => s + n, 0) / scores.length);
  const pendingReviews = store.reviews.filter(
    (r) => r.status === 'pending' || r.status === 'in-review' || r.status === 'needs-refinement'
  ).length;

  return {
    ...store.dashboard,
    protectedCanonCount,
    principleCount: store.principles.length,
    avgReviewConfidence,
    pendingReviews,
  };
}

export function readDesignDnaCanonStore(): DesignDnaCanonStore {
  if (typeof window === 'undefined') return emptyStore();
  const parsed = readScopedStore(DESIGN_DNA_CANON_STORAGE_KEY, emptyStore);
  return { ...parsed, dashboard: refreshDashboard(parsed) };
}

export function writeDesignDnaCanonStore(store: DesignDnaCanonStore): void {
  if (typeof window === 'undefined') return;
  const next = {
    ...store,
    dashboard: refreshDashboard(store),
    lastUpdatedAt: new Date().toISOString(),
  };
  writeScopedStore(DESIGN_DNA_CANON_STORAGE_KEY, next);
}

export function bootstrapDesignDnaCanonStore(seed?: Partial<DesignDnaCanonStore>): void {
  const existing = readDesignDnaCanonStore();
  if (existing.canonPages.length > 0 && !seed) return;
  const canonPages = seed?.canonPages ?? [];
  const first = canonPages[0];
  writeDesignDnaCanonStore({
    ...emptyStore(),
    ...seed,
    canonPages,
    principles: seed?.principles ?? [],
    reviews: seed?.reviews ?? [],
    selectedCanonPageId: seed?.selectedCanonPageId ?? first?.id ?? null,
    selectedReviewId: seed?.selectedReviewId ?? seed?.reviews?.[0]?.id ?? null,
    philosophy: seed?.philosophy ?? [...DESIGN_DNA_PHILOSOPHY],
    canonProtection: seed?.canonProtection ?? [...CANON_PROTECTION_RULES],
    visualRelationshipPatterns: seed?.visualRelationshipPatterns ?? [...VISUAL_RELATIONSHIP_PATTERNS],
  });
}

export function selectCanonPage(pageId: CanonPageId): void {
  const store = readDesignDnaCanonStore();
  writeDesignDnaCanonStore({
    ...store,
    selectedCanonPageId: pageId,
    activeNavId: 'canon-pages',
  });
}

export function selectDesignReview(reviewId: string): void {
  const store = readDesignDnaCanonStore();
  writeDesignDnaCanonStore({
    ...store,
    selectedReviewId: reviewId,
    activeNavId: 'design-review',
  });
}

export function setDesignDnaNav(navId: DesignDnaNavId): void {
  const store = readDesignDnaCanonStore();
  writeDesignDnaCanonStore({ ...store, activeNavId: navId });
}

export function updateReviewStatus(reviewId: string, status: PageDesignReviewStatus): void {
  const store = readDesignDnaCanonStore();
  const reviews = store.reviews.map((r) =>
    r.id === reviewId ? { ...r, status, reviewedAt: new Date().toISOString() } : r
  );
  writeDesignDnaCanonStore({ ...store, reviews });
}

export function getSelectedCanonPage(store: DesignDnaCanonStore) {
  return store.canonPages.find((p) => p.id === store.selectedCanonPageId) ?? store.canonPages[0] ?? null;
}

export function getSelectedReview(store: DesignDnaCanonStore): PageDesignReview | null {
  return store.reviews.find((r) => r.id === store.selectedReviewId) ?? store.reviews[0] ?? null;
}

export function getReviewsNeedingRefinement(store: DesignDnaCanonStore): PageDesignReview[] {
  return store.reviews.filter((r) => r.status === 'needs-refinement' || r.confidenceScore < 85);
}

export function averageCriterionScore(review: PageDesignReview): number {
  const scores = Object.values(review.criteria).map((c) => c.score);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((s, n) => s + n, 0) / scores.length);
}
