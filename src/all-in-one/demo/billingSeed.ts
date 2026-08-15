import { DEFAULT_SERVICE_PRICING } from '../billing/servicePricingConfig';
import { buildLineItems, calculateBillingTotals } from '../billing/billingCalculator';
import { dollarsToMinor } from '../billing/money';
import type {
  BillingCounters,
  BillingInvoice,
  CreditRecord,
  PaymentRecord,
  Quote,
  QuoteVersion,
  Receipt,
} from '../billing/billingTypes';
import { daysAgo, daysAhead, isoNow } from './dateHelpers';

function quoteVersion(
  quoteId: string,
  versionNumber: number,
  lineInputs: Parameters<typeof buildLineItems>[0],
  opts?: Partial<QuoteVersion>,
): QuoteVersion {
  const lineItems = buildLineItems(lineInputs);
  const totals = calculateBillingTotals(lineItems);
  return {
    id: `${quoteId}-v${versionNumber}`,
    quoteId,
    versionNumber,
    lineItems: totals.lineItems,
    subtotalServiceFeesMinor: totals.subtotalServiceFeesMinor,
    subtotalExternalFeesMinor: totals.subtotalExternalFeesMinor,
    discountTotalMinor: totals.discountTotalMinor,
    taxTotalMinor: totals.taxTotalMinor,
    totalKnownMinor: totals.totalKnownMinor,
    hasPendingExternalFees: totals.hasPendingExternalFees,
    createdAt: isoNow(),
    ...opts,
  };
}

