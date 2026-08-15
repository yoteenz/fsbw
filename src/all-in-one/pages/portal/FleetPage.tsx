import { Link } from 'react-router-dom';
import { useRoadReady } from '../../road-ready/useRoadReady';
import { RoadReadyStatusBadge } from '../../components/RoadReadyStatusBadge';
import { maskVin } from '../../road-ready/roadReadyScoring';
import { aioPaths } from '../../utils/paths';

export function FleetPage() {
  const { units, trailers, drivers, isShipper } = useRoadReady();

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
        <p>Power units, trailers, and driver associations for your organization.</p>
        <Link to={aioPaths.portalOnboarding} className="aio-btn aio-btn--outline aio-btn--sm">Add via Onboarding</Link>
      </header>

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
