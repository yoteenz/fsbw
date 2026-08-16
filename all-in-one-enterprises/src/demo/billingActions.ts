import { buildLineItems, calculateBillingTotals, computeBalanceDue, canAcceptPayment } from '../billing/billingCalculator';
import type { LineItemInput } from '../billing/billingCalculator';
import { QUOTE_ACCEPTANCE_TERMS } from '../billing/billingConfig';
import type { BillingInvoice, Quote, QuoteVersion } from '../billing/billingTypes';
import { getPaymentProvider, getPaymentProviderMode } from '../billing/paymentProvider';
import { formatMoney } from '../billing/money';
import { buildNotification, shouldCreateNotification } from '../notifications/notificationEngine';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import { aioPaths } from '../utils/paths';

function uid(): string {
  return crypto.randomUUID();
}

export function getOrganizationId(store: DemoStore = loadDemoStore()): string {
  return store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
}

function nextNumber(store: DemoStore, kind: 'quote' | 'invoice' | 'receipt' | 'payment'): string {
  const year = new Date().getFullYear();
  store.billingCounters[kind] += 1;
  const n = String(store.billingCounters[kind]).padStart(6, '0');
  if (kind === 'quote') return `AIO-QTE-${year}-${n}`;
  if (kind === 'invoice') return `AIO-INV-${year}-${n}`;
  if (kind === 'receipt') return `AIO-RCT-${year}-${n}`;
  return `AIO-PAY-${year}-${n}`;
}

export function getQuotes(orgId?: string, store: DemoStore = loadDemoStore()): Quote[] {
  return store.quotes.filter((q) => !orgId || q.organizationId === orgId);
}

export function getQuote(id: string, store: DemoStore = loadDemoStore()): Quote | undefined {
  return store.quotes.find((q) => q.id === id);
}

export function getQuoteVersion(quote: Quote): QuoteVersion | undefined {
  return quote.versions.find((v) => v.id === quote.currentVersionId);
}

export function getInvoices(orgId?: string, store: DemoStore = loadDemoStore()): BillingInvoice[] {
  return store.invoices.filter((i) => !orgId || i.organizationId === orgId);
}

export function getInvoice(id: string, store: DemoStore = loadDemoStore()): BillingInvoice | undefined {
  return store.invoices.find((i) => i.id === id);
}

export function getReceipts(orgId?: string, store: DemoStore = loadDemoStore()) {
  return store.receipts.filter((r) => !orgId || r.organizationId === orgId);
}

export function getReceipt(id: string, store: DemoStore = loadDemoStore()) {
  return store.receipts.find((r) => r.id === id);
}

export function getPayments(orgId?: string, store: DemoStore = loadDemoStore()) {
  return store.payments.filter((p) => !orgId || p.organizationId === orgId);
}

export function getBillingSummary(orgId: string, store: DemoStore = loadDemoStore()) {
  const invoices = getInvoices(orgId, store);
  const open = invoices.filter((i) => ['issued', 'partially_paid', 'past_due'].includes(i.status));
  const balanceDueMinor = open.reduce((s, i) => s + i.balanceDueMinor, 0);
  const quotes = getQuotes(orgId, store).filter((q) => ['sent', 'viewed', 'revised'].includes(q.status));
  const recentPayments = getPayments(orgId, store).slice(0, 5);
  return { balanceDueMinor, openInvoices: open, pendingQuotes: quotes, recentPayments };
}

