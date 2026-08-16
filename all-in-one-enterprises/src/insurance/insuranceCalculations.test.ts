import { describe, expect, it } from 'vitest';
import { derivePolicyStatusFromDates, maskPolicyNumber, countVehicleMismatch } from './insuranceCalculations';
import {
  canCustomerMarkCoiIssued,
  canCustomerMarkPolicyVerified,
  canTransitionRequestStatus,
  isPremiumAllInOneServiceRevenue,
  policySelectedEqualsActive,
} from './insuranceRules';

describe('insuranceCalculations', () => {
  it('derives expiring soon from dates', () => {
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    const iso = in30.toISOString().slice(0, 10);
    expect(derivePolicyStatusFromDates(iso, 'active')).toBe('expiring_soon');
  });

  it('derives expired from past date', () => {
    expect(derivePolicyStatusFromDates('2020-01-01', 'active')).toBe('expired');
  });

  it('masks policy numbers', () => {
    expect(maskPolicyNumber('POL-8844821')).toBe('•••• 4821');
  });

  it('detects vehicle count mismatch', () => {
    expect(countVehicleMismatch(5, 4)).toBe(true);
    expect(countVehicleMismatch(4, 4)).toBe(false);
  });
});

describe('insurance invariants', () => {
  it('blocks customer verification actions', () => {
    expect(canCustomerMarkPolicyVerified()).toBe(false);
    expect(canCustomerMarkCoiIssued()).toBe(false);
  });

  it('keeps premium separate from service revenue', () => {
    expect(isPremiumAllInOneServiceRevenue()).toBe(false);
  });

  it('policy selected does not equal active', () => {
    expect(policySelectedEqualsActive()).toBe(false);
  });

  it('allows request transition to partner review', () => {
    expect(canTransitionRequestStatus('referred', 'partner_review')).toBe(true);
    expect(canTransitionRequestStatus('completed', 'submitted')).toBe(false);
  });
});
