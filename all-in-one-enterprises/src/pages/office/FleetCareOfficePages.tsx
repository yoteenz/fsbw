import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { FLEETCARE_TICKET_STATUS_LABELS } from '../../fleetcare/fleetcareConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

export function FleetCareOfficeOverviewPage() {
  const store = useDemoStore();
  const tickets = store.fleetcareTickets ?? [];
  const providers = store.fleetcareProviders ?? [];
  const referrals = store.fleetcareReferrals ?? [];

  const metrics = {
    open: tickets.filter((t) => !['closed', 'cancelled', 'completed', 'customer_confirmed'].includes(t.status)).length,
    searching: tickets.filter((t) => t.status === 'searching').length,
    awaitingEstimate: tickets.filter((t) => ['awaiting_estimate', 'estimate_sent', 'awaiting_customer_authorization'].includes(t.status)).length,
    active: tickets.filter((t) => ['authorized', 'scheduled', 'in_service', 'awaiting_parts'].includes(t.status)).length,
    completed: tickets.filter((t) => ['completed', 'customer_confirmed'].includes(t.status)).length,
    referralRevenue: referrals.reduce((s, r) => s + (r.feeStatus !== 'waived' ? r.feeAmountMinor : 0), 0),
  };

  return (
    <div className="aio-fc-office">
      <h1>FleetCare Network</h1>
      <div className="aio-fc-provider-metrics">
        <article><h2>{metrics.open}</h2><p>Open tickets</p></article>
        <article><h2>{metrics.searching}</h2><p>Searching</p></article>
        <article><h2>{metrics.awaitingEstimate}</h2><p>Awaiting estimate/auth</p></article>
        <article><h2>{metrics.active}</h2><p>Active jobs</p></article>
        <article><h2>{formatMoney(metrics.referralRevenue)}</h2><p>Referral fees (calculated)</p></article>
        <article><h2>{providers.length}</h2><p>Providers</p></article>
      </div>
      <nav className="aio-fc-office-links">
        <Link to={aioPaths.officeFleetCareTickets}>Maintenance tickets</Link>
        <Link to={aioPaths.officeFleetCareProviders}>Provider network</Link>
        <Link to={aioPaths.officeFleetCareReferrals}>Referral revenue</Link>
      </nav>
    </div>
  );
}

export function FleetCareOfficeTicketsPage() {
  const store = useDemoStore();
  const tickets = store.fleetcareTickets ?? [];

  return (
    <div className="aio-fc-office">
      <h1>Maintenance tickets</h1>
      <table className="aio-fc-table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Client</th>
            <th>Status</th>
            <th>Urgency</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>{t.ticketNumber}</td>
              <td>{t.clientOrganizationId}</td>
              <td>{FLEETCARE_TICKET_STATUS_LABELS[t.status]}</td>
              <td>{t.urgency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FleetCareOfficeProvidersPage() {
  const store = useDemoStore();
  const providers = store.fleetcareProviders ?? [];

  return (
    <div className="aio-fc-office">
      <h1>Provider network</h1>
      <ul>
        {providers.map((p) => (
          <li key={p.id}>
            <strong>{p.businessName}</strong> — {p.verificationStatus} — {p.applicationStatus}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FleetCareOfficeReferralsPage() {
  const store = useDemoStore();
  const referrals = store.fleetcareReferrals ?? [];

  return (
    <div className="aio-fc-office">
      <h1>Referral revenue</h1>
      <table className="aio-fc-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>AIO originated</th>
            <th>Pre-existing</th>
            <th>Fee</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((r) => (
            <tr key={r.id}>
              <td>{r.providerId}</td>
              <td>{r.aioOriginated ? 'Yes' : 'No'}</td>
              <td>{r.preexistingRelationship ? 'Yes' : 'No'}</td>
              <td>{formatMoney(r.feeAmountMinor)}</td>
              <td>{r.feeStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
