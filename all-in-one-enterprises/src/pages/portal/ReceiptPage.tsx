import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getOrganizationId, getReceipt } from '../../demo/billingActions';
import { BillingLineItemsTable } from '../../components/BillingDisplay';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

export function ReceiptPage() {
  const { receiptId } = useParams<{ receiptId: string }>();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const receipt = receiptId ? getReceipt(receiptId) : undefined;
  const payment = receipt ? store.payments.find((p) => p.id === receipt.paymentId) : undefined;
  const invoice = receipt ? store.invoices.find((i) => i.id === receipt.invoiceId) : undefined;

  if (!receipt || receipt.organizationId !== orgId) {
    return <div className="aio-billing"><p>Receipt not found.</p><Link to={aioPaths.portalBilling}>← Billing</Link></div>;
  }

  return (
    <div className="aio-billing aio-billing-receipt aio-print-friendly">
      <Link to={aioPaths.portalBilling} className="aio-rr-link no-print">← Billing</Link>
      <header>
        <p className="aio-label">Receipt</p>
        <h1>{receipt.receiptNumber}</h1>
        <p>Paid {new Date(receipt.issuedAt).toLocaleString()}</p>
      </header>
      <dl className="aio-rr-detail-dl">
        <div><dt>Invoice</dt><dd>{invoice?.invoiceNumber ?? receipt.invoiceId}</dd></div>
        <div><dt>Amount Paid</dt><dd>{formatMoney(receipt.amountMinor)}</dd></div>
        <div><dt>Method</dt><dd>{payment?.methodDisplay ?? '—'}</dd></div>
        <div><dt>Reference</dt><dd>{payment?.providerPaymentId ?? payment?.id}</dd></div>
      </dl>
      <BillingLineItemsTable items={receipt.lineItems} />
      <button type="button" className="aio-btn aio-btn--outline no-print" onClick={() => window.print()}>Print Receipt</button>
    </div>
  );
}
