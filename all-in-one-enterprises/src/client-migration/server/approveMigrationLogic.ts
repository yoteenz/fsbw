import type { MigrationReviewAction } from '../types';

export type ApproveFactRow = {
  id: string;
  entityType: string;
  fieldKey: string;
  proposedValue: string | null;
  existingValue: string | null;
  confidence: string;
  reviewAction: MigrationReviewAction | null;
  documentId: string | null;
  sourceReference: string | null;
};

export type ApproveMigrationInput = {
  batchId: string;
  organizationId: string;
  matchResolved: boolean;
  facts: ApproveFactRow[];
  batchState: string;
  approvalState: string;
};

export type ApproveMigrationValidation =
  | { ok: true }
  | { ok: false; error: string };

export function validateApproveMigration(input: ApproveMigrationInput): ApproveMigrationValidation {
  if (!input.matchResolved) {
    return { ok: false, error: 'Client match must be resolved before approval' };
  }
  if (input.approvalState === 'approved') {
    return { ok: true };
  }
  if (!['ready_for_review', 'reviewing', 'needs_attention'].includes(input.batchState)) {
    return { ok: false, error: 'Batch is not ready for approval' };
  }

  const unresolvedConflict = input.facts.some(
    (f) => f.confidence === 'CONFLICT' && !f.reviewAction,
  );
  if (unresolvedConflict) {
    return { ok: false, error: 'Unresolved conflicts remain' };
  }

  const approvedFacts = input.facts.filter((f) => f.reviewAction !== 'REJECT' && f.proposedValue);
  if (approvedFacts.length === 0) {
    return { ok: false, error: 'No approved facts to commit' };
  }

  return { ok: true };
}

export function factsForCanonicalCommit(facts: ApproveFactRow[]): ApproveFactRow[] {
  return facts.filter((f) => {
    if (f.reviewAction === 'REJECT') return false;
    if (!f.proposedValue?.trim()) return false;
    return true;
  });
}
