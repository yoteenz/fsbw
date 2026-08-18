import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { dollarsToMinor } from '../../billing/money';
import {
  createBrokerageQuote,
  createShipperInvoiceFromLoad,
  getBrokerageMetrics,
  getLoadFinancials,
  sendBrokerageQuote,
  sendCarrierOffer,
} from '../../demo/brokerageActions';
import {
  BROKERAGE_READINESS_CHECKLIST,
  DEMO_BROKERAGE_LABEL,
  SHIPMENT_REQUEST_STATUS_LABELS,
} from '../../brokerage/brokerageConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';
import { getBrokerageCarrierInsurance } from '../../demo/insuranceActions';
import { publishLoadToBoard, holdLoadOnBoard } from '../../freight/loadBoardActions';
import { buildStaffLoadWorkspace } from '../../freight/freightRoleViews';
import { AIO_BROKERAGE_OPERATING_MODEL } from '../../freight/freightArchitecture';

export function BrokerageCommandCenterPage() {
  const store = useDemoStore();
  const metrics = useMemo(() => getBrokerageMetrics(store), [store]);
  const loads = store.loads.filter((l) => l.sourceType === 'brokerage');

  return (
    <div className="aio-brokerage-office">
      <header className="aio-office-page__header">
        <h1>AIO Brokerage Control Center</h1>
        <p>{DEMO_BROKERAGE_LABEL}</p>
        <p className="aio-prototype-note">{AIO_BROKERAGE_OPERATING_MODEL}</p>
        <div className="aio-office-action-bar">
          <Link to={aioPaths.officeBrokerageLoads} className="aio-btn aio-btn--sm">All Loads</Link>
          <Link to={aioPaths.officeBrokerageCoverage} className="aio-btn aio-btn--sm">Need Carrier</Link>
          <Link to={aioPaths.officeBrokerageFinance} className="aio-btn aio-btn--sm">Finance</Link>
          <Link to={aioPaths.officeBrokerageShippers} className="aio-btn aio-btn--sm">Shippers</Link>
          <Link to={aioPaths.officeBrokerageCarriers} className="aio-btn aio-btn--sm">Carrier Network</Link>
          <Link to={aioPaths.officeBrokerageReadiness} className="aio-btn aio-btn--sm">Activation</Link>
        </div>
      </header>
      <div className="aio-brokerage-office-metrics aio-brokerage-office-metrics--wide">
        <div className="aio-office-metric-card"><span>{metrics.activeLoads}</span><label>Active Loads</label></div>
        <div className="aio-office-metric-card"><span>{metrics.availableOnBoard}</span><label>On Load Board</label></div>
        <div className="aio-office-metric-card"><span>{metrics.needCarrier}</span><label>Need Carrier</label></div>
        <div className="aio-office-metric-card"><span>{metrics.carrierOffersPending}</span><label>Pending Offers</label></div>
        <div className="aio-office-metric-card"><span>{metrics.pickupsToday}</span><label>Pickups Today</label></div>
        <div className="aio-office-metric-card"><span>{metrics.deliveriesToday}</span><label>Deliveries Today</label></div>
        <div className="aio-office-metric-card"><span>{metrics.podMissing}</span><label>POD Missing</label></div>
        <div className="aio-office-metric-card"><span>{metrics.readyToInvoice}</span><label>Ready to Invoice</label></div>
        <div className="aio-office-metric-card"><span>{formatMoney(metrics.shipperArMinor)}</span><label>Shipper A/R (demo)</label></div>
        <div className="aio-office-metric-card"><span>{formatMoney(metrics.carrierPayablesMinor)}</span><label>Carrier Payables (demo)</label></div>
        <div className="aio-office-metric-card"><span>{formatMoney(metrics.brokerageRevenueMinor)}</span><label>Revenue (complete)</label></div>
        <div className="aio-office-metric-card"><span>{formatMoney(metrics.grossMarginMinor)}</span><label>Gross Margin (complete)</label></div>
      </div>
      <section className="aio-office-panel">
        <h2>Active Brokerage Loads</h2>
        {loads.map((l) => {
          const fin = getLoadFinancials(l.id, store);
          return (
            <Link key={l.id} to={aioPaths.officeBrokerageLoad(l.id)} className="aio-office-list-row">
              <span>{l.loadNumber} · {l.brokerageCoverageStatus?.replace(/_/g, ' ')}</span>
              <span>{l.operationalStatus.replace(/_/g, ' ')}</span>
              {fin && <span>Margin {formatMoney(fin.grossMarginMinor)}</span>}
            </Link>
          );
        })}
      </section>
    </div>
  );
}

