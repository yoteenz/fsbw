import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { convertLeadToCustomer } from '../crm/conversionEngine';
import { commitApprovedMigration } from './services/migrationCommitService';
import { fixtureMigrationPipelineAdapter } from './migrationPipeline/fixtureAdapter';
import { countActiveClients } from './activeClientMetrics';
import { isActiveClient } from './lifecycle';
import {
  confirmAndActivateClient,
  recordReviewSectionResponse,
} from './services/clientActivationService';
import { createActivationInvite, redeemActivationInvite } from './services/activationInviteService';
import type { DemoStore } from '../demo/demoTypes';

describe('client migration lifecycle', () => {
  it('CRM conversion creates PREBUILT pending client — not ACTIVE', () => {
    let store = createDemoSeed();
    const { store: next, result } = convertLeadToCustomer(store, 'lead-g', 'opp-g', 'staff-2');
    store = next;
    const client = store.clients.find((c) => c.id === result.organizationId);
    expect(client?.accountStatus).toBe('pending');
    expect(client?.clientLifecycle).toBe('PREBUILT');
    expect(isActiveClient({ clientLifecycle: client!.clientLifecycle!, activationConditions: client!.activationConditions })).toBe(false);
  });

  it('approve migration commit is idempotent and sets PREBUILT not ACTIVE', () => {
    let store = createDemoSeed();
    const batchId = 'batch-test-1';
    store.archiveMigrationBatches = [
      {
        id: batchId,
        organizationId: 'client-a',
        clientId: 'client-a',
        createdByStaffId: 'staff-2',
        state: 'ready_for_review',
        reviewState: 'pending',
        approvalState: 'pending',
        fileCount: 1,
        documentCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    store.clientExtractedFacts = [
      {
        id: 'fact-1',
        batchId,
        organizationId: 'client-a',
        entityType: 'company',
        fieldKey: 'legal_name',
        proposedValue: 'Summit Ridge Hauling LLC',
        confidence: 'HIGH',
        createdAt: new Date().toISOString(),
      },
    ];
    commitApprovedMigration(store, batchId, 'staff-2');
    commitApprovedMigration(store, batchId, 'staff-2');
    const client = store.clients.find((c) => c.id === 'client-a');
    expect(client?.clientLifecycle).toBe('PREBUILT');
    expect(isActiveClient({ clientLifecycle: client?.clientLifecycle ?? 'KNOWN_UNMIGRATED', activationConditions: client?.activationConditions })).toBe(false);
  });

  it('fixture pipeline never auto-commits and can flag ambiguous match', async () => {
    const result = await fixtureMigrationPipelineAdapter.processFile(
      {
        fileName: 'ambiguous-match-fixture.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 100,
        sha256: 'abc',
      },
      { organizationId: 'client-a', batchId: 'b1' },
    );
    expect(result.stage).toBe('REVIEW_REQUIRED');
    expect(result.exception).toBe('AMBIGUOUS_CLIENT_MATCH');
    expect(result.proposedFacts.length).toBeGreaterThan(0);
  });

  it('activation requires confirmation — ACTIVE only after confirm', async () => {
    let store: DemoStore = createDemoSeed();
    const orgId = 'client-a';
    const client = store.clients.find((c) => c.id === orgId)!;
    client.clientLifecycle = 'PREBUILT';
    client.accountStatus = 'pending';
    client.activationConditions = {
      canonicalIdentityExists: true,
      reviewOrIntakeComplete: true,
      officeProvisioningSucceeded: true,
      authIdentityLinked: true,
      invitationCompleted: true,
    };

    const { store: invited, rawToken } = await createActivationInvite(store, orgId, client.contactEmail, 'staff-2');
    store = invited;
    const redeemed = await redeemActivationInvite(store, rawToken);
    store = redeemed.store;
    expect(store.clients.find((c) => c.id === orgId)?.clientLifecycle).toBe('CLIENT_CONFIRMATION_REQUIRED');

    for (const section of ['COMPANY', 'PEOPLE', 'VEHICLES', 'ACTIVE_SERVICES'] as const) {
      store = recordReviewSectionResponse(store, orgId, section, 'LOOKS_RIGHT');
    }

    const activated = confirmAndActivateClient(store, orgId);
    expect(activated.error).toBeUndefined();
    const activeClient = activated.store.clients.find((c) => c.id === orgId)!;
    expect(activeClient.clientLifecycle).toBe('ACTIVE');
    expect(isActiveClient({ clientLifecycle: activeClient.clientLifecycle!, activationConditions: activeClient.activationConditions })).toBe(true);
  });

  it('active client count excludes PREBUILT', () => {
    const store = createDemoSeed();
    const activeOnly = countActiveClients(store.clients);
    expect(activeOnly).toBeLessThan(store.clients.length);
    expect(activeOnly).toBe(store.clients.filter((c) => c.clientLifecycle === 'ACTIVE').length);
  });
});
