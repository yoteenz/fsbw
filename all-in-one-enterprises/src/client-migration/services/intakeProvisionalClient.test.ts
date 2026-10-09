import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../../demo/demoSeed';
import { createProvisionalIntakeClient, applyExtractedIdentityHints } from './intakeProvisionalClient';

describe('provisional intake client', () => {
  it('creates a client without a pre-entered company name', () => {
    const store = createDemoSeed();
    const { store: next, clientId } = createProvisionalIntakeClient(store, 'staff-2');
    const client = next.clients.find((c) => c.id === clientId);
    expect(client?.clientLifecycle).toBe('INTAKE_IN_PROGRESS');
    expect(client?.companyName).toContain('pending');
  });

  it('updates provisional name from extracted legal_name fact', () => {
    const store = createDemoSeed();
    const { clientId } = createProvisionalIntakeClient(store, 'staff-2');
    const batchId = 'b-prov';
    store.clientExtractedFacts = [
      {
        id: 'f1',
        batchId,
        organizationId: clientId,
        entityType: 'company',
        fieldKey: 'legal_name',
        proposedValue: 'NORTHLINE HAULING LLC',
        confidence: 'HIGH',
        createdAt: new Date().toISOString(),
      },
    ];
    applyExtractedIdentityHints(store, clientId, batchId);
    expect(store.clients.find((c) => c.id === clientId)?.companyName).toBe('NORTHLINE HAULING LLC');
  });
});
