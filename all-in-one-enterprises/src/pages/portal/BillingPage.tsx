import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { getBillingSummary, getOrganizationId, getQuotes, getReceipts, getPayments } from '../../demo/billingActions';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

export function BillingPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const summary = useMemo(() => getBillingSummary(orgId, store), [orgId, store.invoices, store.quotes, store.payments]);
  const quotes = getQuotes(orgId, store).filter((q) => ['sent', 'viewed', 'revised', 'accepted'].includes(q.status));
  const receipts = getReceipts(orgId, store);

  return (
    <div className="aio-billing">
      <header className="aio-billing__hero">
        <h1>Billing</h1>
        <p>Quotes, invoices, payments, and receipts for All In One services.</p>
      </header>

      <section className="aio-billing-balance">
        <h2>Balance Due</h2>
        {summary.balanceDueMinor > 0 ? (
          <>
            <p className="aio-billing-balance__amount">{formatMoney(summary.balanceDueMinor)}</p>
            <p>{summary.openInvoices.length} open invoice(s)</p>
          </>
        ) : (
          <p className="aio-vault-caught-up">No balance due</p>
        )}
      </section>

      <section className="aio-billing-section">
        <h2>Open Invoices</h2>
        {summary.openInvoices.length === 0 ? (
          <p className="aio-empty-state__text">No open invoices.</p>
        ) : (
          summary.openInvoices.map((inv) => (
            <Link key={inv.id} to={aioPaths.portalInvoice(inv.id)} className="aio-billing-card">
              <strong>{inv.invoiceNumber}</strong>
              <span>{inv.serviceTitle}</span>
              <span>{formatMoney(inv.balanceDueMinor)} · {inv.status.replace(/_/g, ' ')}</span>
            </Link>
          ))
        )}
      </section>

      <section className="aio-billing-section">
        <h2>Quotes</h2>
        <Link to={aioPaths.portalQuotes} className="aio-rr-link">View all quotes →</Link>
        {quotes.slice(0, 3).map((q) => (
          <Link key={q.id} to={aioPaths.portalQuote(q.id)} className="aio-billing-card aio-billing-card--compact">
            {q.quoteNumber} — {q.status.replace(/_/g, ' ')}
          </Link>
        ))}
      </section>

      <section className="aio-billing-section">
        <h2>Recent Payments</h2>
        {getPayments(orgId, store).slice(0, 5).map((p) => (
          <div key={p.id} className="aio-portal-list__item">
            <span>{formatMoney(p.amountMinor)} · {p.status}</span>
            <small>{p.processedAt ? new Date(p.processedAt).toLocaleDateString() : '—'}</small>
          </div>
        ))}
      </section>

      <section className="aio-billing-section">
        <h2>Receipts</h2>
        {receipts.length === 0 ? (
          <p className="aio-empty-state__text">No receipts yet.</p>
        ) : (
          receipts.map((r) => (
            <Link key={r.id} to={aioPaths.portalReceipt(r.id)} className="aio-billing-card aio-billing-card--compact">
              {r.receiptNumber} — {formatMoney(r.amountMinor)}
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
