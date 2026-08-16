import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  updateBrokerageQuoteStatus,
  getStaffWorkload,
} from '../../demo/demoActions';
import { getPayments } from '../../demo/billingActions';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';
import { ManagementReportsCenterPage } from './ManagementPages';

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

export function FactoringOpsPage() {
  return null;
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
  const payments = getPayments().map((p) => {
    const client = store.clients.find((c) => c.id === p.organizationId);
    const invoice = store.invoices.find((i) => i.id === p.invoiceId);
    return {
      id: p.id,
      invoiceNumber: invoice?.invoiceNumber ?? p.invoiceId,
      clientName: client?.companyName ?? 'Unknown',
      amount: p.amountMinor,
      status: p.status.replace(/_/g, ' '),
      method: p.methodDisplay ?? '—',
      paidAt: p.processedAt ? new Date(p.processedAt).toLocaleDateString() : '—',
      provider: p.provider,
    };
  });

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Payments</h1>
        <p>Payment activity · demo mode simulates provider confirmation</p>
      </header>
      <p className="aio-prototype-note">
        Production will require secure payment partners, PCI scope minimization, and audit logging. Demo mode simulates payment without card data.
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
              <th>Provider</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.invoiceNumber}</td>
                <td>{p.clientName}</td>
                <td>{formatMoney(p.amount)}</td>
                <td>{p.method}</td>
                <td>{p.status}</td>
                <td>{p.provider}</td>
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
      <header className="aio-office-page__header">
        <h1>Invoices</h1>
        <p>Service billing · <Link to={aioPaths.officeBilling}>Billing Center →</Link></p>
      </header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead><tr><th>Invoice</th><th>Client</th><th>Service</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Due</th></tr></thead>
          <tbody>
            {store.invoices.map((inv) => {
              const client = store.clients.find((c) => c.id === inv.organizationId);
              return (
                <tr key={inv.id}>
                  <td><Link to={aioPaths.officeInvoice(inv.id)}>{inv.invoiceNumber}</Link></td>
                  <td>{client?.companyName}</td>
                  <td>{inv.serviceTitle}</td>
                  <td>{formatMoney(inv.totalMinor)}</td>
                  <td>{formatMoney(inv.amountPaidMinor)}</td>
                  <td>{formatMoney(inv.balanceDueMinor)}</td>
                  <td>{inv.status.replace(/_/g, ' ')}</td>
                  <td>{inv.dueAt ?? '—'}</td>
                </tr>
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
  return <ManagementReportsCenterPage />;
}
