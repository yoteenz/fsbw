/**
 * Future-facing factoring provider integration.
 * Sprint 09: interface only — no fake API implementation.
 */

import type { FactoringSubmissionStatus } from './factoringTypes';

export interface FactoringProviderRequirements {
  applicationDocuments: string[];
  submissionDocuments: string[];
}

export interface FactoringProviderAdapter {
  getRequirements(providerId: string): Promise<FactoringProviderRequirements>;
  submitApplication?(organizationId: string, payload: unknown): Promise<{ externalReference: string }>;
  submitInvoice?(submissionId: string): Promise<{ externalReference: string }>;
  getSubmissionStatus?(externalReference: string): Promise<{ status: FactoringSubmissionStatus }>;
  getFundingStatus?(externalReference: string): Promise<{
    status: FactoringSubmissionStatus;
    reportedAdvanceMinor?: number;
    reportedReserveMinor?: number;
    reportedFeeMinor?: number;
  }>;
  requestAdditionalDocument?(externalReference: string, documentKind: string): Promise<void>;
}