export function createBillingSeedData(): {
  quotes: Quote[];
  invoices: BillingInvoice[];
  payments: PaymentRecord[];
  receipts: Receipt[];
  credits: CreditRecord[];
  billingCounters: BillingCounters;
} {
  const qAId = 'quote-a-auth';
  const qAv1 = quoteVersion(qAId, 1, [
    {
      description: 'Operating Authority Assistance — All In One service',
      quantity: 1,
      unitAmountMinor: dollarsToMinor(200),
      feeCategory: 'service_fee',
    },
    {
      description: 'USDOT / FMCSA filing fee',
      quantity: 1,
      unitAmountMinor: 0,
      feeCategory: 'government_fee',
      amountStatus: 'pending',
      notes: 'Pending confirmation from agency',
    },
  ], { createdByStaffId: 'staff-2', customerNotes: 'Government fee will be confirmed before final total.' });

  const quoteA: Quote = {
    id: qAId,
    quoteNumber: 'AIO-QTE-2026-000001',
    organizationId: 'client-a',
    serviceRequestId: 'req-1',
    serviceTitle: 'Authority + BOC-3 Assistance',
    status: 'sent',
    currentVersionId: qAv1.id,
    versions: [qAv1],
    issueDate: daysAgo(3).slice(0, 10),
    expirationDate: daysAhead(14),
    preparedByStaffId: 'staff-2',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  };

  const qBId = 'quote-b-irp';
  const qBv1 = quoteVersion(qBId, 1, [
    {
      description: 'IRP Renewal Assistance',
      quantity: 1,
      unitAmountMinor: dollarsToMinor(175),
      feeCategory: 'service_fee',
    },
    {
      description: 'IRP jurisdiction fees (estimated)',
      quantity: 1,
      unitAmountMinor: dollarsToMinor(420),
      feeCategory: 'government_fee',
      amountStatus: 'estimated',
    },
  ], { createdByStaffId: 'staff-3' });

  const quoteB: Quote = {
    id: qBId,
    quoteNumber: 'AIO-QTE-2026-000002',
    organizationId: 'client-b',
    serviceRequestId: 'req-2',
    serviceTitle: 'IRP Registration Assistance',
    status: 'accepted',
    currentVersionId: qBv1.id,
    versions: [qBv1],
    issueDate: daysAgo(10).slice(0, 10),
    expirationDate: daysAhead(20),
    preparedByStaffId: 'staff-3',
    acceptance: {
      versionId: qBv1.id,
      acceptedAt: daysAgo(7),
      totalAcceptedMinor: qBv1.totalKnownMinor,
      acceptedByLabel: 'Diana Cole',
    },
    createdAt: daysAgo(10),
    updatedAt: daysAgo(7),
  };

  const invPaidLines = qBv1.lineItems;
  const invPaidTotals = calculateBillingTotals(invPaidLines);
  const invoicePaid: BillingInvoice = {
    id: 'inv-paid-a',
    invoiceNumber: 'AIO-INV-2026-000001',
    organizationId: 'client-b',
    serviceRequestId: 'req-2',
    quoteId: qBId,
    quoteVersionId: qBv1.id,
    serviceTitle: 'IRP Registration Assistance',
    status: 'paid',
    currency: 'USD',
    lineItems: invPaidLines,
    subtotalServiceFeesMinor: invPaidTotals.subtotalServiceFeesMinor,
    subtotalExternalFeesMinor: invPaidTotals.subtotalExternalFeesMinor,
    discountTotalMinor: invPaidTotals.discountTotalMinor,
    taxTotalMinor: invPaidTotals.taxTotalMinor,
    totalMinor: invPaidTotals.totalKnownMinor,
    amountPaidMinor: invPaidTotals.totalKnownMinor,
    balanceDueMinor: 0,
    hasPendingExternalFees: false,
    issuedAt: daysAgo(6).slice(0, 10),
    dueAt: daysAgo(1).slice(0, 10),
    paidAt: daysAgo(5),
    createdByStaffId: 'staff-3',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  };

  const invOpenLines = buildLineItems([
    { description: 'BOC-3 Assistance', quantity: 1, unitAmountMinor: dollarsToMinor(125), feeCategory: 'service_fee' },
    { description: 'Process agent fee', quantity: 1, unitAmountMinor: dollarsToMinor(35), feeCategory: 'third_party_fee' },
  ]);
  const invOpenTotals = calculateBillingTotals(invOpenLines);
  const invoiceOpen: BillingInvoice = {
    id: 'inv-open-b',
    invoiceNumber: 'AIO-INV-2026-000002',
    organizationId: 'client-a',
    serviceRequestId: 'req-1',
    serviceTitle: 'BOC-3 Process Agent Assistance',
    status: 'issued',
    currency: 'USD',
    lineItems: invOpenTotals.lineItems,
    subtotalServiceFeesMinor: invOpenTotals.subtotalServiceFeesMinor,
    subtotalExternalFeesMinor: invOpenTotals.subtotalExternalFeesMinor,
    discountTotalMinor: 0,
    taxTotalMinor: 0,
    totalMinor: invOpenTotals.totalKnownMinor,
    amountPaidMinor: 0,
    balanceDueMinor: invOpenTotals.totalKnownMinor,
    hasPendingExternalFees: false,
    issuedAt: daysAgo(2).slice(0, 10),
    dueAt: daysAhead(7),
    createdByStaffId: 'staff-2',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  };

  const invPastDueLines = buildLineItems([
    { description: 'Compliance support — overdue demo', quantity: 1, unitAmountMinor: dollarsToMinor(89), feeCategory: 'service_fee' },
  ]);
  const invPastDueTotals = calculateBillingTotals(invPastDueLines);
  const invoicePastDue: BillingInvoice = {
    id: 'inv-past-c',
    invoiceNumber: 'AIO-INV-2026-000003',
    organizationId: 'client-e',
    serviceTitle: 'Temporary Permit Support',
    status: 'past_due',
    currency: 'USD',
    lineItems: invPastDueTotals.lineItems,
    subtotalServiceFeesMinor: invPastDueTotals.subtotalServiceFeesMinor,
    subtotalExternalFeesMinor: 0,
    discountTotalMinor: 0,
    taxTotalMinor: 0,
    totalMinor: invPastDueTotals.totalKnownMinor,
    amountPaidMinor: 0,
    balanceDueMinor: invPastDueTotals.totalKnownMinor,
    hasPendingExternalFees: false,
    issuedAt: daysAgo(30).slice(0, 10),
    dueAt: daysAhead(-5),
    createdByStaffId: 'staff-3',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  };

  const paymentSuccess: PaymentRecord = {
    id: 'pay-success-a',
    organizationId: 'client-b',
    invoiceId: invoicePaid.id,
    provider: 'demo',
    providerPaymentId: 'demo_pay_success_001',
    amountMinor: invoicePaid.totalMinor,
    currency: 'USD',
    status: 'succeeded',
    methodType: 'demo',
    methodDisplay: 'Demo Payment · Simulated',
    processedAt: daysAgo(5),
    createdAt: daysAgo(5),
    idempotencyKey: 'demo:inv-paid-a:success',
  };

  const paymentFailed: PaymentRecord = {
    id: 'pay-failed-b',
    organizationId: 'client-a',
    invoiceId: invoiceOpen.id,
    provider: 'demo',
    amountMinor: invoiceOpen.totalMinor,
    currency: 'USD',
    status: 'failed',
    methodType: 'demo',
    methodDisplay: 'Demo Payment · Simulated',
    failureMessage: 'Payment could not be completed.',
    processedAt: daysAgo(1),
    createdAt: daysAgo(1),
    idempotencyKey: 'demo:inv-open-b:fail1',
  };

  const receiptPaid: Receipt = {
    id: 'rct-paid-a',
    receiptNumber: 'AIO-RCT-2026-000001',
    organizationId: 'client-b',
    invoiceId: invoicePaid.id,
    paymentId: paymentSuccess.id,
    amountMinor: invoicePaid.totalMinor,
    currency: 'USD',
    lineItems: invPaidLines,
    issuedAt: daysAgo(5),
  };

  const credit: CreditRecord = {
    id: 'credit-demo-1',
    organizationId: 'client-b',
    invoiceId: invoicePaid.id,
    amountMinor: dollarsToMinor(25),
    reason: 'Courtesy adjustment (demo)',
    authorizedByStaffId: 'staff-1',
    createdAt: daysAgo(4),
  };

  return {
    quotes: [quoteA, quoteB],
    invoices: [invoicePaid, invoiceOpen, invoicePastDue],
    payments: [paymentSuccess, paymentFailed],
    receipts: [receiptPaid],
    credits: [credit],
    billingCounters: { quote: 2, invoice: 3, receipt: 1, payment: 2 },
  };
}

export function defaultServicePricingSeed() {
  return DEFAULT_SERVICE_PRICING.map((p) => ({ ...p }));
}
