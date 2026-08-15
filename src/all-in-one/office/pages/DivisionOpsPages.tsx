import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  updateLoadStatus,
  sendLoadToFactoring,
  updateFactoringStatus,
  updateBrokerageQuoteStatus,
  getOfficeMetrics,
  getStaffWorkload,
} from '../../demo/demoActions';
import { aioPaths } from '../../utils/paths';

type Props = { division: string; title: string };

export function DivisionQueuePage({ division, title }: Props) {
  const store = useDemoStore();
  const requests = store.requests.filter((r) => r.division === division);
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>{title}</h1><p>{requests.length} open items</p></header>
      {requests.map((r) => {
        const client = store.clients.find((c) => c.id === r.clientId);
        return (
          <Link key={r.id} to={aioPaths.officeRequest(r.id)} className="aio-office-list-row">
            <span>{r.requestNumber} — {client?.companyName}</span>
            <span className="aio-badge aio-badge--progress">{r.statusLabel}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function DispatchCenterPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Dispatch Center</h1></header>
      <h2 className="aio-office-subheading">Active Loads</h2>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead><tr><th>Load</th><th>Lane</th><th>Rate</th><th>Miles</th><th>Status</th><th>Docs</th></tr></thead>
          <tbody>
            {store.loads.map((l) => (
              <tr key={l.id}>
                <td><Link to={aioPaths.officeLoad(l.id)}>{l.loadNumber}</Link></td>
                <td>{l.origin} → {l.destination}</td>
                <td>${l.rate}</td>
                <td>{l.miles}</td>
                <td>{l.status}</td>
                <td>{[l.hasRateCon && 'RC', l.hasPod && 'POD', l.hasInvoice && 'INV'].filter(Boolean).join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LoadDetailPage() {
  const { loadId } = useParams<{ loadId: string }>();
  const store = useDemoStore();
  const load = store.loads.find((l) => l.id === loadId);
  if (!load) return <p>Load not found.</p>;

  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeDispatch} className="aio-office-link">← Dispatch</Link>
      <h1>{load.loadNumber}</h1>
      <dl className="aio-office-dl">
        <dt>Carrier</dt><dd>{load.carrierName}</dd>
        <dt>Lane</dt><dd>{load.origin} → {load.destination}</dd>
        <dt>Rate / Mile</dt><dd>${load.rate} / ${(load.rate / load.miles).toFixed(2)}</dd>
        <dt>Status</dt><dd>{load.status}</dd>
      </dl>
      <div className="aio-office-action-bar">
        <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => updateLoadStatus(load.id, 'in_transit')}>Mark In Transit</button>
        <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => updateLoadStatus(load.id, 'delivered')}>Mark Delivered</button>
      </div>
      {load.factoringEligible && (
        <section className="aio-office-panel aio-office-panel--highlight">
          <h2>Factoring Options</h2>
          <p>Eligible for Factoring Review — illustrative only.</p>
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => sendLoadToFactoring(load.id)}>Send to Factoring</button>
        </section>
      )}
    </div>
  );
}

export function FactoringOpsPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Factoring Operations</h1><p>Mock review only — no funding</p></header>
      {store.factoringSubmissions.map((f) => (
        <div key={f.id} className="aio-office-panel">
          <h3>{f.carrierName} · ${f.invoiceAmount.toLocaleString()}</h3>
          <p>Status: {f.statusLabel} · Eligibility: {f.eligibilityStatus}</p>
          <p className="aio-prototype-note">Sample fee: ${f.estimatedFee} · Sample net: ${f.estimatedNet}</p>
          <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => updateFactoringStatus(f.id, 'partner_review')}>Update Demo Status</button>
        </div>
      ))}
    </div>
  );
}

export function BrokerageOpsPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Brokerage Operations</h1></header>
      <h2 className="aio-office-subheading">Quote Requests</h2>
      {store.brokerageQuotes.map((q) => (
        <div key={q.id} className="aio-office-list-row">
          <span>{q.shipperName}: {q.origin} → {q.destination}</span>
          <span>{q.status}</span>
          <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => updateBrokerageQuoteStatus(q.id, 'quote_prepared')}>Prepare Quote</button>
        </div>
      ))}
      <h2 className="aio-office-subheading">Active Shipments</h2>
      {store.shipments.map((s) => (
        <Link key={s.id} to={aioPaths.officeShipment(s.id)} className="aio-office-list-row">{s.shipmentNumber} — {s.status}</Link>
      ))}
    </div>
  );
}

