import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getInvoice, getOrganizationId, getReceipts } from '../../demo/billingActions';
import { BillingFeeSummary, BillingLineItemsTable } from '../../components/BillingDisplay';
import { formatMoney } from '../../billing/money';
import { canAcceptPayment } from '../../billing/billingCalculator';
import { aioPaths } from '../../utils/paths';

export function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const invoice = invoiceId ? getInvoice(invoiceId) : undefined;
  const receipt = invoice ? getReceipts(orgId, store).find((r) => r.invoiceId === invoice.id) : undefined;

  if (!invoice || invoice.organizationId !== orgId) {
    return <div className="aio-billing"><p>Invoice not found.</p><Link to={aioPaths.portalBilling}>← Billing</Link></div>;
  }

  const payable = canAcceptPayment(invoice.status, invoice.balanceDueMinor);

  return (
    <div className="aio-billing aio-billing-detail">
      <Link to={aioPaths.portalBilling} className="aio-rr-link">← Billing</Link>
      <header>
        <p className="aio-label">{invoice.invoiceNumber}</p>
        <h1>{invoice.serviceTitle}</h1>
        <p>Status: {invoice.status.replace(/_/g, ' ')} · Due {invoice.dueAt ?? '—'}</p>
        {invoice.serviceRequestId && <Link to={aioPaths.portalRequest(invoice.serviceRequestId)}>Related request →</Link>}
      </header>

      <BillingLineItemsTable items={invoice.lineItems} />
      <BillingFeeSummary version={invoice} />

      <dl className="aio-rr-detail-dl">
        <div><dt>Total</dt><dd>{formatMoney(invoice.totalMinor)}</dd></div>
        <div><dt>Paid</dt><dd>{formatMoney(invoice.amountPaidMinor)}</dd></div>
        <div><dt>Balance Due</dt><dd><strong>{formatMoney(invoice.balanceDueMinor)}</strong></dd></div>
      </dl>

      <div className="aio-billing-actions">
        {payable && <Link to={aioPaths.portalPay(invoice.id)} className="aio-btn aio-btn--gold">Pay {formatMoney(invoice.balanceDueMinor)}</Link>}
        {receipt && <Link to={aioPaths.portalReceipt(receipt.id)} className="aio-btn aio-btn--outline">View Receipt</Link>}
        <Link to={aioPaths.contact} className="aio-btn aio-btn--outline">Message All In One</Link>
      </div>
    </div>
  );
}
