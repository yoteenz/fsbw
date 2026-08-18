import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../../demo/useDemoStore';
import { getCarrierPortalOrganizationId, getCarrierOffers, respondCarrierOffer, getLoadFinancials } from '../../../demo/brokerageActions';
import { CARRIER_OFFER_STATUS_LABELS, CARRIER_PAYABLE_STATUS_LABELS, DEMO_BROKERAGE_LABEL } from '../../../brokerage/brokerageConfig';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';
import { AIO_CARRIER_FREIGHT_DISCLOSURE } from '../../../freight/freightArchitecture';
import { buildCarrierFreightView } from '../../../freight/freightRoleViews';
import { resolveCarrierRateMinor } from '../../../freight/carrierLoadProjection';

export function CarrierBrokerageHomePage() {
  const store = useDemoStore();
  const orgId = getCarrierPortalOrganizationId(store);
  const offers = getCarrierOffers(orgId, store).filter((o) => ['sent', 'viewed'].includes(o.status));
  const loads = store.loads.filter((l) => l.sourceType === 'brokerage' && l.brokerageCarrierOrganizationId === orgId);

  return (
    <div className="aio-brokerage">
      <header className="aio-brokerage-hero aio-brokerage-hero--compact">
        <h1>AIO Freight</h1>
        <p>{DEMO_BROKERAGE_LABEL}</p>
        <p className="aio-prototype-note">{AIO_CARRIER_FREIGHT_DISCLOSURE}</p>
      </header>
      <div className="aio-brokerage-metrics">
        <div className="aio-brokerage-metric"><span>{offers.length}</span><label>Staff Offers</label></div>
        <div className="aio-brokerage-metric"><span>{loads.length}</span><label>Assigned Loads</label></div>
      </div>
      <Link to={aioPaths.portalLoadBoard} className="aio-btn aio-btn--gold">Search AIO Load Board</Link>
      <Link to={aioPaths.portalBrokerageOffers} className="aio-btn aio-btn--outline">View Staff Offers</Link>
      <Link to={aioPaths.portalBrokeragePayments} className="aio-btn aio-btn--outline">Payments</Link>
    </div>
  );
}

export function CarrierBrokerageOffersPage() {
  const store = useDemoStore();
  const orgId = getCarrierPortalOrganizationId(store);
  const offers = getCarrierOffers(orgId, store);

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.portalBrokerage} className="aio-rr-link">← AIO Freight</Link>
      <h1>Staff-Sent Offers</h1>
      <p className="aio-prototype-note">Offers sent by AIO brokerage staff — not competing broker listings.</p>
      {offers.length === 0 ? (
        <p className="aio-prototype-note">No pending offers. Search the <Link to={aioPaths.portalLoadBoard}>AIO Load Board</Link> for published freight.</p>
      ) : (
        offers.map((o) => {
          const load = store.loads.find((l) => l.id === o.loadId);
          return (
            <div key={o.id} className="aio-brokerage-card">
              <strong>{load?.loadNumber ?? o.loadId}</strong>
              <p>{load?.originCity}, {load?.originState} → {load?.destinationCity}, {load?.destinationState}</p>
              <p>Carrier rate: {formatMoney(o.carrierPayMinor)}</p>
              <p>{CARRIER_OFFER_STATUS_LABELS[o.status]}</p>
              {o.status === 'sent' && (
                <div className="aio-brokerage-actions">
                  <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => respondCarrierOffer(o.id, true, orgId)}>Accept</button>
                  <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => respondCarrierOffer(o.id, false, orgId)}>Decline</button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export function CarrierBrokerageLoadPage() {
  const { loadId } = useParams();
  const store = useDemoStore();
  const orgId = getCarrierPortalOrganizationId(store);
  const load = store.loads.find(
    (l) => l.id === loadId && l.sourceType === 'brokerage' && l.brokerageCarrierOrganizationId === orgId,
  );
  if (!load) return <p>Load not found.</p>;

  const view = useMemo(() => buildCarrierFreightView(load, store, orgId), [load, store, orgId]);
  const fin = getLoadFinancials(load.id, store);
  const carrierRate = fin ? resolveCarrierRateMinor(load, fin) : load.confirmedGrossMinor;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.portalBrokerage} className="aio-rr-link">← AIO Freight</Link>
      <h1>{load.loadNumber}</h1>
      <p>{load.originCity}, {load.originState} → {load.destinationCity}, {load.destinationState}</p>
      <p>{load.operationalStatus.replace(/_/g, ' ')}</p>
      <p>Carrier rate: {formatMoney(carrierRate)}</p>
      {view && (
        <p>Loaded {formatMoney(view.loadedRpmMinor)}/mi · True {formatMoney(view.trueRpmMinor)}/mi</p>
      )}
      <p className="aio-prototype-note">Shipper rate and AIO margin are never shown to carriers.</p>
    </div>
  );
}

export function CarrierBrokeragePaymentsPage() {
  const store = useDemoStore();
  const orgId = getCarrierPortalOrganizationId(store);
  const payables = store.carrierPayables.filter((p) => p.carrierOrganizationId === orgId);

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.portalBrokerage} className="aio-rr-link">← AIO Freight</Link>
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
