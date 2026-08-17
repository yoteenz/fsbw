import { describe, expect, it, beforeEach } from 'vitest';
import { demoBusinessNameRegistryAdapter } from './adapters/demoAdapter';
import { unsupportedStateRegistryAdapter } from './adapters/unsupportedAdapter';
import { normalizeBusinessNameForLookup, buildNameCheckFingerprint } from './normalize';
import {
  isNameCheckStale,
  invalidateNameCheckOnInputChange,
  shouldRecheckBeforeSubmit,
  buildResultFromResponse,
} from './staleLogic';
import { checkBusinessNameAvailability, resetBusinessNameLookupCache } from './registryService';
import { getStateRegistryCapability, resolveEffectiveLookupMethod } from './stateCapabilities';
import {
  checkBusinessNameRateLimit,
  resetBusinessNameRateLimitBuckets,
  validateBusinessNameCheckBody,
} from './server/rateLimit';
import type { BusinessNameCheckResult } from './types';

describe('normalizeBusinessNameForLookup', () => {
  it('trims and collapses spaces without changing stored raw value semantics', () => {
    expect(normalizeBusinessNameForLookup('  Perfect   Choice   LLC  ')).toBe('PERFECT CHOICE');
  });

  it('uppercases for lookup', () => {
    expect(normalizeBusinessNameForLookup('acme inc')).toBe('ACME');
  });
});

describe('stale invalidation', () => {
  const baseResult: BusinessNameCheckResult = buildResultFromResponse({
    businessNameRaw: 'Acme LLC',
    businessNameNormalized: 'ACME',
    formationState: 'TN',
    entityStructure: 'llc',
    status: 'likely_available',
    source: 'demo',
    checkedAt: new Date().toISOString(),
    matchCount: 0,
    topMatches: [],
    manualReviewRequired: false,
  });

  it('marks stale when business name changes', () => {
    const next = invalidateNameCheckOnInputChange(baseResult, {
      businessNameRaw: 'Other LLC',
      formationState: 'TN',
      entityStructure: 'llc',
    });
    expect(next?.status).toBe('stale_result');
  });

  it('marks stale when formation state changes', () => {
    const next = invalidateNameCheckOnInputChange(baseResult, {
      businessNameRaw: 'Acme LLC',
      formationState: 'GA',
      entityStructure: 'llc',
    });
    expect(next?.status).toBe('stale_result');
  });

  it('requires recheck before submit when stale', () => {
    expect(
      shouldRecheckBeforeSubmit(baseResult, {
        businessNameRaw: 'Other LLC',
        formationState: 'TN',
      }),
    ).toBe(true);
  });

  it('expires after TTL', () => {
    const old = {
      ...baseResult,
      checkedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    };
    expect(isNameCheckStale(old, { businessNameRaw: 'Acme LLC', formationState: 'TN', entityStructure: 'llc' })).toBe(true);
  });
});

describe('demo adapter scenarios', () => {
  beforeEach(() => resetBusinessNameLookupCache());

  it('returns likely available for demo keyword', async () => {
    const res = await demoBusinessNameRegistryAdapter.check({
      state: 'TN',
      businessName: 'Demo Available Trucking LLC',
      demoMode: true,
    });
    expect(res.status).toBe('likely_available');
  });

  it('returns possible conflict for perfect choice pattern', async () => {
    const res = await demoBusinessNameRegistryAdapter.check({
      state: 'TN',
      businessName: 'Perfect Choice Inc',
      demoMode: true,
    });
    expect(res.status).toBe('possible_conflict');
    expect(res.topMatches.length).toBeGreaterThan(0);
  });

  it('returns exact conflict for demo exact keyword', async () => {
    const res = await demoBusinessNameRegistryAdapter.check({
      state: 'TN',
      businessName: 'Demo Conflict Exact LLC',
      demoMode: true,
    });
    expect(res.status).toBe('unavailable');
  });

  it('returns manual review for demo manual keyword', async () => {
    const res = await demoBusinessNameRegistryAdapter.check({
      state: 'TN',
      businessName: 'Demo Manual Review LLC',
      demoMode: true,
    });
    expect(res.status).toBe('manual_review_required');
    expect(res.manualReviewRequired).toBe(true);
  });

  it('returns error for demo error keyword', async () => {
    const res = await demoBusinessNameRegistryAdapter.check({
      state: 'TN',
      businessName: 'Demo Error LLC',
      demoMode: true,
    });
    expect(res.status).toBe('error');
  });
});

describe('unsupported states', () => {
  it('returns lookup_unavailable for unsupported state in production path', async () => {
    const res = await unsupportedStateRegistryAdapter.check({
      state: 'CA',
      businessName: 'California Co',
    });
    expect(res.status).toBe('lookup_unavailable');
    expect(res.manualReviewRequired).toBe(true);
  });

  it('uses demo adapter in demo mode via registry service', async () => {
    const res = await checkBusinessNameAvailability({
      state: 'TN',
      businessName: 'Unique Brand LLC',
      demoMode: true,
    });
    expect(res.status).toBe('likely_available');
  });
});

describe('state capabilities', () => {
  it('marks TN as provider-backed when configured', () => {
    const cap = getStateRegistryCapability('TN');
    expect(cap.automatedLookupSupported).toBe(true);
    expect(resolveEffectiveLookupMethod('TN', true)).toBe('demo');
  });

  it('falls back to none without provider in production', () => {
    expect(resolveEffectiveLookupMethod('TN', false)).toBe('none');
  });
});

describe('server validation and rate limit', () => {
  beforeEach(() => resetBusinessNameRateLimitBuckets());

  it('rejects invalid state', () => {
    const parsed = validateBusinessNameCheckBody({ state: 'Tennessee', businessName: 'Acme' });
    expect(parsed.ok).toBe(false);
  });

  it('accepts valid payload', () => {
    const parsed = validateBusinessNameCheckBody({ state: 'TN', businessName: 'Acme LLC' });
    expect(parsed.ok).toBe(true);
  });

  it('rate limits repeated requests', () => {
    const key = 'test-ip';
    for (let i = 0; i < 30; i++) {
      expect(checkBusinessNameRateLimit(key).allowed).toBe(true);
    }
    expect(checkBusinessNameRateLimit(key).allowed).toBe(false);
  });
});

describe('fingerprint stability', () => {
  it('matches normalized inputs', () => {
    const a = buildNameCheckFingerprint({ businessNameRaw: ' Acme LLC ', formationState: 'tn', entityStructure: 'llc' });
    const b = buildNameCheckFingerprint({ businessNameRaw: 'Acme LLC', formationState: 'TN', entityStructure: 'llc' });
    expect(a).toBe(b);
  });
});
