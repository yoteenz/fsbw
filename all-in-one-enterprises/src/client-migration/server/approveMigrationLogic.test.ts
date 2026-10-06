import { describe, expect, it } from 'vitest';
import { factsForCanonicalCommit, validateApproveMigration } from './approveMigrationLogic';

describe('approve migration validation', () => {
  it('blocks unresolved match', () => {
    const result = validateApproveMigration({
      batchId: 'b1',
      organizationId: 'o1',
      matchResolved: false,
      facts: [],
      batchState: 'ready_for_review',
      approvalState: 'pending',
    });
    expect(result.ok).toBe(false);
  });

  it('allows idempotent re-approve when already approved', () => {
    const result = validateApproveMigration({
      batchId: 'b1',
      organizationId: 'o1',
      matchResolved: true,
      facts: [],
      batchState: 'completed',
      approvalState: 'approved',
    });
    expect(result.ok).toBe(true);
  });

  it('commits provenance-eligible facts only', () => {
    const committed = factsForCanonicalCommit([
      {
        id: '1',
        entityType: 'company',
        fieldKey: 'legal_name',
        proposedValue: 'Summit Ridge Hauling LLC',
        existingValue: null,
        confidence: 'HIGH',
        reviewAction: 'CONFIRM',
        documentId: 'd1',
        sourceReference: 'batch/file#p1',
      },
      {
        id: '2',
        entityType: 'company',
        fieldKey: 'usdot',
        proposedValue: '123456',
        existingValue: '999999',
        confidence: 'CONFLICT',
        reviewAction: 'REJECT',
        documentId: 'd1',
        sourceReference: 'batch/file#p1',
      },
    ]);
    expect(committed).toHaveLength(1);
    expect(committed[0].fieldKey).toBe('legal_name');
  });
});
