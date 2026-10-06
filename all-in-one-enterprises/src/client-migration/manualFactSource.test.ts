import { describe, expect, it } from 'vitest';
import {
  formatManualFactSourceReference,
  isManualFactSource,
  provenanceForFactSource,
} from './manualFactSource';

describe('manual fact source encoding', () => {
  it('formats MANUAL_REVIEW source reference with staff and file', () => {
    const ref = formatManualFactSourceReference({
      batchFileId: 'file-1',
      enteredByUserId: 'staff-uuid',
      enteredAt: '2026-10-06T00:00:00.000Z',
    });
    expect(ref.startsWith('MANUAL_REVIEW|')).toBe(true);
    expect(isManualFactSource(ref)).toBe(true);
    expect(provenanceForFactSource(ref)).toBe('MANUAL_REVIEW');
  });

  it('maps extraction sources to MIGRATION_APPROVED provenance', () => {
    expect(provenanceForFactSource('batch/file#p1')).toBe('MIGRATION_APPROVED');
  });
});
