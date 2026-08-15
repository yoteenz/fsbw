import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { getInvoice, getOrganizationId, getPaymentModeLabel, simulateInvoicePayment } from '../../demo/billingActions';
import { BillingFeeSummary } from '../../components/BillingDisplay';
import { formatMoney } from '../../billing/money';
import { getPaymentProviderMode } from '../../billing/paymentProvider';
import { aioPaths } from '../../utils/paths';

export function PayInvoicePage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const invoice = invoiceId ? getInvoice(invoiceId) : undefined;
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mode = getPaymentProviderMode();

  if (!invoice || invoice.organizationId !== orgId) {
    return <div className="aio-billing"><p>Invoice not found.</p></div>;
  }

  const handlePay = async (outcome: 'success' | 'failure' | 'cancel') => {
    setProcessing(true);
    setError(null);
    const result = await simulateInvoicePayment(invoice.id, orgId, outcome);
    setProcessing(false);
    if (result.ok && result.receiptId) {
      window.location.href = aioPaths.portalReceipt(result.receiptId);
      return;
    }
    setError(result.message ?? 'Payment failed');
  };

  return (
    <div className="aio-billing aio-billing-checkout">
      <Link to={aioPaths.portalInvoice(invoice.id)} className="aio-rr-link">← Invoice</Link>
      <header>
        <h1>Pay Invoice</h1>
        <p>{invoice.invoiceNumber} · {invoice.serviceTitle}</p>
        <p className="aio-billing-balance__amount">{formatMoney(invoice.balanceDueMinor)}</p>
      </header>

      <BillingFeeSummary version={invoice} />

      {mode === 'disabled' ? (
        <p className="aio-prototype-note">Online payment not yet available. Contact All In One for payment options.</p>
      ) : mode === 'demo' ? (
        <section className="aio-billing-demo-pay" role="region" aria-label="Demo payment">
          <p className="aio-prototype-note"><strong>DEMO MODE</strong> — {getPaymentModeLabel()}. No card required.</p>
          <div className="aio-billing-actions">
            <button type="button" className="aio-btn aio-btn--gold" disabled={processing} onClick={() => handlePay('success')}>
              {processing ? 'Processing…' : `Simulate Payment — ${formatMoney(invoice.balanceDueMinor)}`}
            </button>
            <button type="button" className="aio-btn aio-btn--outline" disabled={processing} onClick={() => handlePay('failure')}>Simulate Failure</button>
            <button type="button" className="aio-btn aio-btn--outline" disabled={processing} onClick={() => handlePay('cancel')}>Cancel</button>
          </div>
        </section>
      ) : (
        <p className="aio-prototype-note">Payment provider placeholder — configure server integration for production.</p>
      )}

      {error && <p className="aio-vault-rejection" role="alert">{error}</p>}
    </div>
  );
}
