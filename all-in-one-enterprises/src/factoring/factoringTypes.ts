import type { CurrencyCode } from '../billing/money';

export type FactoringServiceMode =
  | 'factoring_assistance'
  | 'partner_factoring'
  | 'direct_factoring_future';

export type FactoringEnrollmentStatus =
  | 'not_enrolled'
  | 'interested'
  | 'application_started'
  | 'documents_needed'
  | 'under_review'
  | 'partner_review'
  | 'approved'
  | 'active'
  | 'declined'
  | 'paused'
  | 'ended';

export type FactoringProviderStatus = 'prospective' | 'approved_partner' | 'carrier_existing_provider' | 'inactive';

export type FactoringSubmissionMethod = 'manual_portal' | 'email' | 'api_future' | 'other';

export type TermVerification = 'self_reported' | 'documented' | 'staff_reviewed' | 'provider_confirmed_future';

export type RecourseType = 'recourse' | 'non_recourse' | 'modified' | 'unknown';

export type FactoringReadinessState =
  | 'not_ready'
  | 'missing_documents'
  | 'ready'
  | 'submitted'
  | 'processing'
  | 'resolved';

export type FreightInvoiceStatus = 'draft' | 'issued' | 'void' | 'paid_future';

export type FactoringSubmissionStatus =
  | 'draft'
  | 'documents_needed'
  | 'ready'
  | 'submitted'
  | 'provider_review'
  | 'additional_information_needed'
  | 'approved'
  | 'funding_pending'
  | 'funded'
  | 'declined'
  | 'disputed'
  | 'cancelled'
  | 'closed';

export type FactoringIssueType =
  | 'missing_pod'
  | 'missing_rate_confirmation'
  | 'invoice_amount_mismatch'
  | 'debtor_info_needed'
  | 'provider_additional_info'
  | 'duplicate_invoice'
  | 'submission_rejected'
  | 'funding_delay'
  | 'rate_dispute'
  | 'document_quality'
  | 'other';

export type FactoringIssueStatus = 'open' | 'waiting_on_carrier' | 'waiting_on_provider' | 'under_review' | 'resolved';

export type DebtorVerificationStatus = 'unverified' | 'carrier_provided' | 'staff_reviewed' | 'provider_verified_future';

export interface FactoringProvider {
  id: string;
  name: string;
  providerType: 'partner' | 'external' | 'demo';
  contactName?: string;
  phone?: string;
  email?: string;
  websiteReference?: string;
  submissionMethod: FactoringSubmissionMethod;
  status: FactoringProviderStatus;
  internalNotes?: string;
  integrationType?: 'manual' | 'api_future';
  createdAt: string;
  updatedAt: string;
}

export interface FactoringProfile {
  id: string;
  organizationId: string;
  enrollmentStatus: FactoringEnrollmentStatus;
  serviceMode: FactoringServiceMode;
  providerId?: string;
  providerAccountReference?: string;
  hasExistingFactor?: boolean;
  existingProviderName?: string;
  recourseType?: RecourseType;
  advanceRateBasisPoints?: number;
  factoringFeeBasisPoints?: number;
  reserveBasisPoints?: number;
  termVerification?: TermVerification;
  primarySpecialistStaffId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtorAccount {
  id: string;
  organizationId: string;
  brokerContactId?: string;
  legalName: string;
  dba?: string;
  mcNumber?: string;
  contactName?: string;
  billingEmail?: string;
  billingAddress?: string;
  verificationStatus: DebtorVerificationStatus;
  internalNotes?: string;
  createdAt: string;
}

export interface FreightInvoice {
  id: string;
  organizationId: string;
  loadId: string;
  invoiceNumber: string;
  debtorName: string;
  debtorReference?: string;
  amountMinor: number;
  currency: CurrencyCode;
  invoiceDate: string;
  dueDate?: string;
  status: FreightInvoiceStatus;
  rateConfirmationDocumentId?: string;
  bolDocumentId?: string;
  podDocumentId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface FactoringSubmissionTimelineEvent {
  id: string;
  submissionId: string;
  label: string;
  status?: FactoringSubmissionStatus;
  actor?: 'carrier' | 'specialist' | 'system';
  note?: string;
  createdAt: string;
  visibility: 'customer' | 'internal';
}

export interface FactoringSubmission {
  id: string;
  organizationId: string;
  loadId: string;
  freightInvoiceId: string;
  providerId: string;
  status: FactoringSubmissionStatus;
  submittedAmountMinor: number;
  approvedAmountMinor?: number;
  reportedAdvanceMinor?: number;
  reportedReserveMinor?: number;
  reportedFeeMinor?: number;
  currency: CurrencyCode;
  externalReference?: string;
  issueReason?: string;
  assignedSpecialistStaffId?: string;
  packageDocumentIds: string[];
  submittedAt?: string;
  approvedAt?: string;
  fundedAt?: string;
  timeline: FactoringSubmissionTimelineEvent[];
  createdByStaffId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface FactoringIssue {
  id: string;
  organizationId: string;
  submissionId?: string;
  loadId?: string;
  type: FactoringIssueType;
  status: FactoringIssueStatus;
  summary: string;
  customerActionRequired: boolean;
  notes?: string;
  createdByStaffId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface FactoringCounters {
  freightInvoice: number;
  submission: number;
}

export interface PackageReadinessItem {
  kind: string;
  met: boolean;
  documentId?: string;
}
