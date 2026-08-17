import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  completeJob,
  getActiveJobsForProvider,
  getAvailableLeadsForProvider,
  getEstimatesForTicket,
  getProviderById,
  getTicketById,
  providerAcceptLead,
  providerDeclineLead,
  submitEstimate,
} from '../../demo/fleetcareActions';
import { DEMO_FLEETCARE_PROVIDER_ID } from '../../demo/fleetcareSeed';
import { FLEETCARE_PRICING_CONFIG, FLEETCARE_TICKET_STATUS_LABELS } from '../../fleetcare/fleetcareConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';
import { AIOLogo } from '../../components/AIOLogo';

function useActiveProviderId(store: ReturnType<typeof useDemoStore>) {
  return store.fleetcareDemoContext?.activeProviderId ?? DEMO_FLEETCARE_PROVIDER_ID;
}

export function FleetCareProviderLayout() {
  return (
    <div className="aio-app aio-fc-provider-shell">
      <header className="aio-fc-provider-header">
        <AIOLogo />
        <nav className="aio-fc-provider-nav" aria-label="Provider portal">
          <Link to={aioPaths.fleetCareProviderPortal}>Dashboard</Link>
          <Link to={aioPaths.fleetCareProviderLeads}>Available Leads</Link>
          <Link to={aioPaths.fleetCareProviderJobs}>My Jobs</Link>
          <Link to={aioPaths.fleetCareProviderEarnings}>Earnings</Link>
          <Link to={aioPaths.fleetCareProviderCompliance}>Compliance</Link>
          <Link to={aioPaths.fleetCareProviderProfile}>Profile</Link>
        </nav>
      </header>
      <main className="aio-fc-provider-main">
        <Outlet />
      </main>
    </div>
  );
}

export function FleetCareProviderDashboardPage() {
  const store = useDemoStore();
  const providerId = useActiveProviderId(store);
  const provider = getProviderById(providerId, store);
  const leads = getAvailableLeadsForProvider(providerId, store);
  const jobs = getActiveJobsForProvider(providerId, store);
  const referrals = (store.fleetcareReferrals ?? []).filter((r) => r.providerId === providerId);

  return (
    <div>
      <h1>{provider?.businessName ?? 'Provider'}</h1>
      <p className="aio-fc-eyebrow">FleetCare Provider Portal</p>
      <div className="aio-fc-provider-metrics">
        <article>
          <h2>{leads.length}</h2>
          <p>Available leads</p>
        </article>
        <article>
          <h2>{jobs.length}</h2>
          <p>Active jobs</p>
        </article>
        <article>
          <h2>{referrals.filter((r) => r.feeStatus === 'calculated').length}</h2>
          <p>Referral fees pending</p>
        </article>
      </div>
    </div>
  );
}

export function FleetCareProviderLeadsPage() {
  const store = useDemoStore();

  const leads = useMemo(() => {
    const searching = (store.fleetcareTickets ?? []).filter(
      (t) => t.status === 'searching' || t.status === 'matched',
    );
    return searching;
  }, [store.fleetcareTickets]);

  return (
    <div>
      <h1>Available leads</h1>
      <p>Limited information until you accept — full job details release after acceptance.</p>
      <ul className="aio-fc-ticket-list">
        {leads.map((t) => (
          <li key={t.id} className="aio-fc-lead-card">
            <Link to={aioPaths.fleetCareProviderLead(t.id)}>
              <strong>{t.serviceCategoryCode}</strong> — {t.urgency} — {t.location.city}, {t.location.stateCode}
            </Link>
          </li>
        ))}
      </ul>
      {!leads.length ? <p>No leads in queue.</p> : null}
    </div>
  );
}

export function FleetCareProviderLeadDetailPage() {
  const { ticketId = '' } = useParams();
  const store = useDemoStore();
  const providerId = useActiveProviderId(store);
  const ticket = getTicketById(ticketId, store);

  if (!ticket) return <p>Lead not found.</p>;

  return (
    <div>
      <h1>Lead review</h1>
      <p>{ticket.issueDescription}</p>
      <dl className="aio-fc-meta">
        <div>
          <dt>Service</dt>
          <dd>{ticket.serviceCategoryCode}</dd>
        </div>
        <div>
          <dt>Area</dt>
          <dd>
            {ticket.location.city}, {ticket.location.stateCode}
          </dd>
        </div>
        <div>
          <dt>Drivable</dt>
          <dd>{ticket.drivableStatus}</dd>
        </div>
        <div>
          <dt>Urgency</dt>
          <dd>{ticket.urgency}</dd>
        </div>
      </dl>
      <div className="aio-fc-actions">
        <button type="button" className="aio-btn aio-btn--gold" onClick={() => providerAcceptLead(ticketId, providerId)}>
          Accept lead
        </button>
        <button type="button" className="aio-btn aio-btn--outline" onClick={() => providerDeclineLead(ticketId, providerId)}>
          Decline
        </button>
      </div>
    </div>
  );
}

