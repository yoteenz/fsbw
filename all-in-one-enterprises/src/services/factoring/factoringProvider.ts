/**
 * Factoring partner abstraction — placeholder for future embedded/partner integration.
 *
 * Intended operations (not implemented in Sprint 01):
 * - checkInvoiceEligibility()
 * - checkDebtorEligibility()
 * - submitInvoice()
 * - getSubmissionStatus()
 * - getFundingStatus()
 * - getFactoringHistory()
 *
 * Do not call fake APIs or pretend to transmit financial data.
 */

import type { FactoringProvider } from './factoringTypes';

export const FACTORING_PROVIDER_NOT_CONFIGURED =
  'Factoring partner integration is not configured. Sprint 01 uses mock data only.';

/** Placeholder — throws if invoked before a real provider is wired. */
export const factoringProvider: FactoringProvider = {
  async checkInvoiceEligibility() {
    throw new Error(FACTORING_PROVIDER_NOT_CONFIGURED);
  },
  async checkDebtorEligibility() {
    throw new Error(FACTORING_PROVIDER_NOT_CONFIGURED);
  },
  async submitInvoice() {
    throw new Error(FACTORING_PROVIDER_NOT_CONFIGURED);
  },
  async getSubmissionStatus() {
    throw new Error(FACTORING_PROVIDER_NOT_CONFIGURED);
  },
  async getFundingStatus() {
    throw new Error(FACTORING_PROVIDER_NOT_CONFIGURED);
  },
  async getFactoringHistory() {
    throw new Error(FACTORING_PROVIDER_NOT_CONFIGURED);
  },
};
