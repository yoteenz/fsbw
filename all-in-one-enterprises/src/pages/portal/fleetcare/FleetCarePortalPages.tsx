import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../../demo/useDemoStore';
import {
  authorizeEstimate,
  getEstimatesForTicket,
  getOrganizationId,
  getRepairRecordsForVehicle,
  getTicketById,
  getTicketsForOrg,
  submitMaintenanceTicket,
} from '../../../demo/fleetcareActions';
import { getFleetUnits } from '../../../demo/roadReadyActions';
import {
  FLEETCARE_SERVICE_CATEGORIES,
  FLEETCARE_TICKET_STATUS_LABELS,
  getClientStatusMessage,
} from '../../../fleetcare/fleetcareConfig';
import { IndependentProviderDisclosure } from '../../../components/fleetcare/FleetCareDisclosures';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';
import { AIOButton } from '../../../components/AIOButton';

export function FleetCareHomePage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const tickets = getTicketsForOrg(orgId, store);
  const open = tickets.filter((t) => !['completed', 'closed', 'cancelled'].includes(t.status));

  return (
    <div className="aio-fc-portal">
      <header className="aio-fc-portal__hero">
        <h1>FleetCare</h1>
        <p>Truck maintenance & repair — matched with independent network providers.</p>
        <AIOButton to={aioPaths.portalFleetCareRequest} variant="gold" showArrow>
          Request Service
        </AIOButton>
      </header>
      <IndependentProviderDisclosure />
      <section>
        <h2>Open requests ({open.length})</h2>
        {open.length === 0 ? (
          <p>No open maintenance requests.</p>
        ) : (
          <ul className="aio-fc-ticket-list">
            {open.map((t) => (
              <li key={t.id}>
                <Link to={aioPaths.portalFleetCareTicket(t.id)}>
                  <strong>{t.ticketNumber}</strong> — {FLEETCARE_TICKET_STATUS_LABELS[t.status]}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function FleetCareRequestPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const units = getFleetUnits(orgId, store);
  const navigate = useNavigate();
  const [vehicleId, setVehicleId] = useState(units[0]?.id ?? '');
  const [serviceCategoryCode, setServiceCategoryCode] = useState('brakes');
  const [issueDescription, setIssueDescription] = useState('');
  const [drivableStatus, setDrivableStatus] = useState<'yes' | 'no' | 'unknown'>('yes');
  const [urgency, setUrgency] = useState<'routine' | 'soon' | 'today' | 'roadside_urgent'>('routine');
  const [city, setCity] = useState('Columbus');
  const [stateCode, setStateCode] = useState('OH');

  const enabledCategories = FLEETCARE_SERVICE_CATEGORIES.filter((c) => c.enabled);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ticket = submitMaintenanceTicket({
      organizationId: orgId,
      vehicleId,
      serviceCategoryCode,
      issueDescription,
      drivableStatus,
      urgency,
      location: { city, stateCode },
    });
    navigate(aioPaths.portalFleetCareTicket(ticket.id));
  }

  return (
    <div className="aio-fc-portal">
      <h1>Request maintenance & repair</h1>
      <form className="aio-fc-form" onSubmit={handleSubmit}>
        <label>
          Vehicle
          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nickname ?? u.id} — {u.year} {u.make} {u.model}
              </option>
            ))}
          </select>
        </label>
        <label>
          Service type
          <select value={serviceCategoryCode} onChange={(e) => setServiceCategoryCode(e.target.value)}>
            {enabledCategories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Describe the issue
          <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} required rows={4} />
        </label>
        <fieldset>
          <legend>Is the vehicle drivable?</legend>
          {(['yes', 'no', 'unknown'] as const).map((v) => (
            <label key={v} className="aio-fc-inline">
              <input type="radio" name="drivable" checked={drivableStatus === v} onChange={() => setDrivableStatus(v)} />
              {v}
            </label>
          ))}
        </fieldset>
        <label>
          Urgency
          <select value={urgency} onChange={(e) => setUrgency(e.target.value as typeof urgency)}>
            <option value="routine">Routine</option>
            <option value="soon">Soon</option>
            <option value="today">Today</option>
            <option value="roadside_urgent">Roadside / Urgent</option>
          </select>
        </label>
        <label>
          City
          <input value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label>
          State
          <input value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase())} maxLength={2} />
        </label>
        <button type="submit" className="aio-btn aio-btn--gold">
          Submit service request
        </button>
      </form>
    </div>
  );
}

export function FleetCareTicketDetailPage() {
  const { ticketId = '' } = useParams();
  const store = useDemoStore();
  const ticket = getTicketById(ticketId, store);
  const estimates = ticket ? getEstimatesForTicket(ticket.id, store) : [];
  const latestEstimate = estimates[estimates.length - 1];
  const unit = store.powerUnits.find((u) => u.id === ticket?.vehicleId);
  const provider = store.fleetcareProviders?.find((p) => p.id === ticket?.providerId);

  if (!ticket) return <p>Ticket not found.</p>;

  const statusMsg = getClientStatusMessage(ticket.status, ticket.urgency);

  return (
    <div className="aio-fc-portal">
      <p className="aio-fc-eyebrow">{ticket.ticketNumber}</p>
      <h1>{statusMsg}</h1>
      <p>{ticket.issueDescription}</p>
      <dl className="aio-fc-meta">
        <div>
          <dt>Vehicle</dt>
          <dd>{unit?.nickname ?? ticket.vehicleId}</dd>
        </div>
        <div>
          <dt>Urgency</dt>
          <dd>{ticket.urgency}</dd>
        </div>
        {provider && ticket.customerContactReleased ? (
          <div>
            <dt>Network provider</dt>
            <dd>{provider.businessName}</dd>
          </div>
        ) : null}
      </dl>

      {latestEstimate && ticket.status === 'estimate_sent' ? (
        <section className="aio-fc-estimate">
          <h2>Estimate ready</h2>
          <p className="aio-fc-estimate__total">{formatMoney(latestEstimate.totalMinor)}</p>
          <ul>
            {latestEstimate.lineItems.map((li) => (
              <li key={li.id}>
                {li.description}: {formatMoney(li.totalMinor)}
              </li>
            ))}
          </ul>
          <div className="aio-fc-actions">
            <button type="button" className="aio-btn aio-btn--gold" onClick={() => authorizeEstimate(ticket.id, latestEstimate.id, 'approve')}>
              Approve estimate
            </button>
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => authorizeEstimate(ticket.id, latestEstimate.id, 'decline')}>
              Decline
            </button>
          </div>
        </section>
      ) : null}

      <Link to={aioPaths.portalFleetCare}>← Back to FleetCare</Link>
    </div>
  );
}

export function FleetCareVehicleHistoryPage() {
  const { vehicleId = '' } = useParams();
  const store = useDemoStore();
  const unit = store.powerUnits.find((u) => u.id === vehicleId);
  const records = useMemo(() => getRepairRecordsForVehicle(vehicleId, store), [vehicleId, store]);

  return (
    <div className="aio-fc-portal">
      <h1>Maintenance history</h1>
      <p>{unit?.year} {unit?.make} {unit?.model} — {unit?.nickname}</p>
      {records.length === 0 ? (
        <p>No FleetCare repair records yet.</p>
      ) : (
        <ul className="aio-fc-history">
          {records.map((r) => (
            <li key={r.id}>
              <strong>{new Date(r.completedAt).toLocaleDateString()}</strong> — {r.summary}
              {r.mileageAtService ? ` @ ${r.mileageAtService.toLocaleString()} mi` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
