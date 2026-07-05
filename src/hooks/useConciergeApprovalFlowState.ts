import { useCallback, useState } from 'react';
import { buildConciergeApprovalFlowSeed } from '../studio-os-core/concierge-approval-flow/bootstrap';
import {
  bootstrapConciergeApprovalFlowStore,
  completeConciergeReview,
  getCompletedConciergeReviews,
  getCurrentReviewStep,
  isAwaitingFounder,
  readConciergeApprovalFlowStore,
  recordFounderDecision,
  selectApprovalItem,
} from '../studio-os-core/concierge-approval-flow/store';
import type { FounderActionId, ReviewVerdict } from '../studio-os-core/concierge-approval-flow/types';

function ensureBootstrap(): void {
  bootstrapConciergeApprovalFlowStore(buildConciergeApprovalFlowSeed());
}

export function useConciergeApprovalFlowState() {
  const [, setTick] = useState(0);
  useState(() => {
    ensureBootstrap();
    return 0;
  });

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const store = readConciergeApprovalFlowStore();

  const selectedItem =
    store.items.find((i) => i.id === store.selectedItemId) ?? store.items[0] ?? null;

  const currentReview = selectedItem ? getCurrentReviewStep(selectedItem) : null;
  const completedReviews = selectedItem ? getCompletedConciergeReviews(selectedItem) : [];
  const awaitingFounder = selectedItem ? isAwaitingFounder(selectedItem) : false;

  const selectItem = useCallback(
    (id: string) => {
      selectApprovalItem(id);
      refresh();
    },
    [refresh]
  );

  const submitReview = useCallback(
    (verdict: ReviewVerdict) => {
      if (!selectedItem || selectedItem.currentStepIndex >= 6) return;
      const step = getCurrentReviewStep(selectedItem);
      if (!step) return;
      completeConciergeReview(
        selectedItem.id,
        verdict,
        `${step.title} review complete — organizational standards met for demo.`,
        'Historical comparison available in production intelligence layer.',
        85 + Math.floor(Math.random() * 10)
      );
      refresh();
    },
    [selectedItem, refresh]
  );

  const runFounderAction = useCallback(
    (action: FounderActionId, note: string) => {
      if (!selectedItem) return;
      recordFounderDecision(selectedItem.id, action, note);
      refresh();
    },
    [selectedItem, refresh]
  );

  return {
    store,
    selectedItem,
    currentReview,
    completedReviews,
    awaitingFounder,
    selectItem,
    submitReview,
    runFounderAction,
    refresh,
  };
}
