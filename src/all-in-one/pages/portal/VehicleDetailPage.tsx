import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getOrganizationId, getRoadReadyItems } from '../../demo/roadReadyActions';
import { RoadReadyStatusBadge } from '../../components/RoadReadyStatusBadge';
import { maskVin, expirationLabel } from '../../road-ready/roadReadyScoring';
import { aioPaths } from '../../utils/paths';

export function VehicleDetailPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const unit = store.powerUnits.find((u) => u.id === vehicleId && u.organizationId === orgId);
  const items = getRoadReadyItems(orgId).filter((i) => i.scopeType === 'vehicle' && i.scopeId === vehicleId);
  const docs = store.documents.filter((d) => d.relatedVehicle === vehicleId && d.clientId === orgId);
  const deadlines = store.deadlines.filter((d) => d.clientId === orgId && !d.complete);

  if (!unit) {
    return (
      <div className="aio-road-ready">
        <p>Vehicle not found.</p>
        <Link to={aioPaths.portalFleet}>← Fleet</Link>
      </div>
    );
  }

  return (
    <div className="aio-road-ready aio-vehicle-detail">
      <header>
        <Link to={aioPaths.portalFleet} className="aio-rr-link">← Fleet</Link>
        <h1>{unit.nickname}</h1>
        <p>{[unit.year, unit.make, unit.model].filter(Boolean).join(' ')}</p>
        {unit.readiness && (
          <RoadReadyStatusBadge
            kind="status"
            value={
              unit.readiness === 'ready'
                ? 'completed'
                : unit.readiness === 'needs_attention'
                  ? 'action_needed'
                  : unit.readiness === 'incomplete'
                    ? 'not_started'
                    : 'needs_review'
            }
          />
        )}
      </header>

      <div className="aio-vehicle-detail__grid">
        <section className="aio-portal-panel">
          <h2>Vehicle Details</h2>
          <dl className="aio-rr-detail-dl">
            <div><dt>VIN</dt><dd>{maskVin(unit.vin)}</dd></div>
            <div><dt>Plate</dt><dd>{unit.plate ? `${unit.plateState ?? ''} ${unit.plate}` : '—'}</dd></div>
            <div><dt>GVWR</dt><dd>{unit.gvwr ?? '—'}</dd></div>
            <div><dt>Ownership</dt><dd>{unit.ownership ?? '—'}</dd></div>
            <div><dt>Status</dt><dd>{unit.status ?? '—'}</dd></div>
          </dl>
        </section>

        <section className="aio-portal-panel">
          <h2>Road Ready Items</h2>
          {items.length === 0 ? (
            <p className="aio-empty-state__text">No vehicle-specific requirements yet.</p>
          ) : (
            <ul className="aio-rr-item-list">
              {items.map((item) => (
                <li key={item.id} className="aio-rr-item-row">
                  <strong>{item.title}</strong>
                  <RoadReadyStatusBadge kind="verification" value={item.verificationStatus} />
                  {item.expiresAt && <span>{expirationLabel(item.expiresAt)}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="aio-portal-panel">
          <h2>Documents</h2>
          {docs.length === 0 ? (
            <p className="aio-empty-state__text">No documents linked to this unit.</p>
          ) : (
            docs.map((d) => (
              <div key={d.id} className="aio-portal-list__item">
                <span>{d.name}</span>
                <span className="aio-badge aio-badge--progress">{d.status.replace('_', ' ')}</span>
              </div>
            ))
          )}
        </section>

        <section className="aio-portal-panel">
          <h2>Deadlines</h2>
          {deadlines.slice(0, 5).map((d) => (
            <div key={d.id} className="aio-portal-list__item">
              <span>{d.label}</span>
              <span>{d.dueDate}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
