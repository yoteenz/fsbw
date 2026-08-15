import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  bookLoad,
  completeLoad,
  getTruckProfiles,
  markRateDetailsReviewed,
  sendLoadOffer,
  updateLoadOperationalStatus,
  uploadLoadDocument,
} from '../../demo/dispatchActions';
import { sendLoadToFactoring } from '../../demo/demoActions';
import {
  LoadAppointment,
  LoadFeePreview,
  LoadLane,
  LoadMetrics,
  LoadStatusBadge,
} from '../../components/dispatch/LoadDisplay';
import { LOAD_STATUS_LABELS } from '../../dispatch/dispatchConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';
import { LoadFactoringSection } from '../../components/factoring/LoadFactoringSection';
import type { LoadOperationalStatus } from '../../dispatch/dispatchTypes';

export function OfficeDispatchLoadDetailPage() {
  const { loadId } = useParams<{ loadId: string }>();
  const store = useDemoStore();
  const load = store.loads.find((l) => l.id === loadId);
  const client = load ? store.clients.find((c) => c.id === load.organizationId) : undefined;
  const billingConfig = load ? store.dispatchBillingConfigs.find((c) => c.organizationId === load.organizationId) : undefined;
  const dispatcher = load?.assignedDispatcherStaffId ? store.staff.find((s) => s.id === load.assignedDispatcherStaffId) : undefined;

  if (!load) return <p>Load not found.</p>;

  const statusOptions: LoadOperationalStatus[] = [
    'booked', 'dispatched', 'en_route_pickup', 'at_pickup', 'loaded', 'in_transit', 'at_delivery', 'delivered', 'pod_needed', 'complete',
  ];

  return (
    <div className="aio-office-page aio-dispatch-load-office">
      <Link to={aioPaths.officeDispatch} className="aio-office-link">← Command Center</Link>
      <header className="aio-office-page__header">
        <h1>{load.loadNumber}</h1>
        <LoadStatusBadge load={load} />
        <p>{client?.companyName} · Offer: {load.offerStatus.replace(/_/g, ' ')}</p>
      </header>

      <LoadLane load={load} />
      <LoadMetrics load={load} />
      <LoadAppointment load={load} kind="pickup" />
      <LoadAppointment load={load} kind="delivery" />

      <div className="aio-office-action-bar">
        {load.offerStatus === 'draft' && (
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => sendLoadOffer(load.id, 'staff-4')}>Send Offer to Carrier</button>
        )}
        {load.offerStatus === 'accepted' && load.operationalStatus === 'booking_in_progress' && (
          <>
            <label className="aio-dispatch-upload">
              Upload Rate Confirmation
              <input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLoadDocument(load.id, load.organizationId, 'rate_confirmation', f.name); }} />
            </label>
            <label><input type="checkbox" checked={load.rateDetailsReviewed} onChange={() => markRateDetailsReviewed(load.id)} /> Details Reviewed</label>
            <button type="button" className="aio-btn aio-btn--gold" onClick={() => bookLoad(load.id, 'staff-4')}>Mark Booked</button>
          </>
        )}
        {load.factoringHandoffStatus === 'ready' && (
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => sendLoadToFactoring(load.id)}>Send to Factoring</button>
        )}
        {load.operationalStatus === 'pod_needed' && load.podDocumentId && (
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => completeLoad(load.id, 'staff-4')}>Complete Load</button>
        )}
      </div>

      <section className="aio-office-panel">
        <h2>Update Status</h2>
        <div className="aio-office-action-bar">
          {statusOptions.map((s) => (
            <button key={s} type="button" className="aio-btn aio-btn--sm" onClick={() => updateLoadOperationalStatus(load.id, s, 'dispatcher', dispatcher?.name)}>
              {LOAD_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

      <section className="aio-office-panel">
        <h2>Rate Confirmation Review</h2>
        <dl className="aio-office-dl">
          <dt>Entered Gross</dt><dd>{formatMoney(load.grossMinor)}</dd>
          <dt>Rate Confirmation</dt><dd>{load.rateConfirmationDocumentId ? 'Attached' : 'Missing'}</dd>
          <dt>Broker</dt><dd>{load.brokerName}</dd>
          <dt>Details Reviewed</dt><dd>{load.rateDetailsReviewed ? 'Yes' : 'No'}</dd>
        </dl>
      </section>

      {billingConfig && (
        <LoadFeePreview
          load={load}
          billingMode={billingConfig.billingMode === 'percentage' || billingConfig.billingMode === 'flat_per_load' ? billingConfig.billingMode : undefined}
          dispatchFeeBasisPoints={billingConfig.billingRateBasisPoints}
          dispatchFeeFlatMinor={billingConfig.flatPerLoadMinor}
        />
      )}

      {load.factoringHandoffStatus === 'ready' && (
        <section className="aio-office-panel aio-office-panel--highlight">
          <h2>Factoring Handoff</h2>
          <p>Load documents complete — ready for factoring specialist review.</p>
        </section>
      )}

      <LoadFactoringSection load={load} orgId={load.organizationId} office />

      {load.internalNotes && (
        <section className="aio-office-panel">
          <h2>Internal Notes</h2>
          <p>{load.internalNotes}</p>
        </section>
      )}

      <section className="aio-office-panel">
        <h2>Timeline</h2>
        <ol className="aio-dispatch-timeline">
          {load.timeline.map((t) => (
            <li key={t.id}>
              <strong>{t.label}</strong> · {new Date(t.createdAt).toLocaleString()} · {t.visibility}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function DispatchClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const store = useDemoStore();
  const client = store.clients.find((c) => c.id === clientId);
  const enrollment = store.dispatchEnrollments.find((e) => e.organizationId === clientId);
  const trucks = getTruckProfiles(clientId ?? '', store);
  const loads = store.loads.filter((l) => l.organizationId === clientId);
  const dispatcher = enrollment?.primaryDispatcherStaffId ? store.staff.find((s) => s.id === enrollment.primaryDispatcherStaffId) : undefined;

  if (!client || !enrollment) return <p>Client not found.</p>;

  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeDispatchClients} className="aio-office-link">← Clients</Link>
      <header className="aio-office-page__header">
        <h1>{client.companyName}</h1>
        <p>Dispatch: {enrollment.status} · Dispatcher: {dispatcher?.name ?? 'Unassigned'}</p>
      </header>

      <section className="aio-office-panel">
        <h2>Active Trucks</h2>
        {trucks.map((t) => (
          <div key={t.id} className="aio-dispatch-truck-row">
            <strong>{t.nickname}</strong>
            <span>{t.availability}</span>
            {t.nextAvailableCity && <span>Next: {t.nextAvailableCity}, {t.nextAvailableState}</span>}
          </div>
        ))}
      </section>

      <section className="aio-office-panel">
        <h2>Dispatch Preferences</h2>
        <pre className="aio-dispatch-prefs">{JSON.stringify(enrollment.preferences ?? {}, null, 2)}</pre>
        <Link to={aioPaths.officeClientRoadReady(clientId!)} className="aio-rr-link">View Road Ready →</Link>
      </section>

      <section className="aio-office-panel">
        <h2>Loads</h2>
        {loads.map((l) => (
          <Link key={l.id} to={aioPaths.officeDispatchLoad(l.id)} className="aio-office-list-row">
            {l.loadNumber} · {l.operationalStatus} · {formatMoney(l.grossMinor)}
          </Link>
        ))}
      </section>
    </div>
  );
}
