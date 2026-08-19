import { describe, expect, it } from 'vitest';
import { BOOKKEEPING_PLANS, BOOKKEEPING_PLAN_ORDER } from '../../../src/bookkeeping/bookkeepingPlans';

describe('Bookkeeping readiness', () => {
  it('defines package entitlements for multiple tiers', () => {
    expect(BOOKKEEPING_PLAN_ORDER.length).toBeGreaterThanOrEqual(3);
  });

  it('tier order progresses ESSENTIALS → PLUS → ALL_IN_ONE', () => {
    expect(BOOKKEEPING_PLAN_ORDER).toEqual(['ESSENTIALS', 'PLUS', 'ALL_IN_ONE']);
    expect(BOOKKEEPING_PLANS.PLUS.monthlyStartingPriceMinor).toBeGreaterThan(
      BOOKKEEPING_PLANS.ESSENTIALS.monthlyStartingPriceMinor,
    );
  });
});
