import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../../demo/useDemoStore';
import { getOrganizationId } from '../../../demo/factoringActions';
import { getCarrierOffers, respondCarrierOffer } from '../../../demo/brokerageActions';
import { CARRIER_OFFER_STATUS_LABELS, CARRIER_PAYABLE_STATUS_LABELS, DEMO_BROKERAGE_LABEL } from '../../../brokerage/brokerageConfig';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';

export function CarrierBrokerageHomePage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const offers = getCarrierOffers(orgId, store).filter((o) => ['sent', 'viewed'].includes(o.status));
  const loads = store.loads.filter((l) => l.sourceType === 'brokerage' && l.brokerageCarrierOrganizationId === orgId);

  return (
    <div className="aio-brokerage">
      <header className="aio-brokerage-hero aio-brokerage-hero--compact">
        <h1>Brokerage Loads</h1>
        <p>{DEMO_BROKERAGE_LABEL}</p>
      </header>
      <div className="aio-brokerage-metrics">
        <div className="aio-brokerage-metric"><span>{offers.length}</span><label>Offers</label></div>
        <div className="aio-brokerage-metric"><span>{loads.length}</span><label>Active Loads</label></div>
      </div>
      <Link to={aioPaths.portalBrokerageOffers} className="aio-btn aio-btn--gold">View Offers</Link>
      <Link to={aioPaths.portalBrokeragePayments} className="aio-btn aio-btn--outline">Payments</Link>
    </div>
  );
}

export function CarrierBrokerageOffersPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const offers = getCarrierOffers(orgId, store);

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.portalBrokerage} className="aio-rr-link">← Brokerage</Link>
      <h1>Load Offers</h1>
      {offers.map((o) => {
        const load = store.loads.find((l) => l.id === o.loadId);
        return (
          <div key={o.id} className="aio-brokerage-card">
            <strong>{load?.loadNumber ?? o.loadId}</strong>
            <p>{load?.originCity}, {load?.originState} → {load?.destinationCity}, {load?.destinationState}</p>
            <p>Carrier pay: {formatMoney(o.carrierPayMinor)}</p>
            <p>{CARRIER_OFFER_STATUS_LABELS[o.status]}</p>
            {o.status === 'sent' && (
              <div className="aio-brokerage-actions">
                <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => respondCarrierOffer(o.id, true, orgId)}>Accept</button>
                <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => respondCarrierOffer(o.id, false, orgId)}>Decline</button>
              </div>
            )}
          </div>
        );
      })}
      <p className="aio-prototype-note">Shipper charge and brokerage margin are never shown to carriers.</p>
    </div>
  );
}

export function CarrierBrokerageLoadPage() {
  const { loadId } = useParams();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const load = store.loads.find(
    (l) => l.id === loadId && l.sourceType === 'brokerage' && l.brokerageCarrierOrganizationId === orgId,
  );
  if (!load) return <p>Load not found.</p>;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.portalBrokerage} className="aio-rr-link">← Brokerage</Link>
      <h1>{load.loadNumber}</h1>
      <p>{load.operationalStatus.replace(/_/g, ' ')}</p>
      <p>Pay: {formatMoney(load.confirmedGrossMinor)}</p>
    </div>
  );
}

export function CarrierBrokeragePaymentsPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const payables = store.carrierPayables.filter((p) => p.carrierOrganizationId === orgId);

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.portalBrokerage} className="aio-rr-link">← Brokerage</Link>
      <h1>Carrier Payables</h1>
      {payables.map((p) => {
        const load = store.loads.find((l) => l.id === p.loadId);
        return (
          <div key={p.id} className="aio-brokerage-card">
            <strong>{load?.loadNumber}</strong>
            <p>{formatMoney(p.totalPayableMinor)} · {CARRIER_PAYABLE_STATUS_LABELS[p.status]}</p>
            {p.factoringAssignmentOnFile && (
              <p className="aio-brokerage-warn">Factoring / assignment on file — payment destination protected</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
