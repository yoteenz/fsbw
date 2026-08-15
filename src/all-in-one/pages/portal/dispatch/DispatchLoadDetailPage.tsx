import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoStore } from '../../../demo/useDemoStore';
import {
  acceptLoadOffer,
  declineLoadOffer,
  getOrganizationId,
  updateLoadOperationalStatus,
  uploadLoadDocument,
} from '../../../demo/dispatchActions';
import {
  LoadAppointment,
  LoadLane,
  LoadMetrics,
  LoadStatusBadge,
} from '../../../components/dispatch/LoadDisplay';
import { LOAD_DECLINE_REASON_LABELS } from '../../../dispatch/dispatchConfig';
import { nextCustomerAction } from '../../../dispatch/dispatchRules';
import type { LoadDeclineReason, LoadOperationalStatus } from '../../../dispatch/dispatchTypes';
import { aioPaths } from '../../../utils/paths';
import { useParams } from 'react-router-dom';

const STATUS_FLOW: Partial<Record<LoadOperationalStatus, LoadOperationalStatus>> = {
  booked: 'en_route_pickup',
  dispatched: 'en_route_pickup',
  en_route_pickup: 'at_pickup',
  at_pickup: 'loaded',
  loaded: 'in_transit',
  in_transit: 'at_delivery',
  at_delivery: 'delivered',
};

export function DispatchLoadDetailPage() {
  const { loadId } = useParams<{ loadId: string }>();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const load = store.loads.find((l) => l.id === loadId && l.organizationId === orgId);
  const [declineReason, setDeclineReason] = useState<LoadDeclineReason>('rate_too_low');
  const [showDecline, setShowDecline] = useState(false);

  const customerTimeline = useMemo(
    () => load?.timeline.filter((t) => t.visibility === 'customer') ?? [],
    [load],
  );

  if (!load) {
    return (
      <div className="aio-dispatch">
        <p>Load not found or access denied.</p>
        <Link to={aioPaths.portalDispatch}>← Dispatch</Link>
      </div>
    );
  }

  const nextAction = nextCustomerAction(load);
  const nextStatus = STATUS_FLOW[load.operationalStatus];

  const onStatusUpdate = () => {
    if (nextStatus) updateLoadOperationalStatus(load.id, nextStatus, 'driver', 'Driver', orgId);
  };

  return (
    <div className="aio-dispatch aio-dispatch-load-detail">
      <Link to={aioPaths.portalDispatchLoads} className="aio-rr-link">← Loads</Link>
      <header className="aio-dispatch-hero aio-dispatch-hero--compact">
        <p className="aio-dispatch-hero__eyebrow">{load.loadNumber}</p>
        <LoadStatusBadge load={load} />
        <LoadLane load={load} />
      </header>

      {load.offerStatus === 'awaiting_carrier' && (
        <section className="aio-dispatch-card aio-dispatch-card--offer">
          <h2>Load Offer</h2>
          <LoadMetrics load={load} />
          <LoadAppointment load={load} kind="pickup" />
          <LoadAppointment load={load} kind="delivery" />
          <p>Broker: {load.brokerName}</p>
          {load.customerNotes && <p>{load.customerNotes}</p>}
          <div className="aio-dispatch-actions aio-dispatch-actions--offer">
            <button type="button" className="aio-btn aio-btn--gold" onClick={() => acceptLoadOffer(load.id, orgId)}>
              Accept Load
            </button>
            <button type="button" className="aio-btn aio-btn--outline aio-btn--decline" onClick={() => setShowDecline(true)}>
              Decline Load
            </button>
            <Link to={aioPaths.officeMessages} className="aio-btn aio-btn--outline">Ask Dispatcher</Link>
          </div>
          {showDecline && (
            <div className="aio-dispatch-decline">
              <label>
                Reason (optional)
                <select value={declineReason} onChange={(e) => setDeclineReason(e.target.value as LoadDeclineReason)}>
                  {Object.entries(LOAD_DECLINE_REASON_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="aio-btn aio-btn--sm"
                onClick={() => declineLoadOffer(load.id, orgId, declineReason)}
              >
                Confirm Decline
              </button>
            </div>
          )}
        </section>
      )}

      {load.offerStatus === 'accepted' && load.operationalStatus !== 'opportunity' && (
        <>
          <section className="aio-dispatch-card">
            <h2>Load Details</h2>
            <LoadMetrics load={load} />
            <LoadAppointment load={load} kind="pickup" />
            <LoadAppointment load={load} kind="delivery" />
            <p>Broker: {load.brokerName}</p>
            <p>Equipment: {load.equipmentType}{load.commodity ? ` · ${load.commodity}` : ''}</p>
          </section>

          {nextAction && (
            <section className="aio-dispatch-card aio-dispatch-card--primary">
              <h2>Next Action</h2>
              {load.operationalStatus === 'pod_needed' && !load.podDocumentId ? (
                <>
                  <p><strong>Delivery complete — POD needed</strong></p>
                  <label className="aio-dispatch-upload">
                    Upload POD
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadLoadDocument(load.id, orgId, 'pod', f.name);
                      }}
                    />
                  </label>
                </>
              ) : load.operationalStatus === 'at_pickup' ? (
                <>
                  <button type="button" className="aio-btn aio-btn--gold" onClick={onStatusUpdate}>Mark Loaded</button>
                  <label className="aio-dispatch-upload">
                    Upload BOL
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadLoadDocument(load.id, orgId, 'bol', f.name);
                      }}
                    />
                  </label>
                </>
              ) : (
                <button type="button" className="aio-btn aio-btn--gold aio-dispatch-next-action" onClick={onStatusUpdate}>
                  {nextAction}
                </button>
              )}
            </section>
          )}

          <section className="aio-dispatch-card">
            <h2>Documents</h2>
            <ul className="aio-dispatch-docs">
              <li>Rate Confirmation: {load.rateConfirmationDocumentId ? 'Uploaded' : load.rateConfirmationStatus}</li>
              <li>BOL: {load.bolDocumentId ? 'Uploaded' : 'Missing'}</li>
              <li>POD: {load.podDocumentId ? 'Received' : load.operationalStatus === 'pod_needed' ? 'Needed' : '—'}</li>
            </ul>
          </section>

          <section className="aio-dispatch-card">
            <h2>Timeline</h2>
            <ol className="aio-dispatch-timeline">
              {customerTimeline.map((t) => (
                <li key={t.id}>
                  <strong>{t.label}</strong>
                  <span>{new Date(t.createdAt).toLocaleString()}</span>
                  {t.actorLabel && <span> · {t.actorLabel}</span>}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <Link to={aioPaths.officeMessages} className="aio-btn aio-btn--outline">Contact Dispatch</Link>
    </div>
  );
}
