import { isFactoringHandoffReady } from '../dispatch/dispatchRules';
import type { Load } from '../dispatch/dispatchTypes';
import type {
  FactoringProfile,
  FactoringReadinessState,
  FactoringSubmission,
  FactoringSubmissionStatus,
  FreightInvoice,
  PackageReadinessItem,
} from './factoringTypes';

export interface FactoringReadinessResult {
  state: FactoringReadinessState;
  items: PackageReadinessItem[];
  loadComplete: boolean;
  handoffReady: boolean;
}

export function evaluateLoadFactoringReadiness(
  load: Load,
  freightInvoice?: FreightInvoice,
  requireBol = false,
): FactoringReadinessResult {
  const loadComplete = load.operationalStatus === 'complete';
  const handoffReady = isFactoringHandoffReady(load);
  const items: PackageReadinessItem[] = [
    { kind: 'Load Complete', met: loadComplete },
    {
      kind: 'Rate Confirmation',
      met: Boolean(load.rateConfirmationDocumentId) || load.rateDetailsReviewed,
      documentId: load.rateConfirmationDocumentId,
    },
    { kind: 'POD', met: Boolean(load.podDocumentId), documentId: load.podDocumentId },
    {
      kind: 'BOL',
      met: !requireBol || Boolean(load.bolDocumentId),
      documentId: load.bolDocumentId,
    },
    { kind: 'Broker/Debtor Known', met: Boolean(load.brokerName?.trim()) },
    { kind: 'Confirmed Gross', met: load.confirmedGrossMinor > 0 },
    { kind: 'Freight Invoice', met: Boolean(freightInvoice) },
  ];

  if (!loadComplete) {
    return { state: 'not_ready', items, loadComplete, handoffReady: false };
  }
  if (!load.podDocumentId) {
    return { state: 'missing_documents', items, loadComplete, handoffReady: false };
  }
  if (!handoffReady) {
    return { state: 'missing_documents', items, loadComplete, handoffReady: false };
  }
  if (!freightInvoice) {
    return { state: 'ready', items, loadComplete, handoffReady: true };
  }
  return { state: 'ready', items, loadComplete, handoffReady: true };
}

export function evaluatePackageReadiness(
  load: Load,
  freightInvoice?: FreightInvoice,
): PackageReadinessItem[] {
  return evaluateLoadFactoringReadiness(load, freightInvoice).items;
}

export function isPackageComplete(load: Load, freightInvoice?: FreightInvoice): boolean {
  const { items, handoffReady } = evaluateLoadFactoringReadiness(load, freightInvoice);
  return handoffReady && items.filter((i) => i.kind !== 'Freight Invoice').every((i) => i.met) && Boolean(freightInvoice);
}

export function detectAmountMismatch(load: Load, freightInvoice: FreightInvoice): boolean {
  return freightInvoice.amountMinor !== load.confirmedGrossMinor;
}

export function findDuplicateSubmission(
  freightInvoiceId: string,
  submissions: FactoringSubmission[],
  excludeId?: string,
): FactoringSubmission | undefined {
  const active: FactoringSubmissionStatus[] = [
    'draft',
    'documents_needed',
    'ready',
    'submitted',
    'provider_review',
    'additional_information_needed',
    'approved',
    'funding_pending',
    'funded',
  ];
  return submissions.find(
    (s) =>
      s.freightInvoiceId === freightInvoiceId &&
      s.id !== excludeId &&
      active.includes(s.status),
  );
}

export function canTransitionSubmissionStatus(
  from: FactoringSubmissionStatus,
  to: FactoringSubmissionStatus,
): boolean {
  if (from === to) return true;
  if (from === 'funded') return false;
  if (to === 'draft' && from !== 'draft' && from !== 'cancelled') return false;
  const allowed: Partial<Record<FactoringSubmissionStatus, FactoringSubmissionStatus[]>> = {
    draft: ['documents_needed', 'ready', 'cancelled'],
    documents_needed: ['ready', 'draft', 'cancelled'],
    ready: ['submitted', 'documents_needed', 'cancelled'],
    submitted: ['provider_review', 'additional_information_needed', 'declined', 'cancelled'],
    provider_review: ['additional_information_needed', 'approved', 'declined', 'cancelled'],
    additional_information_needed: ['provider_review', 'submitted', 'cancelled'],
    approved: ['funding_pending', 'declined', 'cancelled'],
    funding_pending: ['funded', 'declined', 'disputed'],
    funded: ['closed'],
    declined: ['closed', 'draft'],
    disputed: ['provider_review', 'closed'],
    cancelled: ['closed'],
    closed: [],
  };
  return (allowed[from] ?? []).includes(to);
}

export function isSubmissionFundedLocked(submission: FactoringSubmission): boolean {
  return submission.status === 'funded' || submission.status === 'closed';
}

export function canEditSubmissionFinancials(submission: FactoringSubmission): boolean {
  return !isSubmissionFundedLocked(submission);
}

export function canCreateFreightInvoice(load: Load): boolean {
  return load.operationalStatus === 'complete' && load.confirmedGrossMinor > 0;
}

export function isFactoringActive(profile?: FactoringProfile): boolean {
  return profile != null && ['active', 'approved'].includes(profile.enrollmentStatus);
}
