import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useRoadReady } from '../../road-ready/useRoadReady';
import { useDemoStore } from '../../demo/useDemoStore';
import { getOrganizationId, getVaultDocuments } from '../../demo/vaultActions';
import { formatDaysRemaining } from '../../calendar/calendarService';
import { RoadReadyStatusBadge } from '../../components/RoadReadyStatusBadge';
import { maskVin } from '../../road-ready/roadReadyScoring';
import { aioPaths } from '../../utils/paths';

function docStatusForVehicle(docs: ReturnType<typeof getVaultDocuments>, vehicleId: string, type: string) {
  const match = docs.find(
    (d) =>
      d.isCurrent &&
      (d.relatedEntityId === vehicleId || d.relatedVehicle === vehicleId) &&
      (d.documentType.toLowerCase().includes(type) || d.category.includes(type)),
  );
  if (!match) return { label: 'Missing', tone: 'needed' as const };
  if (match.status === 'requested') return { label: 'Needed', tone: 'needed' as const };
  if (match.verificationStatus !== 'verified') return { label: 'Review', tone: 'progress' as const };
  if (match.expiresAt) {
    const days = formatDaysRemaining(match.expiresAt.slice(0, 10));
    if (days.includes('overdue')) return { label: 'Expired', tone: 'alert' as const };
    if (days.includes('30') || days.includes('14') || days.includes('7')) return { label: 'Expiring', tone: 'progress' as const };
  }
  return { label: 'Current', tone: 'complete' as const };
}

export function FleetPage() {
  const { units, trailers, drivers, isShipper } = useRoadReady();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const docs = useMemo(() => getVaultDocuments(orgId, store), [orgId, store.documents]);

  if (isShipper) {
    return (
      <div className="aio-road-ready">
        <h1>Fleet</h1>
        <p>Fleet management is available for carrier accounts.</p>
        <Link to={aioPaths.portal} className="aio-btn aio-btn--gold">Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="aio-road-ready aio-fleet">
      <header className="aio-fleet__header">
        <h1>Fleet Profile</h1>
        <p>Power units, compliance documents, and renewal status at a glance.</p>
        <Link to={aioPaths.portalOnboarding} className="aio-btn aio-btn--outline aio-btn--sm">Add via Onboarding</Link>
      </header>

      <section className="aio-fleet-section">
        <h2>Compliance Matrix</h2>
        <div className="aio-fleet-matrix aio-fleet-matrix--desktop">
          <table className="aio-office-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Registration</th>
                <th>IRP</th>
                <th>Insurance</th>
                <th>Permit</th>
                <th>Road Ready</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => {
                const reg = docStatusForVehicle(docs, u.id, 'registration');
                const irp = docStatusForVehicle(docs, u.id, 'irp');
                const ins = docStatusForVehicle(docs, u.id, 'insurance');
                const permit = docStatusForVehicle(docs, u.id, 'permit');
                return (
                  <tr key={u.id}>
                    <td><Link to={aioPaths.portalVehicle(u.id)}>{u.nickname}</Link></td>
                    <td><span className={`aio-badge aio-badge--${reg.tone}`}>{reg.label}</span></td>
                    <td><span className={`aio-badge aio-badge--${irp.tone}`}>{irp.label}</span></td>
                    <td><span className={`aio-badge aio-badge--${ins.tone}`}>{ins.label}</span></td>
                    <td><span className={`aio-badge aio-badge--${permit.tone}`}>{permit.label}</span></td>
                    <td>
                      {u.readiness && (
                        <RoadReadyStatusBadge
                          kind="status"
                          value={u.readiness === 'ready' ? 'completed' : u.readiness === 'needs_attention' ? 'action_needed' : 'in_progress'}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className="aio-fleet-matrix aio-fleet-matrix--mobile">
          {units.map((u) => (
            <li key={u.id} className="aio-fleet-card">
              <Link to={aioPaths.portalVehicle(u.id)}><strong>{u.nickname}</strong></Link>
              <span className="aio-fleet-card__vin">VIN {maskVin(u.vin)}</span>
              <p>Registration: {docStatusForVehicle(docs, u.id, 'registration').label}</p>
              <p>IRP: {docStatusForVehicle(docs, u.id, 'irp').label}</p>
              {u.readiness && (
                <RoadReadyStatusBadge
                  kind="status"
                  value={u.readiness === 'ready' ? 'completed' : u.readiness === 'needs_attention' ? 'action_needed' : 'in_progress'}
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="aio-fleet-section">
        <h2>Power Units</h2>
        {units.length === 0 ? (
          <p className="aio-empty-state__text">No power units added yet.</p>
        ) : (
          <ul className="aio-fleet-grid">
            {units.map((u) => (
              <li key={u.id}>
                <Link to={aioPaths.portalVehicle(u.id)} className="aio-fleet-card">
                  <strong>{u.nickname}</strong>
                  <span>{[u.year, u.make, u.model].filter(Boolean).join(' ')}</span>
                  <span className="aio-fleet-card__vin">VIN {maskVin(u.vin)}</span>
                  {u.readiness && (
                    <RoadReadyStatusBadge
                      kind="status"
                      value={u.readiness === 'ready' ? 'completed' : u.readiness === 'needs_attention' ? 'action_needed' : u.readiness === 'incomplete' ? 'not_started' : 'needs_review'}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="aio-fleet-section">
        <h2>Trailers</h2>
        {trailers.length === 0 ? (
          <p className="aio-empty-state__text">No trailers added yet.</p>
        ) : (
          <ul className="aio-fleet-list">
            {trailers.map((t) => (
              <li key={t.id} className="aio-fleet-list__row">
                <span>{t.number}</span>
                <span>{t.type ?? 'Trailer'}</span>
                <span>{t.plate ? `${t.plateState ?? ''} ${t.plate}` : '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="aio-fleet-section">
        <h2>Drivers</h2>
        {drivers.length === 0 ? (
          <p className="aio-empty-state__text">No drivers associated yet.</p>
        ) : (
          <ul className="aio-fleet-list">
            {drivers.map((d) => (
              <li key={d.id} className="aio-fleet-list__row">
                <span>{d.name}</span>
                <span>{d.phone ?? d.email ?? '—'}</span>
                <span>{d.assignedUnitId ? `Unit ${d.assignedUnitId}` : 'Unassigned'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