export function FleetCareProviderJobsPage() {
  const store = useDemoStore();
  const providerId = useActiveProviderId(store);
  const jobs = getActiveJobsForProvider(providerId, store);

  return (
    <div>
      <h1>My jobs</h1>
      <ul className="aio-fc-ticket-list">
        {jobs.map((t) => (
          <li key={t.id}>
            <Link to={aioPaths.fleetCareProviderJob(t.id)}>
              {t.ticketNumber} — {FLEETCARE_TICKET_STATUS_LABELS[t.status]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FleetCareProviderJobDetailPage() {
  const { ticketId = '' } = useParams();
  const store = useDemoStore();
  const ticket = getTicketById(ticketId, store);
  const [laborHours, setLaborHours] = useState('3');
  const [parts, setParts] = useState('285');

  if (!ticket) return <p>Job not found.</p>;

  const estimates = getEstimatesForTicket(ticketId, store);

  function sendEstimate() {
    submitEstimate(ticketId, ticket!.providerId!, [
      {
        lineType: 'labor',
        description: 'Labor',
        quantity: Number(laborHours),
        unitAmountMinor: 12500,
        totalMinor: Number(laborHours) * 12500,
      },
      {
        lineType: 'parts',
        description: 'Parts',
        quantity: 1,
        unitAmountMinor: Number(parts) * 100,
        totalMinor: Number(parts) * 100,
      },
    ]);
  }

  function markComplete() {
    const est = estimates[estimates.length - 1];
    completeJob(ticketId, est?.totalMinor ?? 50000, 'Repair completed per authorized estimate');
  }

  return (
    <div>
      <h1>Job {ticket.ticketNumber}</h1>
      <p>{ticket.issueDescription}</p>
      <p>Status: {FLEETCARE_TICKET_STATUS_LABELS[ticket.status]}</p>
      {ticket.status === 'provider_accepted' || ticket.status === 'awaiting_estimate' ? (
        <section>
          <h2>Create estimate</h2>
          <label>
            Labor hours
            <input value={laborHours} onChange={(e) => setLaborHours(e.target.value)} />
          </label>
          <label>
            Parts ($)
            <input value={parts} onChange={(e) => setParts(e.target.value)} />
          </label>
          <button type="button" className="aio-btn aio-btn--gold" onClick={sendEstimate}>
            Send estimate
          </button>
        </section>
      ) : null}
      {ticket.status === 'authorized' || ticket.status === 'in_service' ? (
        <button type="button" className="aio-btn aio-btn--gold" onClick={markComplete}>
          Mark completed
        </button>
      ) : null}
    </div>
  );
}

export function FleetCareProviderEarningsPage() {
  const store = useDemoStore();
  const providerId = useActiveProviderId(store);
  const referrals = (store.fleetcareReferrals ?? []).filter((r) => r.providerId === providerId);
  const feeRate = FLEETCARE_PRICING_CONFIG.marketplaceFeeRate;

  return (
    <div>
      <h1>Referral fees</h1>
      <p>AIO-originated completed jobs — fee rate configured at {(feeRate * 100).toFixed(0)}% (not applied to pre-existing customers).</p>
      <table className="aio-fc-table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Gross</th>
            <th>Fee</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((r) => (
            <tr key={r.id}>
              <td>{r.ticketId}</td>
              <td>{formatMoney(r.grossServiceValueMinor)}</td>
              <td>{formatMoney(r.feeAmountMinor)}</td>
              <td>{r.feeStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FleetCareProviderCompliancePage() {
  const store = useDemoStore();
  const providerId = useActiveProviderId(store);
  const insurance = store.fleetcareProviderInsurance?.filter((i) => i.providerId === providerId) ?? [];
  const credentials = store.fleetcareProviderCredentials?.filter((c) => c.providerId === providerId) ?? [];
  const provider = getProviderById(providerId, store);

  return (
    <div>
      <h1>Compliance</h1>
      <p>Verification: {provider?.verificationStatus}</p>
      <h2>Insurance</h2>
      <ul>
        {insurance.map((i) => (
          <li key={i.id}>
            {i.coverageType} — expires {i.expirationDate ?? 'n/a'} ({i.verificationStatus})
          </li>
        ))}
      </ul>
      <h2>Credentials</h2>
      {credentials.length ? (
        <ul>
          {credentials.map((c) => (
            <li key={c.id}>
              {c.credentialType} — {c.jurisdiction ?? 'n/a'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No credentials on file.</p>
      )}
    </div>
  );
}

export function FleetCareProviderProfilePage() {
  const store = useDemoStore();
  const providerId = useActiveProviderId(store);
  const provider = getProviderById(providerId, store);
  if (!provider) return null;

  return (
    <div>
      <h1>Profile & service area</h1>
      <dl className="aio-fc-meta">
        <div>
          <dt>Business</dt>
          <dd>{provider.businessName}</dd>
        </div>
        <div>
          <dt>Mobile service</dt>
          <dd>{provider.mobileServiceAvailable ? 'Yes' : 'No'}</dd>
        </div>
        <div>
          <dt>Services</dt>
          <dd>{provider.serviceCategoryCodes.join(', ')}</dd>
        </div>
        <div>
          <dt>Tier</dt>
          <dd>{provider.providerTier}</dd>
        </div>
      </dl>
    </div>
  );
}
