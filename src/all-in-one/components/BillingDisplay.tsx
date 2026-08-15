import type { BillingLineItem } from '../billing/billingTypes';
import { FEE_CATEGORY_LABELS, DEMO_BILLING_LABEL } from '../billing/billingConfig';
import { formatMoney } from '../billing/money';

export type FeeSummarySource = {
  subtotalServiceFeesMinor: number;
  subtotalExternalFeesMinor: number;
  discountTotalMinor: number;
  taxTotalMinor: number;
  hasPendingExternalFees: boolean;
  totalKnownMinor?: number;
  totalMinor?: number;
};

export function toFeeSummary(source: FeeSummarySource) {
  return {
    ...source,
    totalKnownMinor: source.totalKnownMinor ?? source.totalMinor ?? 0,
  };
}

export function BillingFeeSummary({ version }: { version: FeeSummarySource }) {
  const totals = toFeeSummary(version);
  return (
    <dl className="aio-billing-summary">
      <div><dt>All In One Service Fees</dt><dd>{formatMoney(totals.subtotalServiceFeesMinor)}</dd></div>
      <div><dt>Government / Agency Fees</dt><dd>{totals.hasPendingExternalFees ? 'Pending confirmation' : formatMoney(totals.subtotalExternalFeesMinor)}</dd></div>
      {totals.discountTotalMinor > 0 && <div><dt>Discount</dt><dd>-{formatMoney(totals.discountTotalMinor)}</dd></div>}
      {totals.taxTotalMinor > 0 && <div><dt>Tax</dt><dd>{formatMoney(totals.taxTotalMinor)}</dd></div>}
      <div className="aio-billing-summary__total">
        <dt>{totals.hasPendingExternalFees ? 'Estimated Total (service fees only)' : 'Total'}</dt>
        <dd>{formatMoney(totals.totalKnownMinor)}{totals.hasPendingExternalFees ? ' + pending external fees' : ''}</dd>
      </div>
      <p className="aio-prototype-note">{DEMO_BILLING_LABEL}</p>
    </dl>
  );
}

export function BillingLineItemsTable({ items }: { items: BillingLineItem[] }) {
  return (
    <div className="aio-billing-lines">
      <table className="aio-office-table aio-billing-lines__table">
        <thead>
          <tr><th>Description</th><th>Category</th><th>Qty</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {items.map((li) => (
            <tr key={li.id}>
              <td>{li.description}{li.notes ? <small> — {li.notes}</small> : null}</td>
              <td>{FEE_CATEGORY_LABELS[li.feeCategory]}{li.amountStatus === 'pending' ? ' · Pending' : li.amountStatus === 'estimated' ? ' · Est.' : ''}</td>
              <td>{li.quantity}</td>
              <td>{li.amountStatus === 'pending' ? 'Pending confirmation' : formatMoney(li.lineAmountMinor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="aio-billing-lines__mobile">
        {items.map((li) => (
          <li key={li.id}>
            <strong>{li.description}</strong>
            <span>{FEE_CATEGORY_LABELS[li.feeCategory]}</span>
            <span>{li.amountStatus === 'pending' ? 'Pending confirmation' : formatMoney(li.lineAmountMinor)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
