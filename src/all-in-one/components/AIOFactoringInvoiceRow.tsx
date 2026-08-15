import type { MockFactoringInvoice } from '../data/mockFactoring';
import { AIOFactoringStatusBadge } from './AIOFactoringStatusBadge';

type Props = {
  invoice: MockFactoringInvoice;
  onReview?: (invoice: MockFactoringInvoice) => void;
};

function formatCurrency(amount: number): string {
  return amount > 0 ? `$${amount.toLocaleString()}` : '—';
}

export function AIOFactoringInvoiceRow({ invoice, onReview }: Props) {
  const canReview = invoice.status === 'not_submitted' || invoice.status === 'eligible';

  return (
    <tr className="aio-factoring-table__row">
      <td data-label="Load #">{invoice.loadNumber}</td>
      <td data-label="Broker / Debtor">{invoice.debtor}</td>
      <td data-label="Invoice Amount">{formatCurrency(invoice.invoiceAmount)}</td>
      <td data-label="Delivery">{invoice.deliveryDate}</td>
      <td data-label="Eligibility">
        <AIOFactoringStatusBadge status={invoice.eligibility} />
      </td>
      <td data-label="Status">
        <AIOFactoringStatusBadge status={invoice.status} />
      </td>
      <td data-label="Est. Proceeds">{formatCurrency(invoice.estimatedProceeds)}</td>
      <td data-label="Action">
        {canReview ? (
          <button type="button" className="aio-factoring-table__action" onClick={() => onReview?.(invoice)}>
            Review (Demo)
          </button>
        ) : (
          <span className="aio-factoring-table__muted">—</span>
        )}
      </td>
    </tr>
  );
}

/** Mobile-friendly card variant */
export function AIOFactoringInvoiceCard({ invoice, onReview }: Props) {
  const canReview = invoice.status === 'not_submitted' || invoice.status === 'eligible';

  return (
    <article className="aio-factoring-invoice-card">
      <div className="aio-factoring-invoice-card__header">
        <strong>Load #{invoice.loadNumber}</strong>
        <AIOFactoringStatusBadge status={invoice.status} />
      </div>
      <p className="aio-factoring-invoice-card__debtor">{invoice.debtor}</p>
      <dl className="aio-factoring-invoice-card__meta">
        <div>
          <dt>Amount</dt>
          <dd>${invoice.invoiceAmount.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{invoice.deliveryDate}</dd>
        </div>
        <div>
          <dt>Est. Proceeds</dt>
          <dd>${invoice.estimatedProceeds.toLocaleString()}</dd>
        </div>
      </dl>
      {canReview ? (
        <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => onReview?.(invoice)}>
          Review (Demo)
        </button>
      ) : null}
    </article>
  );
}
