import {
  APPROVAL_PHILOSOPHY,
  CONCIERGE_APPROVAL_FLOW_STORAGE_KEY,
  CONCIERGE_APPROVAL_FLOW_VERSION,
  CONCIERGE_CRITERIA,
  REVIEW_ORDER,
} from './constants';
import type {
  ApprovalContentItem,
  ConciergeApprovalFlowStore,
  ConciergeReviewStep,
  FounderActionId,
  FounderBrief,
  ReviewConciergeId,
  ReviewVerdict,
} from './types';

type ConciergeOnlyId = Exclude<ReviewConciergeId, 'founder'>;

function isConciergeOnlyId(id: ReviewConciergeId): id is ConciergeOnlyId {
  return id !== 'founder';
}

function emptyStore(): ConciergeApprovalFlowStore {
  return {
    version: CONCIERGE_APPROVAL_FLOW_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    companyName: 'COMPANY',
    selectedItemId: null,
    futureTrustVision:
      'Routine content may auto-approve via customizable trust thresholds. Major campaigns, launches, brand announcements, and high-impact organizational communications always require founder approval unless explicitly delegated.',
    dashboard: {
      summary: 'CONCIERGE APPROVAL FLOW — editorial board before founder decision.',
      inConciergeReview: 0,
      awaitingFounder: 0,
      approvedToday: 0,
      avgConfidencePct: 0,
    },
    philosophy: [...APPROVAL_PHILOSOPHY],
    items: [],
  };
}

export function buildReviewStep(
  conciergeId: ReviewConciergeId,
  status: ConciergeReviewStep['status'],
  extra?: Partial<Omit<ConciergeReviewStep, 'conciergeId' | 'title' | 'accent' | 'criteria' | 'status'>>
): ConciergeReviewStep {
  const meta = REVIEW_ORDER.find((r) => r.id === conciergeId)!;
  return {
    conciergeId,
    title: meta.title,
    accent: meta.accent,
    criteria: [...CONCIERGE_CRITERIA[conciergeId]],
    status,
    ...extra,
  };
}

export function buildFounderBriefFromReviews(
  itemTitle: string,
  reviews: ConciergeReviewStep[]
): FounderBrief {
  const completed = reviews.filter((r) => isConciergeOnlyId(r.conciergeId) && r.status === 'complete');
  const confidences = completed.map((r) => r.confidencePct ?? 0).filter((n) => n > 0);
  const avg =
    confidences.length === 0
      ? 0
      : Math.round(confidences.reduce((s, n) => s + n, 0) / confidences.length);

  const suggestions = completed.filter((r) => r.verdict === 'approved-with-suggestions');
  const revisions = completed.filter((r) => r.verdict === 'needs-revision' || r.verdict === 'critical-issue');

  const recommendedChanges = [
    ...suggestions.map((r) => `${r.title}: ${r.reasoning?.split('.')[0] ?? 'Minor refinement noted.'}`),
    ...(revisions.length > 0 ? [`Address ${revisions.length} revision item(s) before publication.`] : []),
  ].slice(0, 5);

  const remainingConcerns = completed
    .filter((r) => r.verdict !== 'approved')
    .map((r) => `${r.title}: ${REVIEW_VERDICT_LABEL(r.verdict!)} — ${r.reasoning?.slice(0, 120) ?? ''}`)
    .slice(0, 4);

  const readiness =
    revisions.length > 0
      ? 'NOT READY — revision required before founder review.'
      : suggestions.length > 2
        ? 'READY WITH REFINEMENTS — publication viable after optional polish.'
        : 'READY FOR FOUNDER — organizational review complete. No unfinished work remains.';

  return {
    chiefSummary: `Chief Concierge unified brief for "${itemTitle}" — six discipline reviews consolidated into one executive recommendation. The founder receives finished organizational judgment, not raw drafts.`,
    overallReadiness: readiness,
    recommendedChanges:
      recommendedChanges.length > 0
        ? recommendedChanges
        : ['No material changes required — proceed to founder decision.'],
    confidencePct: avg,
    predictedOutcome:
      avg >= 88
        ? 'STRONG — high confidence evergreen performance with brand-safe distribution.'
        : avg >= 75
          ? 'SOLID — publication-ready with monitored experiment opportunities.'
          : 'CAUTIOUS — approve only with founder awareness of noted concerns.',
    remainingConcerns:
      remainingConcerns.length > 0 ? remainingConcerns : ['No outstanding organizational blockers.'],
    preparedAt: new Date().toISOString(),
  };
}

function REVIEW_VERDICT_LABEL(verdict: ReviewVerdict): string {
  const labels = {
    approved: 'APPROVED',
    'approved-with-suggestions': 'APPROVED WITH SUGGESTIONS',
    'needs-revision': 'NEEDS REVISION',
    'critical-issue': 'CRITICAL ISSUE',
  };
  return labels[verdict];
}

