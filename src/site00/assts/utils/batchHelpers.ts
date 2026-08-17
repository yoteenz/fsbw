import type { AsstsBatchSummary } from '../services/asstsApi';

type BatchWithCounts = Pick<AsstsBatchSummary, 'status'> & {
  counts?: Partial<AsstsBatchSummary['counts']>;
};

export function batchStatusHint(batch: BatchWithCounts): string {
  const counts = batch.counts ?? { total: 0, approved: 0, needsReview: 0 };
  if ((counts.needsReview ?? 0) > 0) return `${String(counts.needsReview).padStart(2, '0')} NEED REVIEW`;
  if (batch.status === 'LOCKED') return 'LOCKED';
  if ((counts.approved ?? 0) === (counts.total ?? 0) && (counts.total ?? 0) > 0) return 'ALL APPROVED';
  return batch.status.replace(/_/g, ' ');
}

export function batchProgressPercent(counts: { approved?: number; total?: number }): number {
  const total = counts.total ?? 0;
  const approved = counts.approved ?? 0;
  return total > 0 ? Math.round((approved / total) * 100) : 0;
}
