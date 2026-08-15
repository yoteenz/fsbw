import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  getOrganizationId,
  getRenewals,
  markRenewalSelfManaged,
  startRenewalWithAio,
} from '../../demo/vaultActions';
import { formatDaysRemaining } from '../../calendar/calendarService';
import { aioPaths } from '../../utils/paths';

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  available: 'Available',
  customer_action_needed: 'Action Needed',
  in_progress: 'In Progress',
  self_managed: 'Self-Managed',
  completed: 'Completed',
  documents_needed: 'Documents Needed',
};

export function RenewalsPage() {
  const store = useDemoStore();
  const navigate = useNavigate();
  const orgId = getOrganizationId(store);
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');

  const renewals = useMemo(() => {
    const list = getRenewals(orgId, store);
    if (filter === 'active') return list.filter((r) => !['completed', 'declined', 'not_applicable'].includes(r.status));
    if (filter === 'completed') return list.filter((r) => r.status === 'completed');
    return list;
  }, [orgId, filter, store.renewals]);

  const handleStart = (renewalId: string) => {
    const reqId = startRenewalWithAio(renewalId, orgId);
    navigate(aioPaths.portalRequest(reqId));
  };

  return (
    <div className="aio-renewals">
      <header className="aio-renewals__header">
        <h1>Renewal Center</h1>
        <p>What we&apos;re doing about upcoming expirations — start a renewal with All In One or manage it yourself.</p>
      </header>

      <div className="aio-renewals-toolbar">
        <select className="aio-intake-input" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filter renewals">
          <option value="active">Active &amp; Upcoming</option>
          <option value="completed">Completed History</option>
          <option value="all">All</option>
        </select>
        <Link to={aioPaths.portalCalendar} className="aio-rr-link">View Calendar →</Link>
      </div>

      {renewals.length === 0 ? (
        <div className="aio-empty-state">
          <p className="aio-empty-state__text">No renewals in this view.</p>
          <p className="aio-prototype-note">Renewals appear when verified credentials enter their renewal window.</p>
        </div>
      ) : (
        <ul className="aio-renewals-grid">
          {renewals.map((r) => (
            <li key={r.id} className="aio-renewal-card">
              <p className="aio-label">{r.renewalType.toUpperCase()}</p>
              <h2>{r.title}</h2>
              {r.vehicleLabel && <p>{r.vehicleLabel}</p>}
              <p>Expires {r.expirationDate} · <strong>{formatDaysRemaining(r.expirationDate)}</strong></p>
              <span className="aio-badge aio-badge--progress">{STATUS_LABELS[r.status] ?? r.status.replace(/_/g, ' ')}</span>
              {r.requiredDocumentTypes && r.requiredDocumentTypes.length > 0 && (
                <p className="aio-renewal-card__docs">Documents: {r.requiredDocumentTypes.join(', ')}</p>
              )}
              <p className="aio-prototype-note">Pricing determined after review</p>
              <div className="aio-renewal-card__actions">
                {!['completed', 'self_managed', 'in_progress', 'declined'].includes(r.status) && (
                  <>
                    <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => handleStart(r.id)}>
                      Start Renewal
                    </button>
                    <button
                      type="button"
                      className="aio-btn aio-btn--outline aio-btn--sm"
                      onClick={() => markRenewalSelfManaged(r.id, orgId)}
                    >
                      I&apos;m Handling This Myself
                    </button>
                  </>
                )}
                {r.status === 'self_managed' && (
                  <Link to={aioPaths.portalVault} className="aio-btn aio-btn--outline aio-btn--sm">Upload Renewed Document</Link>
                )}
                {r.serviceRequestId && (
                  <Link to={aioPaths.portalRequest(r.serviceRequestId)} className="aio-btn aio-btn--outline aio-btn--sm">View Request</Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