function syncItemReviews(item: ApprovalContentItem): ApprovalContentItem {
  const reviews = [...item.reviews];
  const idx = item.currentStepIndex;
  reviews.forEach((r, i) => {
    if (i < idx) r.status = 'complete';
    else if (i === idx && r.conciergeId !== 'founder') r.status = 'in-review';
    else if (i > idx) r.status = 'pending';
  });
  if (idx >= 6) {
    reviews.forEach((r) => {
      if (isConciergeOnlyId(r.conciergeId) && r.verdict) r.status = 'complete';
    });
    const founderStep = reviews.find((r) => r.conciergeId === 'founder');
    if (founderStep) founderStep.status = item.founderDecision ? 'complete' : 'in-review';
  }
  let founderBrief = item.founderBrief;
  if (
    idx >= 6 &&
    !founderBrief &&
    reviews.every((r) => (isConciergeOnlyId(r.conciergeId) ? r.status === 'complete' : true))
  ) {
    founderBrief = buildFounderBriefFromReviews(item.title, reviews);
  }
  return { ...item, reviews, founderBrief };
}

function refreshDashboard(store: ConciergeApprovalFlowStore): ConciergeApprovalFlowStore['dashboard'] {
  const inConcierge = store.items.filter((i) => i.currentStepIndex < 6 && !i.founderDecision).length;
  const awaitingFounder = store.items.filter((i) => i.currentStepIndex >= 6 && !i.founderDecision).length;
  const allConfidences = store.items.flatMap((i) =>
    i.reviews.filter((r) => r.confidencePct).map((r) => r.confidencePct!)
  );
  const avg =
    allConfidences.length === 0
      ? 0
      : Math.round(allConfidences.reduce((s, n) => s + n, 0) / allConfidences.length);
  return {
    ...store.dashboard,
    inConciergeReview: inConcierge,
    awaitingFounder,
    avgConfidencePct: avg,
  };
}

export function readConciergeApprovalFlowStore(): ConciergeApprovalFlowStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CONCIERGE_APPROVAL_FLOW_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ConciergeApprovalFlowStore;
    const merged = {
      ...emptyStore(),
      ...parsed,
      items: (parsed.items ?? []).map(syncItemReviews),
    };
    return { ...merged, dashboard: refreshDashboard(merged) };
  } catch {
    return emptyStore();
  }
}

export function writeConciergeApprovalFlowStore(store: ConciergeApprovalFlowStore): void {
  if (typeof window === 'undefined') return;
  const next = {
    ...store,
    dashboard: refreshDashboard(store),
    lastUpdatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONCIERGE_APPROVAL_FLOW_STORAGE_KEY, JSON.stringify(next));
}

export function bootstrapConciergeApprovalFlowStore(seed?: Partial<ConciergeApprovalFlowStore>): void {
  const existing = readConciergeApprovalFlowStore();
  if (existing.items.length > 0 && !seed) return;
  const items = (seed?.items ?? []).map(syncItemReviews);
  const first = items[0];
  writeConciergeApprovalFlowStore({
    ...emptyStore(),
    ...seed,
    items,
    selectedItemId: seed?.selectedItemId ?? first?.id ?? null,
    philosophy: seed?.philosophy ?? [...APPROVAL_PHILOSOPHY],
  });
}

export function selectApprovalItem(itemId: string): void {
  const store = readConciergeApprovalFlowStore();
  writeConciergeApprovalFlowStore({ ...store, selectedItemId: itemId });
}

export function completeConciergeReview(
  itemId: string,
  verdict: ReviewVerdict,
  reasoning: string,
  historicalComparison: string,
  confidencePct: number
): void {
  const store = readConciergeApprovalFlowStore();
  const items = store.items.map((item) => {
    if (item.id !== itemId) return item;
    const idx = item.currentStepIndex;
    if (idx >= 6) return item;
    const reviews = item.reviews.map((r, i) =>
      i === idx
        ? {
            ...r,
            status: 'complete' as const,
            verdict,
            reasoning,
            historicalComparison,
            confidencePct,
            completedAt: new Date().toISOString(),
          }
        : r
    );
    const nextIndex = idx + 1;
    let founderBrief = item.founderBrief;
    if (nextIndex >= 6) {
      founderBrief = buildFounderBriefFromReviews(item.title, reviews);
    }
    return syncItemReviews({
      ...item,
      reviews,
      currentStepIndex: nextIndex,
      founderBrief,
    });
  });
  writeConciergeApprovalFlowStore({ ...store, items });
}

export function recordFounderDecision(itemId: string, action: FounderActionId, note: string): void {
  const store = readConciergeApprovalFlowStore();
  const items = store.items.map((item) => {
    if (item.id !== itemId) return item;
    const reviews = item.reviews.map((r) =>
      r.conciergeId === 'founder'
        ? { ...r, status: 'complete' as const, completedAt: new Date().toISOString() }
        : r
    );
    return {
      ...item,
      reviews,
      founderDecision: { action, at: new Date().toISOString(), note },
    };
  });
  const approvedToday =
    action === 'approve' || action === 'publish'
      ? store.dashboard.approvedToday + 1
      : store.dashboard.approvedToday;
  writeConciergeApprovalFlowStore({
    ...store,
    items,
    lastAction: { action, at: new Date().toISOString(), note },
    dashboard: { ...store.dashboard, approvedToday },
  });
}

export function getCurrentReviewStep(item: ApprovalContentItem): ConciergeReviewStep | null {
  return item.reviews[item.currentStepIndex] ?? null;
}

export function isAwaitingFounder(item: ApprovalContentItem): boolean {
  return item.currentStepIndex >= 6 && !item.founderDecision;
}

export function getCompletedConciergeReviews(item: ApprovalContentItem): ConciergeReviewStep[] {
  return item.reviews.filter((r) => isConciergeOnlyId(r.conciergeId) && r.status === 'complete');
}
