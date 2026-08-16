import type { BillingInvoice, PaymentRecord } from '../billing/billingTypes';
import type { DemoStore } from '../demo/demoTypes';
import type {
  FinancialAllocation,
  FinancialSummary,
  ManagementDateRange,
  ReceivablesAgingRow,
  ReceivablesBucket,
} from './managementTypes';
import { isDateInRange } from './managementDateRange';

export function allocatePayment(
  payment: PaymentRecord,
  invoice: BillingInvoice | undefined,
): FinancialAllocation {
  if (payment.status !== 'succeeded') {
    return { collectedCashMinor: 0, serviceFeesMinor: 0, passThroughMinor: 0, unallocatedMinor: 0 };
  }
  const amount = payment.amountMinor;
  if (!invoice || invoice.totalMinor <= 0) {
    return { collectedCashMinor: amount, serviceFeesMinor: 0, passThroughMinor: 0, unallocatedMinor: amount };
  }
  const ratio = amount / invoice.totalMinor;
  const serviceFeesMinor = Math.round(invoice.subtotalServiceFeesMinor * ratio);
  const passThroughMinor = Math.round((invoice.subtotalExternalFeesMinor + invoice.taxTotalMinor) * ratio);
  const allocated = serviceFeesMinor + passThroughMinor;
  return {
    collectedCashMinor: amount,
    serviceFeesMinor,
    passThroughMinor,
    unallocatedMinor: Math.max(0, amount - allocated),
  };
}

function paymentDate(p: PaymentRecord): string {
  return p.processedAt ?? p.createdAt;
}

export function getFinancialSummary(
  store: DemoStore,
  range: ManagementDateRange,
  dateBasis: 'payment_date' | 'invoice_date' = 'payment_date',
): FinancialSummary {
  let serviceFeesInvoicedMinor = 0;
  for (const inv of store.invoices) {
    const d = dateBasis === 'invoice_date' ? inv.issuedAt ?? inv.createdAt : inv.paidAt ?? inv.issuedAt ?? inv.createdAt;
    if (isDateInRange(d, range)) {
      serviceFeesInvoicedMinor += inv.subtotalServiceFeesMinor;
    }
  }

  let collectedCashMinor = 0;
  let serviceFeesCollectedMinor = 0;
  let passThroughCollectedMinor = 0;
  let hasIncompleteAllocation = false;

  for (const pay of store.payments) {
    if (!isDateInRange(paymentDate(pay), range)) continue;
    const inv = store.invoices.find((i) => i.id === pay.invoiceId);
    const alloc = allocatePayment(pay, inv);
    collectedCashMinor += alloc.collectedCashMinor;
    serviceFeesCollectedMinor += alloc.serviceFeesMinor;
    passThroughCollectedMinor += alloc.passThroughMinor;
    if (alloc.unallocatedMinor > 0) hasIncompleteAllocation = true;
  }

  const open = store.invoices.filter((i) => ['issued', 'partially_paid', 'past_due'].includes(i.status));
  const outstandingServiceReceivablesMinor = open.reduce((s, i) => s + i.subtotalServiceFeesMinor, 0);
  const totalOutstandingMinor = open.reduce((s, i) => s + i.balanceDueMinor, 0);

  const refundsMinor = store.payments
    .filter((p) => ['refunded', 'partially_refunded'].includes(p.status) && isDateInRange(paymentDate(p), range))
    .reduce((s, p) => s + p.amountMinor, 0);

  const discountsMinor = store.invoices
    .filter((i) => isDateInRange(i.issuedAt ?? i.createdAt, range))
    .reduce((s, i) => s + i.discountTotalMinor, 0);

  return {
    serviceFeesInvoicedMinor,
    serviceFeesCollectedMinor,
    passThroughCollectedMinor,
    collectedCashMinor,
    outstandingServiceReceivablesMinor,
    totalOutstandingMinor,
    refundsMinor,
    discountsMinor,
    hasIncompleteAllocation,
    waterfall: {
      grossCustomerPaymentsMinor: collectedCashMinor,
      passThroughMinor: passThroughCollectedMinor,
      refundsMinor,
      serviceFeesCollectedMinor,
    },
  };
}

function bucketForInvoice(inv: BillingInvoice, now = new Date()): ReceivablesBucket {
  if (!inv.dueAt || inv.balanceDueMinor <= 0) return 'current';
  const due = new Date(inv.dueAt);
  const days = Math.floor((startOfDay(now).getTime() - startOfDay(due).getTime()) / 86400000);
  if (days < 0) return 'current';
  if (days <= 30) return '1_30';
  if (days <= 60) return '31_60';
  if (days <= 90) return '61_90';
  return '90_plus';
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const BUCKET_LABELS: Record<ReceivablesBucket, string> = {
  current: 'Current',
  '1_30': '1–30 Days',
  '31_60': '31–60 Days',
  '61_90': '61–90 Days',
  '90_plus': '90+ Days',
};

export function getReceivablesAging(store: DemoStore, bucketFilter?: ReceivablesBucket): ReceivablesAgingRow[] {
  const buckets: Record<ReceivablesBucket, ReceivablesAgingRow> = {
    current: { bucket: 'current', label: BUCKET_LABELS.current, count: 0, balanceMinor: 0, invoiceIds: [] },
    '1_30': { bucket: '1_30', label: BUCKET_LABELS['1_30'], count: 0, balanceMinor: 0, invoiceIds: [] },
    '31_60': { bucket: '31_60', label: BUCKET_LABELS['31_60'], count: 0, balanceMinor: 0, invoiceIds: [] },
    '61_90': { bucket: '61_90', label: BUCKET_LABELS['61_90'], count: 0, balanceMinor: 0, invoiceIds: [] },
    '90_plus': { bucket: '90_plus', label: BUCKET_LABELS['90_plus'], count: 0, balanceMinor: 0, invoiceIds: [] },
  };

  for (const inv of store.invoices) {
    if (!['issued', 'partially_paid', 'past_due'].includes(inv.status) || inv.balanceDueMinor <= 0) continue;
    const b = bucketForInvoice(inv);
    buckets[b].count += 1;
    buckets[b].balanceMinor += inv.balanceDueMinor;
    buckets[b].invoiceIds.push(inv.id);
  }

  const rows = Object.values(buckets);
  return bucketFilter ? rows.filter((r) => r.bucket === bucketFilter) : rows;
}

/** Explicit test helper — $1,250 payment allocation */
export function allocateDemo1250Payment(): FinancialAllocation {
  const payment: PaymentRecord = {
    id: 'test',
    organizationId: 'x',
    invoiceId: 'inv',
    provider: 'demo',
    amountMinor: 125_000,
    currency: 'USD',
    status: 'succeeded',
    createdAt: new Date().toISOString(),
  };
  const invoice: BillingInvoice = {
    id: 'inv',
    invoiceNumber: 'TEST',
    organizationId: 'x',
    serviceTitle: 'Test',
    status: 'paid',
    currency: 'USD',
    lineItems: [],
    subtotalServiceFeesMinor: 60_000,
    subtotalExternalFeesMinor: 65_000,
    discountTotalMinor: 0,
    taxTotalMinor: 0,
    totalMinor: 125_000,
    amountPaidMinor: 125_000,
    balanceDueMinor: 0,
    hasPendingExternalFees: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return allocatePayment(payment, invoice);
}
