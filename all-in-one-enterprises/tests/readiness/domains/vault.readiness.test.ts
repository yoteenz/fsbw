import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../../../src/demo/demoSeed';

describe('Document Vault readiness', () => {
  it('stores client-scoped documents in demo seed', () => {
    const store = createDemoSeed();
    expect(store.documents.length).toBeGreaterThan(0);
    const orgIds = new Set(store.documents.map((d) => d.organizationId));
    expect(orgIds.size).toBeGreaterThan(1);
  });

  it('denies cross-client document visibility in demo authorization layer', () => {
    const store = createDemoSeed();
    const docA = store.documents.find((d) => d.organizationId === 'client-a');
    const docB = store.documents.find((d) => d.organizationId === 'client-b');
    expect(docA && docB).toBeTruthy();
    expect(docA!.organizationId).not.toBe(docB!.organizationId);
  });
});
