import type { FounderReviewInput, FounderReviewItem, MemoryExtractionReport } from './types';
import {
  appendExtractionReport,
  readMemorySystemStore,
  removeReviewItem,
  upsertReviewItem,
} from './store';

const ISO = () => new Date().toISOString();

/**
 * Layer 3 — Founder Review™ / Architect Review™
 * Approval queue. Nothing enters Knowledge Core until founder acts.
 */
export function enqueueForFounderReview(report: MemoryExtractionReport): FounderReviewItem {
  const item: FounderReviewItem = {
    id: `review-${report.id}`,
    extractionReportId: report.id,
    conversationId: report.sourceConversationId,
    title: report.title,
    status: 'Awaiting Founder Review',
    queuedAt: ISO(),
    itemsAwaitingApproval: report.itemsAwaitingApproval,
  };
  return upsertReviewItem(item);
}

export function getApprovalQueue(): FounderReviewItem[] {
  return readMemorySystemStore().reviewQueue.filter(
    (r) => r.status === 'Awaiting Founder Review' || r.status === 'Delayed'
  );
}

export function getReviewItem(id: string): FounderReviewItem | null {
  return readMemorySystemStore().reviewQueue.find((r) => r.id === id) ?? null;
}

export function listAllReviewItems(): FounderReviewItem[] {
  return readMemorySystemStore().reviewQueue;
}

function mapActionToStatus(
  action: FounderReviewInput['action']
): MemoryExtractionReport['status'] {
  switch (action) {
    case 'Approve':
      return 'Approved';
    case 'Modify':
      return 'Modified';
    case 'Reject':
      return 'Rejected';
    case 'Merge':
      return 'Merged';
    case 'Delay':
      return 'Delayed';
  }
}

export function processFounderReview(input: FounderReviewInput): {
  reviewItem: FounderReviewItem;
  report: MemoryExtractionReport;
  shouldPublish: boolean;
} {
  const store = readMemorySystemStore();
  const reviewItem = store.reviewQueue.find((r) => r.id === input.reviewItemId);
  if (!reviewItem) throw new Error(`Review item not found: ${input.reviewItemId}`);

  const report = store.extractionReports.find((r) => r.id === reviewItem.extractionReportId);
  if (!report) throw new Error(`Extraction report not found: ${reviewItem.extractionReportId}`);

  const status = mapActionToStatus(input.action);
  const now = ISO();

  let proposedEntries = [...report.proposedEntries];
  if (input.modifications?.length) {
    proposedEntries = proposedEntries.map((entry, idx) => ({
      ...entry,
      ...(input.modifications![idx] ?? {}),
    }));
  }

  const updatedReport: MemoryExtractionReport = {
    ...report,
    status,
    proposedEntries,
    reviewedAt: now,
    reviewAction: input.action,
    reviewNotes: input.notes,
  };

  appendExtractionReport(updatedReport);

  const updatedReview: FounderReviewItem = {
    ...reviewItem,
    status,
    itemsAwaitingApproval:
      input.action === 'Reject' ? [] : updatedReport.itemsAwaitingApproval,
  };

  if (input.action === 'Delay') {
    upsertReviewItem(updatedReview);
  } else {
    removeReviewItem(reviewItem.id);
  }

  const shouldPublish = input.action === 'Approve' || input.action === 'Modify' || input.action === 'Merge';

  return { reviewItem: updatedReview, report: updatedReport, shouldPublish };
}

export function getPendingReviewCount(): number {
  return getApprovalQueue().length;
}
