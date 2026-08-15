import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  getBrokerContacts,
  getOfficeDispatchMetrics,
  getTruckProfiles,
} from '../../demo/dispatchActions';
import { LoadLane, LoadStatusBadge, TruckAvailabilityBadge } from '../../components/dispatch/LoadDisplay';
import { BOARD_COLUMN_STATUSES, DEMO_DISPATCH_LABEL } from '../../dispatch/dispatchConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

export function DispatchCommandCenterPage() {
  const store = useDemoStore();
  const metrics = useMemo(() => getOfficeDispatchMetrics(store), [store]);
  const today = new Date().toISOString().slice(0, 10);

  const needsLoad = store.truckProfiles.filter((t) => ['available', 'available_soon'].includes(t.availability));
  const attention = store.loads.filter(
    (l) =>
      l.operationalStatus === 'pod_needed' && !l.podDocumentId ||
      (l.pickupDate === today && !['at_pickup', 'loaded', 'in_transit', 'at_delivery', 'delivered', 'pod_needed', 'complete'].includes(l.operationalStatus)) ||
      (l.deliveryDate === today && l.operationalStatus === 'in_transit'),
  );

  const boardColumns = [
    { key: 'offered', label: 'Load Offered' },
    { key: 'booking', label: 'Booking' },
    { key: 'pickup', label: 'Pickup' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'pod_needed', label: 'POD Needed' },
  ] as const;

  return (
    <div className="aio-dispatch-office">
      <header className="aio-office-page__header">
        <h1>Dispatch Command Center</h1>
        <p>{DEMO_DISPATCH_LABEL}</p>
        <div className="aio-office-action-bar">
          <Link to={aioPaths.officeDispatchLoadNew} className="aio-btn aio-btn--gold aio-btn--sm">+ New Load Opportunity</Link>
          <Link to={aioPaths.officeDispatchLoads} className="aio-btn aio-btn--sm">All Loads</Link>
          <Link to={aioPaths.officeDispatchClients} className="aio-btn aio-btn--sm">Clients</Link>
          <Link to={aioPaths.officeDispatchBrokers} className="aio-btn aio-btn--sm">Brokers</Link>
        </div>
      </header>

      <div className="aio-dispatch-office-metrics">
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.activeLoads}</span><span className="aio-office-metric-card__label">Active Loads</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.availableTrucks}</span><span className="aio-office-metric-card__label">Available Trucks</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.pickupsToday}</span><span className="aio-office-metric-card__label">Pickups Today</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.deliveriesToday}</span><span className="aio-office-metric-card__label">Deliveries Today</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{attention.length}</span><span className="aio-office-metric-card__label">Needs Attention</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.missingPods}</span><span className="aio-office-metric-card__label">Missing PODs</span></div>
      </div>

      <div className="aio-dispatch-office-layout">
        <aside className="aio-dispatch-office-queue">
          <h2>Needs Load</h2>
          {needsLoad.map((t) => {
            const client = store.clients.find((c) => c.id === t.organizationId);
            return (
              <Link key={t.id} to={aioPaths.officeDispatchClient(t.organizationId)} className="aio-dispatch-truck-card">
                <strong>{t.nickname}</strong>
                <span>{client?.companyName}</span>
                <TruckAvailabilityBadge truck={t} />
                {t.nextAvailableCity && <span>{t.nextAvailableCity}, {t.nextAvailableState}</span>}
                <span>{t.trailerType ?? '—'}</span>
              </Link>
            );
          })}
        </aside>

        <section className="aio-dispatch-board">
          <h2>Dispatch Board</h2>
          <div className="aio-dispatch-board__columns">
            {boardColumns.map((col) => {
              const statuses = BOARD_COLUMN_STATUSES[col.key] ?? [];
              const colLoads = store.loads.filter((l) => statuses.includes(l.operationalStatus) || (col.key === 'offered' && l.offerStatus === 'awaiting_carrier'));
              return (
                <div key={col.key} className="aio-dispatch-board__col">
                  <h3>{col.label}</h3>
                  {colLoads.map((l) => (
                    <Link key={l.id} to={aioPaths.officeDispatchLoad(l.id)} className="aio-dispatch-board-card">
                      <LoadStatusBadge load={l} />
                      <LoadLane load={l} />
                      <span>{formatMoney(l.grossMinor)}</span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="aio-dispatch-office-schedule">
          <h2>Today</h2>
          <h3>Pickups Today</h3>
          {store.loads.filter((l) => l.pickupDate === today).map((l) => (
            <Link key={l.id} to={aioPaths.officeDispatchLoad(l.id)} className="aio-dispatch-schedule-row">
              {l.loadNumber} · {l.originCity}
            </Link>
          ))}
          <h3>Deliveries Today</h3>
          {store.loads.filter((l) => l.deliveryDate === today).map((l) => (
            <Link key={l.id} to={aioPaths.officeDispatchLoad(l.id)} className="aio-dispatch-schedule-row">
              {l.loadNumber} · {l.destinationCity}
            </Link>
          ))}
          <h3>Schedule Issues</h3>
          {attention.map((l) => (
            <Link key={l.id} to={aioPaths.officeDispatchLoad(l.id)} className="aio-dispatch-schedule-row aio-dispatch-schedule-row--warn">
              {l.loadNumber} — potential schedule issue
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}

export function DispatchLoadsListPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Dispatch Loads</h1>
        <Link to={aioPaths.officeDispatchLoadNew} className="aio-btn aio-btn--gold aio-btn--sm">+ New Opportunity</Link>
      </header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr><th>Load</th><th>Carrier</th><th>Lane</th><th>Gross</th><th>Status</th><th>Offer</th></tr>
          </thead>
          <tbody>
            {store.loads.map((l) => {
              const client = store.clients.find((c) => c.id === l.organizationId);
              return (
                <tr key={l.id}>
                  <td><Link to={aioPaths.officeDispatchLoad(l.id)}>{l.loadNumber}</Link></td>
                  <td>{client?.companyName}</td>
                  <td>{l.originCity}, {l.originState} → {l.destinationCity}, {l.destinationState}</td>
                  <td>{formatMoney(l.grossMinor)}</td>
                  <td>{l.operationalStatus.replace(/_/g, ' ')}</td>
                  <td>{l.offerStatus.replace(/_/g, ' ')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DispatchClientsListPage() {
  const store = useDemoStore();
  const active = store.dispatchEnrollments.filter((e) => e.status === 'active');
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Dispatch Clients</h1></header>
      {active.map((e) => {
        const client = store.clients.find((c) => c.id === e.organizationId);
        const trucks = getTruckProfiles(e.organizationId, store);
        return (
          <Link key={e.id} to={aioPaths.officeDispatchClient(e.organizationId)} className="aio-office-list-row">
            <span>{client?.companyName}</span>
            <span>{trucks.length} truck(s) · {e.primaryDispatcherStaffId ? 'Assigned' : 'Unassigned'}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function DispatchBrokersPage() {
  const store = useDemoStore();
  const brokers = getBrokerContacts(store);
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Broker Directory</h1><p>Manually entered — not verified safe.</p></header>
      {brokers.map((b) => (
        <div key={b.id} className="aio-office-panel">
          <h3>{b.companyName}</h3>
          <p>{b.contactName} · {b.phone ?? b.email} · {b.status}</p>
        </div>
      ))}
    </div>
  );
}