export function createQuoteFromRequest(
  requestId: string,
  lineInputs: LineItemInput[],
  staffId: string,
  opts?: { internalNotes?: string; expirationDays?: number },
): Quote {
  let created!: Quote;
  updateDemoStore((s) => {
    const req = s.requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');
    const quoteId = uid();
    const version: QuoteVersion = {
      id: `${quoteId}-v1`,
      quoteId,
      versionNumber: 1,
      ...totalsFromInputs(lineInputs),
      internalNotes: opts?.internalNotes,
      createdAt: new Date().toISOString(),
      createdByStaffId: staffId,
    };
    const quote: Quote = {
      id: quoteId,
      quoteNumber: nextNumber(s, 'quote'),
      organizationId: req.clientId,
      serviceRequestId: requestId,
      serviceTitle: req.services.map((x) => x.title).join(' + '),
      status: 'draft',
      currentVersionId: version.id,
      versions: [version],
      issueDate: new Date().toISOString().slice(0, 10),
      expirationDate: opts?.expirationDays
        ? new Date(Date.now() + opts.expirationDays * 86400000).toISOString().slice(0, 10)
        : undefined,
      preparedByStaffId: staffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    s.quotes.unshift(quote);
    req.billingStatus = 'awaiting_quote_acceptance';
    s.activity.unshift({
      id: uid(),
      kind: 'QUOTE_CREATED',
      title: `Quote created — ${quote.quoteNumber}`,
      clientId: req.clientId,
      requestId,
      staffId,
      createdAt: new Date().toISOString(),
      visibility: 'internal',
    });
    created = quote;
    return s;
  });
  return created;
}

function totalsFromInputs(lineInputs: LineItemInput[]) {
  const lineItems = buildLineItems(lineInputs);
  const totals = calculateBillingTotals(lineItems);
  return {
    lineItems: totals.lineItems,
    subtotalServiceFeesMinor: totals.subtotalServiceFeesMinor,
    subtotalExternalFeesMinor: totals.subtotalExternalFeesMinor,
    discountTotalMinor: totals.discountTotalMinor,
    taxTotalMinor: totals.taxTotalMinor,
    totalKnownMinor: totals.totalKnownMinor,
    hasPendingExternalFees: totals.hasPendingExternalFees,
  };
}

export function sendQuote(quoteId: string, staffId: string): void {
  updateDemoStore((s) => {
    const q = s.quotes.find((x) => x.id === quoteId);
    if (!q || q.status === 'converted') return s;
    q.status = 'sent';
    q.updatedAt = new Date().toISOString();
    const req = q.serviceRequestId ? s.requests.find((r) => r.id === q.serviceRequestId) : undefined;
    if (req) req.billingStatus = 'awaiting_quote_acceptance';
    const notif = buildNotification({
      organizationId: q.organizationId,
      recipientType: 'customer',
      eventType: 'QUOTE_AVAILABLE',
      category: 'billing',
      title: `Quote available — ${q.serviceTitle}`,
      body: 'Review your service estimate and accept or decline.',
      entityType: 'quote',
      entityId: q.id,
      link: aioPaths.portalQuote(q.id),
      dedupeKey: `quote-sent:${q.id}`,
    });
    if (!notif.dedupeKey || shouldCreateNotification(s.notifications, notif.dedupeKey)) {
      s.notifications.unshift(notif);
    }
    s.activity.unshift({
      id: uid(),
      kind: 'QUOTE_SENT',
      title: `Quote sent — ${q.quoteNumber}`,
      clientId: q.organizationId,
      requestId: q.serviceRequestId,
      staffId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function markQuoteViewed(quoteId: string, orgId: string): void {
  updateDemoStore((s) => {
    const q = s.quotes.find((x) => x.id === quoteId && x.organizationId === orgId);
    if (!q || q.status !== 'sent') return s;
    q.status = 'viewed';
    q.updatedAt = new Date().toISOString();
    return s;
  });
}

export function acceptQuote(quoteId: string, orgId: string, acceptedByLabel?: string): void {
  updateDemoStore((s) => {
    const q = s.quotes.find((x) => x.id === quoteId && x.organizationId === orgId);
    if (!q || !['sent', 'viewed', 'revised'].includes(q.status)) return s;
    if (q.expirationDate && q.expirationDate < new Date().toISOString().slice(0, 10)) {
      q.status = 'expired';
      return s;
    }
    const version = q.versions.find((v) => v.id === q.currentVersionId);
    if (!version) return s;
    q.status = 'accepted';
    q.acceptance = {
      versionId: version.id,
      acceptedAt: new Date().toISOString(),
      totalAcceptedMinor: version.totalKnownMinor,
      acceptedByLabel,
    };
    q.updatedAt = new Date().toISOString();
    if (q.serviceRequestId) {
      const req = s.requests.find((r) => r.id === q.serviceRequestId);
      if (req) {
        req.billingStatus = 'payment_required';
        if (req.status === 'documents_needed' || req.status === 'information_needed') {
          req.nextStep = 'Payment required before work begins';
        }
      }
    }
    s.notifications.unshift(
      buildNotification({
        recipientType: 'staff',
        staffId: q.preparedByStaffId ?? 'staff-2',
        eventType: 'QUOTE_ACCEPTED',
        category: 'billing',
        title: `Quote accepted — ${q.quoteNumber}`,
        body: `${acceptedByLabel ?? 'Customer'} accepted the quote.`,
        entityType: 'quote',
        entityId: q.id,
        link: aioPaths.officeQuote(q.id),
      }),
    );
    s.activity.unshift({
      id: uid(),
      kind: 'QUOTE_ACCEPTED',
      title: `Quote accepted — ${q.quoteNumber}`,
      clientId: orgId,
      requestId: q.serviceRequestId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function declineQuote(quoteId: string, orgId: string): void {
  updateDemoStore((s) => {
    const q = s.quotes.find((x) => x.id === quoteId && x.organizationId === orgId);
    if (!q) return s;
    q.status = 'declined';
    q.updatedAt = new Date().toISOString();
    s.activity.unshift({
      id: uid(),
      kind: 'QUOTE_DECLINED',
      title: `Quote declined — ${q.quoteNumber}`,
      clientId: orgId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function reviseQuote(quoteId: string, lineInputs: LineItemInput[], staffId: string): void {
  updateDemoStore((s) => {
    const q = s.quotes.find((x) => x.id === quoteId);
    if (!q) return s;
    const nextNum = q.versions.length + 1;
    const version: QuoteVersion = {
      id: `${q.id}-v${nextNum}`,
      quoteId: q.id,
      versionNumber: nextNum,
      ...totalsFromInputs(lineInputs),
      createdAt: new Date().toISOString(),
      createdByStaffId: staffId,
    };
    q.versions.push(version);
    q.currentVersionId = version.id;
    q.status = 'revised';
    q.acceptance = undefined;
    q.updatedAt = new Date().toISOString();
    s.notifications.unshift(
      buildNotification({
        organizationId: q.organizationId,
        recipientType: 'customer',
        eventType: 'QUOTE_REVISED',
        category: 'billing',
        title: `Quote revised — ${q.serviceTitle}`,
        body: 'Review the updated estimate and accept the new version.',
        entityType: 'quote',
        entityId: q.id,
        link: aioPaths.portalQuote(q.id),
      }),
    );
    s.activity.unshift({
      id: uid(),
      kind: 'QUOTE_REVISED',
      title: `Quote revised — ${q.quoteNumber} v${nextNum}`,
      clientId: q.organizationId,
      staffId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function createInvoiceFromQuote(quoteId: string, staffId: string): BillingInvoice {
  let invoice!: BillingInvoice;
  updateDemoStore((s) => {
    const q = s.quotes.find((x) => x.id === quoteId);
    if (!q || q.status !== 'accepted') throw new Error('Quote must be accepted');
    const version = q.versions.find((v) => v.id === q.currentVersionId);
    if (!version) throw new Error('Quote version missing');
    const invId = uid();
    const inv: BillingInvoice = {
      id: invId,
      invoiceNumber: nextNumber(s, 'invoice'),
      organizationId: q.organizationId,
      serviceRequestId: q.serviceRequestId,
      quoteId: q.id,
      quoteVersionId: version.id,
      serviceTitle: q.serviceTitle,
      status: 'issued',
      currency: 'USD',
      lineItems: version.lineItems.map((li) => ({ ...li })),
      subtotalServiceFeesMinor: version.subtotalServiceFeesMinor,
      subtotalExternalFeesMinor: version.subtotalExternalFeesMinor,
      discountTotalMinor: version.discountTotalMinor,
      taxTotalMinor: version.taxTotalMinor,
      totalMinor: version.totalKnownMinor,
      amountPaidMinor: 0,
      balanceDueMinor: version.totalKnownMinor,
      hasPendingExternalFees: version.hasPendingExternalFees,
      issuedAt: new Date().toISOString().slice(0, 10),
      dueAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      createdByStaffId: staffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    s.invoices.unshift(inv);
    q.status = 'converted';
    if (q.serviceRequestId) {
      const req = s.requests.find((r) => r.id === q.serviceRequestId);
      if (req) req.billingStatus = 'payment_required';
    }
    s.notifications.unshift(
      buildNotification({
        organizationId: q.organizationId,
        recipientType: 'customer',
        eventType: 'INVOICE_ISSUED',
        category: 'billing',
        title: `Invoice issued — ${inv.invoiceNumber}`,
        body: `Amount due: ${formatMoney(inv.balanceDueMinor)}`,
        entityType: 'invoice',
        entityId: inv.id,
        link: aioPaths.portalInvoice(inv.id),
      }),
    );
    s.activity.unshift({
      id: uid(),
      kind: 'INVOICE_ISSUED',
      title: `Invoice issued — ${inv.invoiceNumber}`,
      clientId: q.organizationId,
      requestId: q.serviceRequestId,
      staffId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    invoice = inv;
    return s;
  });
  return invoice;
}

export async function simulateInvoicePayment(
  invoiceId: string,
  orgId: string,
  outcome: 'success' | 'failure' | 'cancel',
): Promise<{ ok: boolean; message?: string; receiptId?: string }> {
  const store = loadDemoStore();
  const invoice = store.invoices.find((i) => i.id === invoiceId && i.organizationId === orgId);
  if (!invoice) return { ok: false, message: 'Invoice not found.' };
  if (!canAcceptPayment(invoice.status, invoice.balanceDueMinor)) {
    return { ok: false, message: 'This invoice cannot accept payment.' };
  }

  const idempotencyKey = `demo:${invoiceId}:${outcome}:${Date.now()}`;
  if (store.payments.some((p) => p.idempotencyKey === idempotencyKey && p.status === 'succeeded')) {
    return { ok: false, message: 'Payment already recorded.' };
  }

  const provider = getPaymentProvider();
  const result = await provider.confirmDemoPayment(
    {
      invoiceId,
      organizationId: orgId,
      amountMinor: invoice.balanceDueMinor,
      currency: 'USD',
      idempotencyKey,
    },
    outcome,
  );

  if (!result.success) {
    updateDemoStore((s) => {
      s.payments.unshift({
        id: uid(),
        organizationId: orgId,
        invoiceId,
        provider: 'demo',
        amountMinor: invoice.balanceDueMinor,
        currency: 'USD',
        status: result.status,
        failureMessage: result.failureMessage,
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        idempotencyKey,
      });
      const req = invoice.serviceRequestId ? s.requests.find((r) => r.id === invoice.serviceRequestId) : undefined;
      if (req) req.billingStatus = 'payment_failed';
      s.notifications.unshift(
        buildNotification({
          organizationId: orgId,
          recipientType: 'customer',
          eventType: 'PAYMENT_FAILED',
          category: 'billing',
          title: 'Payment could not be completed',
          body: result.failureMessage ?? 'Please try again.',
          entityType: 'invoice',
          entityId: invoiceId,
          link: aioPaths.portalPay(invoiceId),
        }),
      );
      s.activity.unshift({
        id: uid(),
        kind: 'PAYMENT_FAILED',
        title: `Payment failed — ${invoice.invoiceNumber}`,
        clientId: orgId,
        createdAt: new Date().toISOString(),
        visibility: 'customer',
      });
      return s;
    });
    return { ok: false, message: result.failureMessage };
  }

  let receiptId = '';
  updateDemoStore((s) => {
    const inv = s.invoices.find((i) => i.id === invoiceId);
    if (!inv) return s;
    const payId = uid();
    s.payments.unshift({
      id: payId,
      organizationId: orgId,
      invoiceId,
      provider: 'demo',
      providerPaymentId: result.providerPaymentId,
      amountMinor: inv.balanceDueMinor,
      currency: 'USD',
      status: 'succeeded',
      methodType: 'demo',
      methodDisplay: result.methodDisplay,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      idempotencyKey,
    });
    inv.amountPaidMinor = addPaid(inv.amountPaidMinor, inv.balanceDueMinor);
    inv.balanceDueMinor = computeBalanceDue(inv.totalMinor, inv.amountPaidMinor);
    inv.status = inv.balanceDueMinor === 0 ? 'paid' : 'partially_paid';
    if (inv.status === 'paid') inv.paidAt = new Date().toISOString();
    inv.updatedAt = new Date().toISOString();

    const rctId = uid();
    receiptId = rctId;
    s.receipts.unshift({
      id: rctId,
      receiptNumber: nextNumber(s, 'receipt'),
      organizationId: orgId,
      invoiceId,
      paymentId: payId,
      amountMinor: inv.amountPaidMinor,
      currency: 'USD',
      lineItems: inv.lineItems.map((li) => ({ ...li })),
      issuedAt: new Date().toISOString(),
    });

    const req = inv.serviceRequestId ? s.requests.find((r) => r.id === inv.serviceRequestId) : undefined;
    if (req) {
      req.billingStatus = inv.balanceDueMinor > 0 ? 'balance_remaining' : 'paid';
      if (inv.balanceDueMinor === 0 && req.status !== 'completed') {
        req.nextStep = 'Payment received — ready to begin';
        req.workflowStep = req.workflowStep === 'documents_needed' ? req.workflowStep : 'in_progress';
      }
    }

    s.notifications.unshift(
      buildNotification({
        organizationId: orgId,
        recipientType: 'customer',
        eventType: 'PAYMENT_SUCCEEDED',
        category: 'billing',
        title: `Payment received — ${inv.invoiceNumber}`,
        body: 'Your receipt is available in Billing.',
        entityType: 'receipt',
        entityId: rctId,
        link: aioPaths.portalReceipt(rctId),
      }),
    );
    s.activity.unshift({
      id: uid(),
      kind: 'PAYMENT_SUCCEEDED',
      title: `Payment received — ${inv.invoiceNumber}`,
      clientId: orgId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    s.activity.unshift({
      id: uid(),
      kind: 'RECEIPT_CREATED',
      title: `Receipt issued`,
      clientId: orgId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });

  return { ok: true, receiptId };
}

function addPaid(current: number, payment: number): number {
  return current + payment;
}

export function runBillingEvaluation(): void {
  updateDemoStore((s) => {
    const today = new Date().toISOString().slice(0, 10);
    for (const q of s.quotes) {
      if (q.expirationDate && q.expirationDate < today && ['sent', 'viewed', 'revised'].includes(q.status)) {
        q.status = 'expired';
      }
    }
    for (const inv of s.invoices) {
      if (inv.dueAt && inv.dueAt < today && inv.balanceDueMinor > 0 && ['issued', 'partially_paid'].includes(inv.status)) {
        inv.status = 'past_due';
      }
    }
    s.billingEvaluatorLastRun = new Date().toISOString();
    return s;
  });
}

export function getQuoteAcceptanceTerms(): string {
  return QUOTE_ACCEPTANCE_TERMS;
}

export function getPaymentModeLabel(): string {
  const mode = getPaymentProviderMode();
  if (mode === 'demo') return 'Demo Mode — simulate payment';
  if (mode === 'disabled') return 'Online payment not yet available';
  return 'Payment provider';
}

export function searchBilling(query: string, store: DemoStore = loadDemoStore()): { type: string; id: string; label: string }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: { type: string; id: string; label: string }[] = [];
  for (const quote of store.quotes) {
    if (quote.quoteNumber.toLowerCase().includes(q) || quote.id.includes(q)) {
      results.push({ type: 'quote', id: quote.id, label: quote.quoteNumber });
    }
  }
  for (const inv of store.invoices) {
    if (inv.invoiceNumber.toLowerCase().includes(q) || inv.id.includes(q)) {
      results.push({ type: 'invoice', id: inv.id, label: inv.invoiceNumber });
    }
  }
  for (const r of store.receipts) {
    if (r.receiptNumber.toLowerCase().includes(q)) {
      results.push({ type: 'receipt', id: r.id, label: r.receiptNumber });
    }
  }
  return results;
}
