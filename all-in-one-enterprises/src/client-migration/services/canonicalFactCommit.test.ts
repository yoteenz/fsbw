import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../../demo/demoSeed';
import { commitApprovedMigration } from './migrationCommitService';

describe('canonical fact commit (demo)', () => {
  it('writes approved legal name and USDOT into Road Ready on PREBUILT commit', () => {
    const store = createDemoSeed();
    const batchId = 'batch-canonical-1';
    const orgId = 'client-a';
    const at = new Date().toISOString();
    store.archiveMigrationBatches = [
      {
        id: batchId,
        organizationId: orgId,
        clientId: orgId,
        createdByStaffId: 'staff-2',
        state: 'ready_for_review',
        reviewState: 'pending',
        approvalState: 'pending',
        fileCount: 1,
        documentCount: 1,
        createdAt: at,
        updatedAt: at,
      },
    ];
    store.clientExtractedFacts = [
      {
        id: 'f1',
        batchId,
        organizationId: orgId,
        entityType: 'company',
        fieldKey: 'legal_name',
        proposedValue: 'NORTHLINE HAULING LLC',
        confidence: 'HIGH',
        reviewAction: 'CONFIRM',
        createdAt: at,
      },
      {
        id: 'f2',
        batchId,
        organizationId: orgId,
        entityType: 'company',
        fieldKey: 'usdot',
        proposedValue: '4829103',
        confidence: 'HIGH',
        reviewAction: 'CONFIRM',
        createdAt: at,
      },
    ];

    commitApprovedMigration(store, batchId, 'staff-2');
    const profile = store.roadReadyProfiles?.find((p) => p.organizationId === orgId);
    expect(profile?.business.legalName).toBe('NORTHLINE HAULING LLC');
    expect(profile?.authority.usdotNumber).toBe('4829103');
    expect(store.clients.find((c) => c.id === orgId)?.companyName).toBe('NORTHLINE HAULING LLC');
  });
});
