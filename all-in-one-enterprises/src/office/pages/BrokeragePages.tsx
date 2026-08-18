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
import { computeGrossMarginPercent } from '../../brokerage/brokerageCalculations';
import { publishLoadToBoard, holdLoadOnBoard, getPublication } from '../../freight/loadBoardActions';

export function BrokerageCommandCenterPage() {
  const store = useDemoStore();
  const metrics = useMemo(() => getBrokerageMetrics(store), [store]);
  const loads = store.loads.filter((l) => l.sourceType === 'brokerage');

  return (
    <div className="aio-brokerage-office">
      <header className="aio-office-page__header">
        <h1>Brokerage Command Center</h1>
        <p>{DEMO_BROKERAGE_LABEL}</p>
        <div className="aio-office-action-bar">
          <Link to={aioPaths.officeBrokerageCoverage} className="aio-btn aio-btn--sm">Coverage</Link>
          <Link to={aioPaths.officeBrokerageFinance} className="aio-btn aio-btn--sm">Finance</Link>
          <Link to={aioPaths.officeBrokerageShippers} className="aio-btn aio-btn--sm">Shippers</Link>
          <Link to={aioPaths.officeBrokerageCarriers} className="aio-btn aio-btn--sm">Carriers</Link>
          <Link to={aioPaths.officeBrokerageReadiness} className="aio-btn aio-btn--sm">Activation</Link>
        </div>
      </header>
      <div className="aio-brokerage-office-metrics">
        <div className="aio-office-metric-card"><span>{metrics.needsCoverage}</span><label>Needs Coverage</label></div>
        <div className="aio-office-metric-card"><span>{metrics.quotesPending}</span><label>Quotes Pending</label></div>
        <div className="aio-office-metric-card"><span>{metrics.inTransit}</span><label>In Transit</label></div>
        <div className="aio-office-metric-card"><span>{metrics.podNeeded}</span><label>POD Needed</label></div>
        <div className="aio-office-metric-card"><span>{metrics.readyToBill}</span><label>Ready to Bill</label></div>
        <div className="aio-office-metric-card"><span>{metrics.issues}</span><label>Issues</label></div>
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
  const fin = getLoadFinancials(load.id, store);
  const marginPct = fin ? computeGrossMarginPercent(fin.confirmedShipperChargeMinor, fin.grossMarginMinor) : null;
  const pub = getPublication(load.id, store);
  const staffId = store.officeStaffId ?? 'staff-7';

  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBrokerage} className="aio-office-link">← Command Center</Link>
      <h1>{load.loadNumber}</h1>
      <p>Coverage: {load.brokerageCoverageStatus?.replace(/_/g, ' ')} · Ops: {load.operationalStatus.replace(/_/g, ' ')}</p>
      {fin && (
        <section className="aio-office-panel">
          <h2>Brokerage Financials (Internal)</h2>
          <dl className="aio-office-dl">
            <dt>Shipper Charge</dt><dd>{formatMoney(fin.confirmedShipperChargeMinor)}</dd>
            <dt>Carrier Pay</dt><dd>{formatMoney(fin.confirmedCarrierPayMinor)}</dd>
            <dt>Brokerage Gross Margin</dt><dd>{formatMoney(fin.grossMarginMinor)}{marginPct != null ? ` (${marginPct.toFixed(1)}%)` : ''}</dd>
          </dl>
          <p className="aio-prototype-note">Internal only — never shown on carrier Load Board.</p>
        </section>
      )}
      <section className="aio-office-panel">
        <h2>AIO Load Board</h2>
        <p>Status: {pub?.visibility ?? 'not published'}</p>
        {pub?.publishedAt && <p>Published: {new Date(pub.publishedAt).toLocaleString()}</p>}
        <div className="aio-office-actions">
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => publishLoadToBoard(load.id, staffId)}>Publish to AIO Load Board</button>
          {pub?.visibility === 'published' && (
            <button type="button" className="aio-btn aio-btn--outline-dark" onClick={() => holdLoadOnBoard(load.id)}>Hold / Private</button>
          )}
        </div>
      </section>
      <button type="button" className="aio-btn aio-btn--gold" onClick={() => createShipperInvoiceFromLoad(load.id, 'staff-7')}>Create Shipper Invoice</button>
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
