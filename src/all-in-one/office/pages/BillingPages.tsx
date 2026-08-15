import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  createInvoiceFromQuote,
  createQuoteFromRequest,
  getInvoice,
  getPayments,
  getQuote,
  getQuoteVersion,
  getQuotes,
  reviseQuote,
  sendQuote,
} from '../../demo/billingActions';
import { BillingFeeSummary, BillingLineItemsTable } from '../../components/BillingDisplay';
import { formatMoney } from '../../billing/money';
import { dollarsToMinor } from '../../billing/money';
import { pricingDisplayForMode, pricingModeLabel } from '../../billing/servicePricingConfig';
import { aioPaths } from '../../utils/paths';

export function OfficeBillingDashboardPage() {
  const store = useDemoStore();
  const invoices = store.invoices;
  const quotes = store.quotes;
  const payments = getPayments();

  const outstanding = invoices
    .filter((i) => ['issued', 'partially_paid', 'past_due'].includes(i.status))
    .reduce((s, i) => s + i.balanceDueMinor, 0);
  const paidThisMonth = payments
    .filter((p) => p.status === 'succeeded' && p.processedAt && p.processedAt.slice(0, 7) === new Date().toISOString().slice(0, 7))
    .reduce((s, p) => s + p.amountMinor, 0);
  const openQuotes = quotes.filter((q) => ['sent', 'viewed', 'revised', 'draft'].includes(q.status)).length;
  const openInvoices = invoices.filter((i) => ['issued', 'partially_paid'].includes(i.status)).length;
  const pastDue = invoices.filter((i) => i.status === 'past_due').length;
  const processing = payments.filter((p) => p.status === 'processing').length;
  const serviceRevenue = invoices.reduce((s, i) => s + i.subtotalServiceFeesMinor, 0);
  const externalFees = invoices.reduce((s, i) => s + i.subtotalExternalFeesMinor, 0);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Billing Center</h1>
        <p className="aio-prototype-note">DEMO · Operations summary — not GAAP accounting</p>
      </header>

      <div className="aio-office-metrics">
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{formatMoney(outstanding)}</span><span className="aio-office-metric-card__label">Outstanding Balance</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{formatMoney(paidThisMonth)}</span><span className="aio-office-metric-card__label">Paid This Month</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{openQuotes}</span><span className="aio-office-metric-card__label">Open Quotes</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{openInvoices}</span><span className="aio-office-metric-card__label">Open Invoices</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{pastDue}</span><span className="aio-office-metric-card__label">Past Due</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{processing}</span><span className="aio-office-metric-card__label">Payments Processing</span></div>
      </div>

      <section className="aio-office-panel">
        <h2>Billing Summary</h2>
        <dl className="aio-office-dl">
          <dt>All In One Service Fees (issued)</dt><dd>{formatMoney(serviceRevenue)}</dd>
          <dt>External / Pass-Through Fees Tracked</dt><dd>{formatMoney(externalFees)}</dd>
          <dt>Credits</dt><dd>{formatMoney(store.credits.reduce((s, c) => s + c.amountMinor, 0))}</dd>
          <dt>Refunds</dt><dd>{payments.filter((p) => p.status.includes('refund')).length} record(s)</dd>
        </dl>
        <p className="aio-prototype-note">Pass-through government fees are tracked separately and are not All In One revenue.</p>
      </section>

      <div className="aio-office-action-bar">
        <Link to={aioPaths.officeQuotes} className="aio-btn aio-btn--gold aio-btn--sm">Quotes</Link>
        <Link to={aioPaths.officeInvoices} className="aio-btn aio-btn--outline-dark aio-btn--sm">Invoices</Link>
        <Link to={aioPaths.officePayments} className="aio-btn aio-btn--outline-dark aio-btn--sm">Payments</Link>
        <Link to={aioPaths.officePricingSettings} className="aio-btn aio-btn--outline-dark aio-btn--sm">Pricing Settings</Link>
      </div>
    </div>
  );
}

