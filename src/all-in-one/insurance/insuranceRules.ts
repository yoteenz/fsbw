import type {
  InsurancePolicy,
  InsuranceQuoteRecord,
  InsuranceRequest,
  InsuranceRequestStatus,
} from './insuranceTypes';
import { derivePolicyStatusFromDates } from './insuranceCalculations';

export function canViewFullPolicyNumber(role: 'customer' | 'coordinator' | 'admin'): boolean {
  return role === 'coordinator' || role === 'admin';
}

export function canCustomerMarkPolicyVerified(): boolean {
  return false;
}

export function canCustomerMarkCoiIssued(): boolean {
  return false;
}

export function isPremiumAllInOneServiceRevenue(): boolean {
  return false;
}

export function canTransitionRequestStatus(from: InsuranceRequestStatus, to: InsuranceRequestStatus): boolean {
  if (from === to) return true;
  if (from === 'completed' || from === 'cancelled' || from === 'declined') return false;
  const allowed: Partial<Record<InsuranceRequestStatus, InsuranceRequestStatus[]>> = {
    draft: ['submitted', 'cancelled'],
    submitted: ['information_needed', 'internal_review', 'cancelled'],
    information_needed: ['submitted', 'internal_review', 'cancelled'],
    internal_review: ['ready_for_referral', 'information_needed', 'cancelled'],
    ready_for_referral: ['referred', 'internal_review', 'cancelled'],
    referred: ['partner_review', 'cancelled'],
    partner_review: ['quote_options_reported', 'information_needed', 'cancelled'],
    quote_options_reported: ['customer_review', 'partner_review'],
    customer_review: ['policy_selected_external', 'declined', 'partner_review'],
    policy_selected_external: ['policy_setup', 'customer_review'],
    policy_setup: ['completed', 'information_needed'],
    completed: [],
    declined: [],
    cancelled: [],
  };
  return (allowed[from] ?? []).includes(to);
}

export function isPolicyActiveForRoadReady(policy: InsurancePolicy, now = new Date()): boolean {
  const status = derivePolicyStatusFromDates(policy.expirationDate, policy.status, now);
  return (
    status === 'active' ||
    status === 'expiring_soon' ||
    (status === 'pending' && policy.verificationState === 'staff_reviewed')
  );
}

export function isQuoteSourceLegitimate(quote: InsuranceQuoteRecord): boolean {
  return quote.source !== 'future_api' || quote.status !== 'reported';
}

export function policySelectedEqualsActive(): boolean {
  return false;
}

export function brokerageInsuranceReviewNeeded(
  expirationDate: string | undefined,
  verificationState: InsurancePolicy['verificationState'],
  now = new Date(),
): boolean {
  if (!expirationDate) return verificationState === 'customer_reported';
  const status = derivePolicyStatusFromDates(expirationDate, 'active', now);
  return status === 'expiring_soon' || status === 'expired';
}