export function BrokerageReadinessPage() {
  const store = useDemoStore();
  const cap = store.brokerageCapability;
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBrokerage} className="aio-office-link">← Command Center</Link>
      <h1>Brokerage Activation</h1>
      <p>Current mode: <strong>{cap.capability.toUpperCase()}</strong></p>
      <p className="aio-prototype-note">Operational readiness checklist — not legal compliance certification.</p>
      <ul>
        {(cap.readinessItems.length ? cap.readinessItems : BROKERAGE_READINESS_CHECKLIST.map((i) => ({ ...i, status: 'missing' as const }))).map((item) => (
          <li key={item.key}>{item.label}: {item.status.replace(/_/g, ' ')}</li>
        ))}
      </ul>
    </div>
  );
}

export function BrokerageShippersPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Shipper CRM</h1></header>
      {store.shipperProfiles.map((p) => {
        const client = store.clients.find((c) => c.id === p.organizationId);
        return (
          <Link key={p.id} to={aioPaths.officeBrokerageShipper(p.organizationId)} className="aio-office-list-row">
            <span>{p.legalName ?? client?.companyName}</span>
            <span>{p.status}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function BrokerageShipperDetailPage() {
  const { shipperId } = useParams();
  const store = useDemoStore();
  const profile = store.shipperProfiles.find((p) => p.organizationId === shipperId);
  const requests = store.shipmentRequests.filter((r) => r.shipperOrganizationId === shipperId);
  if (!profile) return <p>Not found.</p>;
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBrokerageShippers} className="aio-office-link">← Shippers</Link>
      <h1>{profile.legalName}</h1>
      <p>{profile.primaryContactName} · {profile.primaryEmail}</p>
      {profile.internalNotes && <p className="aio-prototype-note">Internal notes hidden from shipper portal.</p>}
      <section className="aio-office-panel">
        <h2>Shipment Requests</h2>
        {requests.map((r) => (
          <div key={r.id} className="aio-office-list-row">
            <span>{r.requestNumber}</span>
            <span>{SHIPMENT_REQUEST_STATUS_LABELS[r.status]}</span>
            {r.status === 'under_review' && (
              <button
                type="button"
                className="aio-btn aio-btn--sm"
                onClick={() => {
                  const q = createBrokerageQuote(r.id, dollarsToMinor(2850), 'staff-7');
                  if (q) sendBrokerageQuote(q.id);
                }}
              >
                Create &amp; Send Quote
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

export function BrokerageCoveragePage() {
  const store = useDemoStore();
  const needs = store.loads.filter((l) => l.sourceType === 'brokerage' && l.brokerageCoverageStatus === 'needs_coverage');
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBrokerage} className="aio-office-link">← Command Center</Link>
      <h1>Coverage Board</h1>
      {needs.map((l) => (
        <div key={l.id} className="aio-brokerage-card">
          <Link to={aioPaths.officeBrokerageLoad(l.id)}><strong>{l.loadNumber}</strong></Link>
          <p>{l.originCity} → {l.destinationCity}</p>
          <button
            type="button"
            className="aio-btn aio-btn--sm aio-btn--gold"
            onClick={() => sendCarrierOffer(l.id, 'cn-heartland', l.confirmedGrossMinor, 'staff-7')}
          >
            Offer to Heartland
          </button>
        </div>
      ))}
    </div>
  );
}

export function BrokerageCarriersPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Carrier Network</h1></header>
      {store.carrierNetworkProfiles.map((c) => (
        <Link key={c.id} to={aioPaths.officeBrokerageCarrier(c.id)} className="aio-office-list-row">
          <span>{c.legalName}</span>
          <span>{c.status.replace(/_/g, ' ')}</span>
          <span>{c.mcNumber ?? '—'}</span>
        </Link>
      ))}
    </div>
  );
}

export function BrokerageCarrierDetailPage() {
  const { carrierId } = useParams();
  const store = useDemoStore();
  const profile = store.carrierNetworkProfiles.find((c) => c.id === carrierId);
  if (!profile) return <p>Not found.</p>;
  const ins = profile.organizationId ? getBrokerageCarrierInsurance(profile.organizationId, store) : null;
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBrokerageCarriers} className="aio-office-link">← Carriers</Link>
      <h1>{profile.legalName}</h1>
      <p>USDOT {profile.usdot ?? '—'} · MC {profile.mcNumber ?? '—'}</p>
      <p>Authority: {profile.authorityVerification.replace(/_/g, ' ')} — not live FMCSA verification.</p>
      {ins && (
        <section className="aio-office-panel">
          <h2>Insurance (Canonical)</h2>
          <p>Auto Liability: {ins.autoLiability ? 'On file' : '—'} · Cargo: {ins.cargo ? 'On file' : '—'}</p>
          <p>Expiration: {ins.expirationDate ?? '—'} · {ins.verificationState.replace(/_/g, ' ')}</p>
          {ins.reviewNeeded && <p className="aio-insurance-warn">Insurance review needed — not a safety certification.</p>}
        </section>
      )}
    </div>
  );
}

export function BrokerageLoadDetailPage() {
  const { loadId } = useParams();
  const store = useDemoStore();
  const load = store.loads.find((l) => l.id === loadId && l.sourceType === 'brokerage');
  if (!load) return <p>Not found.</p>;
  const workspace = useMemo(() => buildStaffLoadWorkspace(load, store), [load, store]);
  const staffId = store.officeStaffId ?? 'staff-7';

  return (
    <div className="aio-office-page aio-brokerage-load-workspace">
      <Link to={aioPaths.officeBrokerage} className="aio-office-link">← Control Center</Link>
      <header className="aio-office-page__header">
        <h1>{workspace.loadNumber}</h1>
        <p>Lifecycle: {workspace.lifecycleStatus.replace(/_/g, ' ')} · Coverage: {workspace.route.coverageStatus?.replace(/_/g, ' ') ?? '—'}</p>
      </header>

      <section className="aio-office-panel">
        <h2>Load</h2>
        <dl className="aio-office-dl">
          <dt>Route</dt><dd>{workspace.route.originCity}, {workspace.route.originState} → {workspace.route.destinationCity}, {workspace.route.destinationState}</dd>
          <dt>Pickup</dt><dd>{workspace.route.pickupDate}</dd>
          <dt>Delivery</dt><dd>{workspace.route.deliveryDate}</dd>
          <dt>Equipment</dt><dd>{workspace.route.equipmentType}{workspace.publication?.trailerLengthFt ? ` · ${workspace.publication.trailerLengthFt}'` : ''}</dd>
          <dt>Commodity / Weight</dt><dd>{workspace.route.commodity ?? '—'} · {workspace.route.weight ?? '—'}</dd>
          <dt>Miles</dt><dd>{workspace.route.loadedMiles} loaded · {workspace.route.deadheadMiles} DH</dd>
          <dt>Status</dt><dd>{workspace.route.operationalStatus.replace(/_/g, ' ')}</dd>
        </dl>
      </section>

      {workspace.shipper && (
        <section className="aio-office-panel">
          <h2>Shipper</h2>
          <dl className="aio-office-dl">
            <dt>Shipper</dt><dd>{workspace.shipper.legalName ?? workspace.shipper.organizationId}</dd>
            <dt>Contact</dt><dd>{workspace.shipper.contactName ?? '—'}</dd>
            <dt>Email / Phone</dt><dd>{workspace.shipper.email ?? '—'} · {workspace.shipper.phone ?? '—'}</dd>
          </dl>
        </section>
      )}

      {workspace.pricing && (
        <section className="aio-office-panel">
          <h2>Pricing (Internal — AIO Office only)</h2>
          <dl className="aio-office-dl">
            <dt>Shipper Rate</dt><dd>{formatMoney(workspace.pricing.shipperRateMinor)}</dd>
            <dt>Carrier Offer</dt><dd>{formatMoney(workspace.pricing.carrierOfferMinor)}</dd>
            <dt>Final Carrier Rate</dt><dd>{formatMoney(workspace.pricing.finalCarrierRateMinor)}</dd>
            <dt>AIO Gross Margin</dt>
            <dd>
              {formatMoney(workspace.pricing.aioGrossMarginMinor)}
              {workspace.pricing.aioGrossMarginPercent != null ? ` (${workspace.pricing.aioGrossMarginPercent.toFixed(1)}%)` : ''}
            </dd>
            <dt>Loaded RPM</dt><dd>{formatMoney(workspace.pricing.loadedRpmMinor)}/mi</dd>
            <dt>True RPM</dt><dd>{formatMoney(workspace.pricing.trueRpmMinor)}/mi</dd>
          </dl>
          <p className="aio-prototype-note">Never exposed on carrier Load Board — enforced via carrier projection layer.</p>
        </section>
      )}

      <section className="aio-office-panel">
        <h2>Carrier</h2>
        {workspace.carrier ? (
          <dl className="aio-office-dl">
            <dt>Assigned Carrier</dt><dd>{workspace.carrier.legalName}</dd>
            <dt>MC / USDOT</dt><dd>{workspace.carrier.mcNumber ?? '—'} · {workspace.carrier.usdot ?? '—'}</dd>
            <dt>Qualification</dt><dd>Authority: {workspace.carrier.authorityVerification?.replace(/_/g, ' ')} · Insurance: {workspace.carrier.insuranceVerification?.replace(/_/g, ' ')}</dd>
          </dl>
        ) : (
          <p>No carrier assigned · {workspace.pendingCarrierOffers} staff offer(s) · {workspace.pendingBoardOffers} load board offer(s)</p>
        )}
      </section>

      <section className="aio-office-panel">
        <h2>Driver / Equipment</h2>
        <dl className="aio-office-dl">
          <dt>Driver</dt><dd>{workspace.equipment.primaryDriverId ?? '—'}</dd>
          <dt>Power Unit</dt><dd>{workspace.equipment.powerUnitId ?? '—'}</dd>
          <dt>Trailer</dt><dd>{workspace.equipment.trailerId ?? '—'}</dd>
          <dt>Dispatcher</dt><dd>{workspace.equipment.assignedDispatcherStaffId ?? '—'}</dd>
        </dl>
      </section>

      <section className="aio-office-panel">
        <h2>Documents</h2>
        <dl className="aio-office-dl">
          <dt>Rate Confirmation</dt><dd>{workspace.documents.rateConfirmationStatus.replace(/_/g, ' ')}{workspace.documents.rateConfirmationDocumentId ? ` · ${workspace.documents.rateConfirmationDocumentId}` : ''}</dd>
          <dt>BOL</dt><dd>{workspace.documents.bolDocumentId ?? '—'}</dd>
          <dt>POD</dt><dd>{workspace.documents.podDocumentId ?? '—'}</dd>
        </dl>
      </section>

      <section className="aio-office-panel">
        <h2>AIO Load Board Distribution</h2>
        <p>Status: {workspace.publication?.visibility ?? 'not published'}</p>
        {workspace.publication?.publishedAt && <p>Published: {new Date(workspace.publication.publishedAt).toLocaleString()}</p>}
        <div className="aio-office-actions">
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => publishLoadToBoard(load.id, staffId)}>Publish to AIO Load Board</button>
          {workspace.publication?.visibility === 'published' && (
            <button type="button" className="aio-btn aio-btn--outline-dark" onClick={() => holdLoadOnBoard(load.id)}>Hold / Private</button>
          )}
        </div>
      </section>

      <section className="aio-office-panel">
        <h2>Timeline</h2>
        {workspace.timeline.length === 0 ? (
          <p className="aio-prototype-note">No timeline events recorded.</p>
        ) : (
          <ul className="aio-office-timeline">
            {workspace.timeline.map((e) => (
              <li key={e.id}>
                <time>{new Date(e.createdAt).toLocaleString()}</time>
                <span>{e.operationalStatus?.replace(/_/g, ' ') ?? e.note ?? 'Update'}</span>
                {e.actorLabel && <span> — {e.actorLabel}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <button type="button" className="aio-btn aio-btn--gold" onClick={() => createShipperInvoiceFromLoad(load.id, staffId)}>Create Shipper Invoice</button>
    </div>
  );
}

export function BrokerageFinancePage() {
  const store = useDemoStore();
  const loads = store.loads.filter((l) => l.sourceType === 'brokerage' && l.operationalStatus === 'complete');
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBrokerage} className="aio-office-link">← Command Center</Link>
      <h1>Financial Closeout</h1>
      {loads.map((l) => {
        const fin = getLoadFinancials(l.id, store);
        const inv = store.brokerageShipperInvoices.find((i) => i.loadId === l.id);
        const pay = store.carrierPayables.find((p) => p.loadId === l.id);
        return (
          <div key={l.id} className="aio-brokerage-card">
            <strong>{l.loadNumber}</strong>
            {fin && <p>Margin {formatMoney(fin.grossMarginMinor)}</p>}
            <p>Shipper invoice: {inv?.status ?? '—'} · Carrier payable: {pay?.status.replace(/_/g, ' ') ?? '—'}</p>
          </div>
        );
      })}
    </div>
  );
}

export function BrokerageLoadsListPage() {
  const store = useDemoStore();
  const loads = store.loads.filter((l) => l.sourceType === 'brokerage');
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Brokerage Loads</h1></header>
      {loads.map((l) => (
        <Link key={l.id} to={aioPaths.officeBrokerageLoad(l.id)} className="aio-office-list-row">
          {l.loadNumber} · {l.operationalStatus.replace(/_/g, ' ')}
        </Link>
      ))}
    </div>
  );
}
