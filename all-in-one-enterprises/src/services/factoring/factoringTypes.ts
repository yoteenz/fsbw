/**
 * Factoring domain types — conceptual / partner-ready.
 * No vendor API implementation in Sprint 01.
 */

export type FactoringInvoiceStatus =
  | 'eligible'
  | 'not_eligible'
  | 'not_submitted'
  | 'submitted'
  | 'verification'
  | 'additional_documents_required'
  | 'approved'
  | 'funding_processing'
  | 'funded'
  | 'rejected'
  | 'closed';

export type FactoringDebtorEligibility = 'approved' | 'review_required' | 'not_approved' | 'credit_limit_reached';

/** Future production entities (conceptual only — no Supabase tables in Sprint 01). */
export interface FactoringAccount {
  id: string;
  carrierId: string;
}

export interface FactoringInvoice {
  id: string;
  loadNumber: string;
  debtorName: string;
  invoiceAmount: number;
  deliveryDate: string;
  eligibility: FactoringInvoiceStatus;
  status: FactoringInvoiceStatus;
  estimatedProceeds: number;
  sampleFactoringFee: number;
  sampleNetProceeds: number;
}

export interface FactoringSubmission {
  id: string;
  invoiceId: string;
  documents: FactoringDocument[];
  debtorReview?: FactoringDebtorReview;
  fundingStatus?: FactoringFundingStatus;
}

export interface FactoringDocument {
  id: string;
  label: string;
  onFile: boolean;
}

export interface FactoringDebtorReview {
  debtorName: string;
  eligibility: FactoringDebtorEligibility;
}

export interface FactoringFundingStatus {
  status: FactoringInvoiceStatus;
  label: string;
}

export interface FactoringFunding {
  id: string;
  submissionId: string;
  fundedAmount: number;
  fee: number;
  fundedDate: string;
}

export interface FactoringStatement {
  id: string;
  period: string;
  label: string;
}

/** Partner abstraction — implement when a factoring partner is selected. */
export interface FactoringProvider {
  checkInvoiceEligibility(invoiceId: string): Promise<{ eligible: boolean; reason?: string }>;
  checkDebtorEligibility(debtorId: string): Promise<{ eligibility: FactoringDebtorEligibility }>;
  submitInvoice(invoiceId: string, documentIds: string[]): Promise<{ submissionId: string }>;
  getSubmissionStatus(submissionId: string): Promise<{ status: FactoringInvoiceStatus }>;
  getFundingStatus(submissionId: string): Promise<FactoringFundingStatus>;
  getFactoringHistory(accountId: string): Promise<FactoringFunding[]>;
}