export function OfficeQuotesPage() {
  const store = useDemoStore();
  const quotes = useMemo(() => getQuotes(undefined, store), [store.quotes]);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Quotes</h1>
        <p>Service estimates awaiting customer action</p>
      </header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Client</th>
              <th>Service</th>
              <th>Service Fee</th>
              <th>External Fee</th>
              <th>Total</th>
              <th>Status</th>
              <th>Issued</th>
              <th>Expires</th>
              <th>Request</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const v = getQuoteVersion(q);
              const client = store.clients.find((c) => c.id === q.organizationId);
              return (
                <tr key={q.id}>
                  <td><Link to={aioPaths.officeQuote(q.id)}>{q.quoteNumber}</Link></td>
                  <td>{client?.companyName}</td>
                  <td>{q.serviceTitle}</td>
                  <td>{v ? formatMoney(v.subtotalServiceFeesMinor) : '—'}</td>
                  <td>{v?.hasPendingExternalFees ? 'Pending' : v ? formatMoney(v.subtotalExternalFeesMinor) : '—'}</td>
                  <td>{v ? formatMoney(v.totalKnownMinor) : '—'}</td>
                  <td>{q.status.replace(/_/g, ' ')}</td>
                  <td>{q.issueDate}</td>
                  <td>{q.expirationDate ?? '—'}</td>
                  <td>{q.serviceRequestId ? <Link to={aioPaths.officeRequest(q.serviceRequestId)}>{q.serviceRequestId}</Link> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OfficeQuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const store = useDemoStore();
  const quote = quoteId ? getQuote(quoteId) : undefined;
  const version = quote ? getQuoteVersion(quote) : undefined;
  const client = quote ? store.clients.find((c) => c.id === quote.organizationId) : undefined;

  if (!quote || !version) {
    return <div className="aio-office-page"><p>Quote not found.</p><Link to={aioPaths.officeQuotes}>← Quotes</Link></div>;
  }

  const handleSend = () => sendQuote(quote.id, 'staff-2');
  const handleInvoice = () => createInvoiceFromQuote(quote.id, 'staff-2');
  const handleReviseGovFee = () => {
    reviseQuote(quote.id, [
      { description: 'Operating Authority Assistance — All In One service', quantity: 1, unitAmountMinor: dollarsToMinor(200), feeCategory: 'service_fee' },
      { description: 'USDOT / FMCSA filing fee', quantity: 1, unitAmountMinor: dollarsToMinor(300), feeCategory: 'government_fee', amountStatus: 'known' },
    ], 'staff-2');
  };

  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeQuotes} className="aio-office-link">← Quotes</Link>
      <header className="aio-office-page__header">
        <h1>{quote.quoteNumber}</h1>
        <p>{client?.companyName} · {quote.serviceTitle}</p>
      </header>

      <dl className="aio-office-dl">
        <dt>Status</dt><dd>{quote.status.replace(/_/g, ' ')}</dd>
        <dt>Version</dt><dd>{version.versionNumber}</dd>
        <dt>Issued</dt><dd>{quote.issueDate}</dd>
        <dt>Expires</dt><dd>{quote.expirationDate ?? '—'}</dd>
        {quote.acceptance && (
          <>
            <dt>Accepted</dt>
            <dd>{new Date(quote.acceptance.acceptedAt).toLocaleString()} · v{quote.versions.find((v) => v.id === quote.acceptance?.versionId)?.versionNumber}</dd>
          </>
        )}
      </dl>

      <BillingLineItemsTable items={version.lineItems} />
      <BillingFeeSummary version={version} />
      {version.internalNotes && <p className="aio-prototype-note"><strong>Internal:</strong> {version.internalNotes}</p>}

      <div className="aio-office-action-bar">
        {quote.status === 'draft' && <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={handleSend}>Send Quote</button>}
        {['sent', 'viewed'].includes(quote.status) && <button type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" onClick={handleReviseGovFee}>Revise (confirm gov fee)</button>}
        {quote.status === 'accepted' && <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={handleInvoice}>Create Invoice</button>}
        {quote.serviceRequestId && <Link to={aioPaths.officeRequest(quote.serviceRequestId)} className="aio-btn aio-btn--outline-dark aio-btn--sm">View Request</Link>}
      </div>

      {quote.versions.length > 1 && (
        <section className="aio-office-panel">
          <h2>Version History</h2>
          <ul>
            {quote.versions.map((v) => (
              <li key={v.id}>v{v.versionNumber} — {formatMoney(v.totalKnownMinor)} · {new Date(v.createdAt).toLocaleDateString()}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function OfficeInvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const store = useDemoStore();
  const invoice = invoiceId ? getInvoice(invoiceId) : undefined;
  const client = invoice ? store.clients.find((c) => c.id === invoice.organizationId) : undefined;
  const payments = invoice ? getPayments(invoice.organizationId, store).filter((p) => p.invoiceId === invoice.id) : [];

  if (!invoice) {
    return <div className="aio-office-page"><p>Invoice not found.</p><Link to={aioPaths.officeInvoices}>← Invoices</Link></div>;
  }

  return (
    <div className="aio-office-page aio-print-friendly">
      <Link to={aioPaths.officeInvoices} className="aio-office-link">← Invoices</Link>
      <header className="aio-office-page__header">
        <h1>{invoice.invoiceNumber}</h1>
        <p>{client?.companyName} · {invoice.serviceTitle}</p>
      </header>

      <dl className="aio-office-dl">
        <dt>Status</dt><dd>{invoice.status.replace(/_/g, ' ')}</dd>
        <dt>Issued</dt><dd>{invoice.issuedAt ?? '—'}</dd>
        <dt>Due</dt><dd>{invoice.dueAt ?? '—'}</dd>
        <dt>Balance Due</dt><dd><strong>{formatMoney(invoice.balanceDueMinor)}</strong></dd>
      </dl>

      <BillingLineItemsTable items={invoice.lineItems} />
      <BillingFeeSummary version={invoice} />

      {payments.length > 0 && (
        <section className="aio-office-panel">
          <h2>Payments</h2>
          <ul>
            {payments.map((p) => (
              <li key={p.id}>{formatMoney(p.amountMinor)} · {p.status} · {p.methodDisplay ?? p.provider}</li>
            ))}
          </ul>
        </section>
      )}

      {invoice.serviceRequestId && (
        <Link to={aioPaths.officeRequest(invoice.serviceRequestId)} className="aio-btn aio-btn--outline-dark aio-btn--sm">View Request</Link>
      )}
    </div>
  );
}

export function OfficePricingSettingsPage() {
  const store = useDemoStore();
  const pricing = store.servicePricing;

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Pricing Settings</h1>
        <p>Service catalog commercial configuration · demo editable in future backend mode</p>
      </header>
      <p className="aio-prototype-note">DEMO · Fictional sample pricing. Production requires pricing.manage permission.</p>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Division</th>
              <th>Pricing Mode</th>
              <th>Status</th>
              <th>Service Fee</th>
              <th>External Fee Note</th>
              <th>Payment Timing</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((p) => (
              <tr key={p.serviceSlug}>
                <td>{p.title}</td>
                <td>{p.division}</td>
                <td>{pricingModeLabel(p.pricingMode)}</td>
                <td>{pricingDisplayForMode(p)}</td>
                <td>{p.baseServiceFeeMinor != null ? formatMoney(p.baseServiceFeeMinor) : '—'}</td>
                <td>{p.externalFeeLabel ?? '—'}</td>
                <td>{p.paymentTiming.replace(/_/g, ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Create a draft quote from a service request (office action). */
export function createQuoteForRequest(requestId: string): void {
  createQuoteFromRequest(
    requestId,
    [
      { description: 'All In One service fee', quantity: 1, unitAmountMinor: dollarsToMinor(200), feeCategory: 'service_fee' },
      { description: 'Government / agency fee', quantity: 1, unitAmountMinor: 0, feeCategory: 'government_fee', amountStatus: 'pending' },
    ],
    'staff-2',
    { expirationDays: 14, internalNotes: 'Government fee awaiting confirmation.' },
  );
}
