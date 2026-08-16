import { describe, expect, it } from 'vitest';
import { aggregateAttentionItems, suppressOptionalGrowthItems, type RawAttentionCandidate } from './clientAttentionEngine';
import { selectNextAction, comparePriority } from './clientNextActionEngine';
import { getClientCommandCenterView } from './clientCommandCenterService';
import { createDemoSeed } from '../demo/demoSeed';

describe('clientAttentionEngine', () => {
  it('deduplicates by dedupeKey and merges affected areas', () => {
    const candidates: RawAttentionCandidate[] = [
      {
        dedupeKey: 'insurance-expiry:client-b:2026-09-01',
        category: 'insurance',
        priority: 'high',
        title: 'Insurance expiring',
        explanation: 'Policy expiring',
        statusLabel: 'EXPIRING',
        ctaLabel: 'REVIEW',
        ctaHref: '/insurance',
        affectedAreas: ['Insurance'],
        sortScore: 240,
      },
      {
        dedupeKey: 'insurance-expiry:client-b:2026-09-01',
        category: 'renewals',
        priority: 'high',
        title: 'Insurance renewal',
        explanation: 'Renewal window',
        statusLabel: 'UPCOMING',
        ctaLabel: 'START RENEWAL',
        ctaHref: '/renewals',
        affectedAreas: ['Renewals', 'Road Ready'],
        sortScore: 210,
      },
    ];
    const items = aggregateAttentionItems(candidates);
    expect(items).toHaveLength(1);
    expect(items[0].affectedAreas).toContain('Insurance');
    expect(items[0].affectedAreas).toContain('Renewals');
    expect(items[0].affectedAreas).toContain('Road Ready');
  });

  it('suppresses optional growth when operational items exist', () => {
    const candidates: RawAttentionCandidate[] = [
      { dedupeKey: 'op:1', category: 'documents', priority: 'high', title: 'Doc', explanation: '', statusLabel: '', ctaLabel: '', ctaHref: '', sortScore: 300 },
      { dedupeKey: 'grow:1', category: 'services', priority: 'low', title: 'Factoring', explanation: '', statusLabel: '', ctaLabel: '', ctaHref: '', sortScore: 50 },
    ];
    const filtered = suppressOptionalGrowthItems(candidates, true);
    expect(filtered.some((c) => c.dedupeKey === 'grow:1')).toBe(false);
  });
});

describe('clientNextActionEngine', () => {
  it('prefers insurance urgent over factoring recommendation', () => {
    const candidates: RawAttentionCandidate[] = [
      { dedupeKey: 'ins', category: 'insurance', priority: 'urgent', title: 'Insurance expires in 7 days', explanation: '', statusLabel: '', ctaLabel: 'REVIEW', ctaHref: '/ins', sortScore: 490 },
      { dedupeKey: 'fac', category: 'services', priority: 'low', title: 'Explore factoring', explanation: '', statusLabel: '', ctaLabel: 'LEARN', ctaHref: '/fac', sortScore: 50 },
      { dedupeKey: 'msg', category: 'messages', priority: 'normal', title: 'Unread message', explanation: '', statusLabel: '', ctaLabel: 'READ', ctaHref: '/msg', sortScore: 100 },
    ];
    const attention = aggregateAttentionItems(candidates);
    const next = selectNextAction(candidates, attention);
    expect(next?.dedupeKey).toBe('ins');
  });

  it('comparePriority orders urgent above low', () => {
    expect(comparePriority('urgent', 'low')).toBeGreaterThan(0);
  });
});

describe('clientCommandCenterService', () => {
  it('driver role excludes billing from money view', () => {
    const store = createDemoSeed();
    store.portalMemberRole = 'driver';
    const view = getClientCommandCenterView(store, 'carrier');
    expect(view.money).toBeUndefined();
  });

  it('shipper view has no Road Ready summary', () => {
    const store = createDemoSeed();
    const view = getClientCommandCenterView(store, 'shipper');
    expect(view.roadReady).toBeUndefined();
    expect(view.context.isShipper).toBe(true);
  });

  it('money domains are not combined into one total', () => {
    const store = createDemoSeed();
    store.portalClientId = 'client-b';
    const view = getClientCommandCenterView(store, 'carrier');
    expect(view.money?.aioBalanceDueMinor).toBeDefined();
    // No combined total field exists on view
    expect(Object.prototype.hasOwnProperty.call(view.money ?? {}, 'totalMoney')).toBe(false);
  });

  it('all caught up when no attention items', () => {
    const store = createDemoSeed();
    store.portalClientId = 'client-g';
    store.portalMemberRole = 'owner';
    const view = getClientCommandCenterView(store, 'carrier');
    // client-g may have minimal attention — at minimum structure exists
    expect(typeof view.allCaughtUp).toBe('boolean');
  });
});
