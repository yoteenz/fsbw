import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../../../src/demo/demoSeed';
import { buildRoadReadyItems, createEmptyProfile } from '../../../src/road-ready/roadReadyRules';

describe('Cross-domain integration readiness', () => {
  it('Road Ready derives requirements from organization profile (intake handoff target)', () => {
    const store = createDemoSeed();
    const orgId = store.clients[0]?.id ?? 'client-a';
    const profile = createEmptyProfile(orgId, 'AIO QA Integration LLC');
    profile.business.legalName = 'AIO QA Integration LLC';
    profile.operating.scope = 'interstate';
    const items = buildRoadReadyItems(profile, []);
    expect(items.length).toBeGreaterThan(0);
  });

  it('brokerage financial records exist separately from client invoices', () => {
    const store = createDemoSeed();
    expect(store.brokerageLoadFinancials.length).toBeGreaterThan(0);
    expect(store.invoices.some((i) => i.organizationId === 'client-a')).toBe(true);
  });
});