export function ShipmentDetailPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const store = useDemoStore();
  const ship = store.shipments.find((s) => s.id === shipmentId);
  if (!ship) return <p>Shipment not found.</p>;
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBrokerage} className="aio-office-link">← Brokerage</Link>
      <h1>{ship.shipmentNumber}</h1>
      <p>{ship.shipperName} · {ship.origin} → {ship.destination}</p>
      <p>Status: {ship.status} · Carrier: {ship.carrier ?? 'Pending assignment'}</p>
    </div>
  );
}

export function PaymentsPage() {
  const store = useDemoStore();
  const payments = store.invoices
    .filter((inv) => inv.status === 'paid' || inv.status === 'sent')
    .map((inv) => {
      const client = store.clients.find((c) => c.id === inv.clientId);
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: client?.companyName ?? 'Unknown',
        amount: inv.amount,
        status: inv.status === 'paid' ? 'Recorded (mock)' : 'Pending (mock)',
        method: inv.status === 'paid' ? 'Check · demo' : '—',
        paidAt: inv.status === 'paid' ? inv.issuedAt : '—',
      };
    });

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Payments</h1>
        <p>Future-state preview only — no payment processing, cards, ACH, or bank data</p>
      </header>
      <p className="aio-prototype-note">
        Production will require secure payment partners, PCI scope minimization, and audit logging. This page shows illustrative payment records linked to mock invoices.
      </p>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.invoiceNumber}</td>
                <td>{p.clientName}</td>
                <td>${p.amount}</td>
                <td>{p.method}</td>
                <td>{p.status}</td>
                <td>{p.paidAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Invoices</h1><p>Financial preview · mock/demo amounts</p></header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead><tr><th>Invoice</th><th>Client</th><th>Service</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
          <tbody>
            {store.invoices.map((inv) => {
              const client = store.clients.find((c) => c.id === inv.clientId);
              return (
                <tr key={inv.id}><td>{inv.invoiceNumber}</td><td>{client?.companyName}</td><td>{inv.service}</td><td>${inv.amount}</td><td>{inv.status}</td><td>{inv.dueAt}</td></tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TeamPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Team</h1></header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead><tr><th>Name</th><th>Role</th><th>Workload</th><th>Status</th></tr></thead>
          <tbody>
            {store.staff.map((s) => (
              <tr key={s.id}><td>{s.name}</td><td>{s.role}</td><td>{getStaffWorkload(s.id)} items</td><td>{s.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const store = useDemoStore();
  const metrics = getOfficeMetrics();
  const docsReview = store.documents.filter((d) => ['uploaded', 'under_review'].includes(d.status)).length;
  const renewalsMonth = store.renewals.filter((r) => r.status !== 'completed').length;
  const expired = store.documents.filter((d) => d.isCurrent && d.expiresAt && new Date(d.expiresAt) < new Date()).length;
  const clientResponse = store.documents.filter((d) => d.status === 'requested' || d.status === 'rejected').length;
  const renewalsComplete = store.renewals.filter((r) => r.status === 'completed').length;

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Reports</h1><p>Sprint 06 management preview · demo/staging labels</p></header>
      <div className="aio-office-metrics">
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{docsReview}</span><span className="aio-office-metric-card__label">Documents Awaiting Review</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{renewalsMonth}</span><span className="aio-office-metric-card__label">Renewals This Month (active)</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{expired}</span><span className="aio-office-metric-card__label">Expired Credentials</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{renewalsComplete}</span><span className="aio-office-metric-card__label">Renewal Completions</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{clientResponse}</span><span className="aio-office-metric-card__label">Client Response Needed</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{store.clients.length}</span><span className="aio-office-metric-card__label">Active Clients</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.inProgress}</span><span className="aio-office-metric-card__label">In Progress</span></div>
      </div>
    </div>
  );
}
