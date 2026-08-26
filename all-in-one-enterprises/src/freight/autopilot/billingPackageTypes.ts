export type BillingPackageStatus =
  | 'draft'
  | 'missing_documents'
  | 'ready'
  | 'invoice_generated'
  | 'factoring_routed'
  | 'settlement_pending'
  | 'bookkeeping_pending'
  | 'closed';

export type ReceivableRoute = 'direct' | 'factoring' | 'undecided';

export interface BillingPackage {
  id: string;
  loadId: string;
  organizationId: string;
  shipperOrganizationId?: string;
  invoiceId?: string;
  shipperInvoiceId?: string;
  freightInvoiceId?: string;
  documentIds: string[];
  status: BillingPackageStatus;
  receivableRoute: ReceivableRoute;
  factoringStatus?: 'not_ready' | 'missing_documents' | 'ready' | 'submitted' | 'accepted' | 'rejected' | 'funded';
  receivableStatus?: 'pending' | 'invoiced' | 'sent' | 'paid';
  settlementStatus?: 'pending_documents' | 'ready_for_review' | 'approved' | 'scheduled' | 'paid' | 'disputed';
  bookkeepingStatus?: 'pending' | 'handed_off' | 'closed';
  idempotencyKey: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export function billingPackageIdempotencyKey(loadId: string): string {
  return `billing-package:${loadId}`;
}
