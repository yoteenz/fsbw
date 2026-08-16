import type { CurrencyCode } from './money';

export type PricingMode =
  | 'fixed'
  | 'starting_at'
  | 'quote_required'
  | 'variable'
  | 'government_fee_only'
  | 'consultation'
  | 'custom';

export type FeeCategory = 'service_fee' | 'government_fee' | 'third_party_fee' | 'discount' | 'tax';

export type AmountStatus = 'known' | 'estimated' | 'pending';

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'revised'
  | 'converted';

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'partially_paid'
  | 'paid'
  | 'past_due'
  | 'void'
  | 'refunded'
  | 'partially_refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type BillingStatus =
  | 'no_payment_required'
  | 'quote_needed'
  | 'awaiting_quote_acceptance'
  | 'payment_required'
  | 'deposit_paid'
  | 'paid'
  | 'payment_failed'
  | 'balance_remaining';

export type PaymentTiming =
  | 'no_payment_required'
  | 'payment_before_work'
  | 'deposit_before_work'
  | 'payment_after_completion'
  | 'manual_billing';

export type PaymentProviderMode = 'demo' | 'disabled' | 'provider';

export interface BillingLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmountMinor: number;
  lineAmountMinor: number;
  feeCategory: FeeCategory;
  amountStatus: AmountStatus;
  notes?: string;
}

export interface QuoteVersion {
  id: string;
  quoteId: string;
  versionNumber: number;
  lineItems: BillingLineItem[];
  subtotalServiceFeesMinor: number;
  subtotalExternalFeesMinor: number;
  discountTotalMinor: number;
  taxTotalMinor: number;
  totalKnownMinor: number;
  hasPendingExternalFees: boolean;
  internalNotes?: string;
  customerNotes?: string;
  termsPlaceholder?: string;
  createdAt: string;
  createdByStaffId?: string;
}

export interface QuoteAcceptance {
  versionId: string;
  acceptedAt: string;
  totalAcceptedMinor: number;
  acceptedByLabel?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  organizationId: string;
  serviceRequestId?: string;
  renewalId?: string;
  serviceTitle: string;
  status: QuoteStatus;
  currentVersionId: string;
  versions: QuoteVersion[];
  issueDate: string;
  expirationDate?: string;
  preparedByStaffId?: string;
  acceptance?: QuoteAcceptance;
  /** Sprint 15 — CRM linkage */
  leadId?: string;
  opportunityId?: string;
  secureToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  serviceRequestId?: string;
  quoteId?: string;
  quoteVersionId?: string;
  serviceTitle: string;
  status: InvoiceStatus;
  currency: CurrencyCode;
  lineItems: BillingLineItem[];
  subtotalServiceFeesMinor: number;
  subtotalExternalFeesMinor: number;
  discountTotalMinor: number;
  taxTotalMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  balanceDueMinor: number;
  hasPendingExternalFees: boolean;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  createdByStaffId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  organizationId: string;
  invoiceId: string;
  provider: 'demo' | 'stripe_future' | 'disabled';
  providerPaymentId?: string;
  amountMinor: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  methodType?: string;
  methodDisplay?: string;
  failureMessage?: string;
  processedAt?: string;
  createdAt: string;
  idempotencyKey?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  organizationId: string;
  invoiceId: string;
  paymentId: string;
  amountMinor: number;
  currency: CurrencyCode;
  lineItems: BillingLineItem[];
  issuedAt: string;
}

export interface CreditRecord {
  id: string;
  organizationId: string;
  invoiceId?: string;
  amountMinor: number;
  reason: string;
  authorizedByStaffId: string;
  createdAt: string;
}

export interface ServicePricingConfig {
  serviceSlug: string;
  title: string;
  division: string;
  pricingMode: PricingMode;
  baseServiceFeeMinor?: number;
  externalFeeLabel?: string;
  active: boolean;
  paymentTiming: PaymentTiming;
  internalNotes?: string;
}

export interface BillingCounters {
  quote: number;
  invoice: number;
  receipt: number;
  payment: number;
}
