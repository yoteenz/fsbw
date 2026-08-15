import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../../demo/useDemoStore';
import { getOrganizationId } from '../../../demo/factoringActions';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';

export function FreightInvoicePrintPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const inv = store.freightInvoices.find((f) => f.id === invoiceId && f.organizationId === orgId);
  const load = inv ? store.loads.find((l) => l.id === inv.loadId) : undefined;
  const rr = store.roadReadyProfiles.find((p) => p.organizationId === orgId);
  const client = store.clients.find((c) => c.id === orgId);

  if (!inv) return <p>Freight invoice not found.</p>;

  return (
    <div className="aio-factoring aio-factoring-invoice-print">
      <Link to={aioPaths.portalFactoring} className="aio-rr-link no-print">← Factoring</Link>
      <article className="aio-freight-invoice-doc">
        <header>
          <h1>Freight Invoice</h1>
          <p className="aio-prototype-note no-print">Carrier receivable — not an All In One service invoice.</p>
        </header>
        <section>
          <h2>Bill From</h2>
          <p>{rr?.business?.legalName ?? client?.companyName}</p>
          <p>USDOT {rr?.authority?.usdotNumber ?? '—'} · MC {rr?.authority?.mcNumber ?? '—'}</p>
        </section>
        <section>
          <h2>Bill To</h2>
          <p>{inv.debtorName}</p>
        </section>
        <dl className="aio-factoring-confirm">
          <div><dt>Invoice #</dt><dd>{inv.invoiceNumber}</dd></div>
          <div><dt>Invoice Date</dt><dd>{inv.invoiceDate}</dd></div>
          <div><dt>Load #</dt><dd>{load?.loadNumber ?? inv.loadId}</dd></div>
          <div><dt>Route</dt><dd>{load ? `${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState}` : '—'}</dd></div>
          <div><dt>Amount Due</dt><dd>{formatMoney(inv.amountMinor)}</dd></div>
        </dl>
        <section>
          <h2>Supporting Documents</h2>
          <ul>
            <li>Rate Confirmation: {inv.rateConfirmationDocumentId ? 'Attached' : '—'}</li>
            <li>BOL: {inv.bolDocumentId ? 'Attached' : '—'}</li>
            <li>POD: {inv.podDocumentId ? 'Attached' : '—'}</li>
          </ul>
        </section>
        <button type="button" className="aio-btn aio-btn--outline no-print" onClick={() => window.print()}>Print</button>
      </article>
    </div>
  );
}
