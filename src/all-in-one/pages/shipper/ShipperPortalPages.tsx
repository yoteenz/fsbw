import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  acceptBrokerageQuote,
  createAndSubmitShipmentRequest,
  getShipperOrganizationId,
  getShipperQuotes,
  getShipperRequests,
} from '../../demo/brokerageActions';
import {
  BROKERAGE_QUOTE_STATUS_LABELS,
  DEMO_BROKERAGE_LABEL,
  SHIPMENT_REQUEST_STATUS_LABELS,
} from '../../brokerage/brokerageConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

export function ShipperHomePage() {
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const profile = store.shipperProfiles.find((p) => p.organizationId === orgId);
  const requests = getShipperRequests(orgId, store);
  const quotes = getShipperQuotes(orgId, store).filter((q) => q.status === 'sent');

  return (
    <div className="aio-brokerage">
      <header className="aio-brokerage-hero">
        <h1>Shipper Portal</h1>
        <p>{DEMO_BROKERAGE_LABEL}</p>
      </header>
      {profile && <p>{profile.legalName} · {profile.status.replace(/_/g, ' ')}</p>}
      <div className="aio-brokerage-metrics">
        <div className="aio-brokerage-metric"><span>{requests.length}</span><label>Requests</label></div>
        <div className="aio-brokerage-metric"><span>{quotes.length}</span><label>Quotes to Review</label></div>
      </div>
      <div className="aio-brokerage-actions">
        <Link to={aioPaths.shipperShipmentNew} className="aio-btn aio-btn--gold">New Shipment</Link>
        <Link to={aioPaths.shipperQuotes} className="aio-btn aio-btn--outline">Quotes</Link>
        <Link to={aioPaths.shipperBilling} className="aio-btn aio-btn--outline">Billing</Link>
      </div>
    </div>
  );
}

export function ShipperOnboardingPage() {
  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <h1>Shipper Onboarding</h1>
      <p>Business information, billing contact, and freight preferences. Agreement placeholder — attorney review required before production.</p>
      <Link to={aioPaths.shipper} className="aio-btn aio-btn--gold">Continue</Link>
    </div>
  );
}

export function ShipperNewShipmentPage() {
  const orgId = getShipperOrganizationId(useDemoStore());

  const onSubmit = () => {
    createAndSubmitShipmentRequest(orgId, {
      pickupCity: 'Chicago',
      pickupState: 'IL',
      deliveryCity: 'Atlanta',
      deliveryState: 'GA',
      pickupDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      equipmentType: 'Dry Van',
      commodity: 'General Freight',
    });
  };

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <h1>New Shipment Request</h1>
      <p>Demo form — pickup/delivery, equipment, commodity. Full conditional fields in production configuration.</p>
      <button type="button" className="aio-btn aio-btn--gold" onClick={onSubmit}>Submit Request</button>
    </div>
  );
}

export function ShipperShipmentsPage() {
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const loads = store.loads.filter((l) => l.sourceType === 'brokerage' && l.shipperOrganizationId === orgId);

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <h1>Shipments</h1>
      {loads.map((l) => (
        <Link key={l.id} to={aioPaths.shipperShipment(l.id)} className="aio-brokerage-row">
          <strong>{l.loadNumber}</strong>
          <span>{l.originCity}, {l.originState} → {l.destinationCity}, {l.destinationState}</span>
          <span>{l.operationalStatus.replace(/_/g, ' ')}</span>
        </Link>
      ))}
    </div>
  );
}

export function ShipperShipmentDetailPage() {
  const { loadId } = useParams();
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const load = store.loads.find((l) => l.id === loadId && l.shipperOrganizationId === orgId);
  if (!load) return <p>Shipment not found.</p>;
  const fin = store.brokerageLoadFinancials.find((f) => f.loadId === load.id);

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipperShipments} className="aio-rr-link">← Shipments</Link>
      <h1>{load.loadNumber}</h1>
      <p>{load.originCity}, {load.originState} → {load.destinationCity}, {load.destinationState}</p>
      <p>Status: {load.operationalStatus.replace(/_/g, ' ')}</p>
      {fin && fin.confirmedShipperChargeMinor > 0 && (
        <p>Freight charge: {formatMoney(fin.confirmedShipperChargeMinor)}</p>
      )}
      <p className="aio-prototype-note">Shipment status only — no live GPS in Sprint 10.</p>
    </div>
  );
}

export function ShipperQuotesPage() {
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const quotes = getShipperQuotes(orgId, store);

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <h1>Quotes</h1>
      {quotes.map((q) => (
        <Link key={q.id} to={aioPaths.shipperQuote(q.id)} className="aio-brokerage-row">
          <strong>{q.quoteNumber}</strong>
          <span>{BROKERAGE_QUOTE_STATUS_LABELS[q.status]}</span>
          <span>{formatMoney(q.freightChargeMinor)}</span>
        </Link>
      ))}
    </div>
  );
}

export function ShipperQuoteDetailPage() {
  const { quoteId } = useParams();
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const quote = store.brokerageFreightQuotes.find((q) => q.id === quoteId && q.shipperOrganizationId === orgId);
  const req = quote ? store.shipmentRequests.find((r) => r.id === quote.shipmentRequestId) : undefined;
  if (!quote) return <p>Quote not found.</p>;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipperQuotes} className="aio-rr-link">← Quotes</Link>
      <h1>{quote.quoteNumber}</h1>
      {req && <p>{req.pickupCity}, {req.pickupState} → {req.deliveryCity}, {req.deliveryState}</p>}
      <p className="aio-brokerage-charge">Freight charge: {formatMoney(quote.freightChargeMinor)}</p>
      <p className="aio-prototype-note">Carrier pay and brokerage margin are not shown to shippers.</p>
      {quote.status === 'sent' && (
        <div className="aio-brokerage-actions">
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => acceptBrokerageQuote(quote.id, orgId)}>Accept Quote</button>
        </div>
      )}
    </div>
  );
}

export function ShipperBillingPage() {
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const invoices = store.brokerageShipperInvoices.filter((i) => i.shipperOrganizationId === orgId);

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <h1>Freight Billing</h1>
      <p className="aio-prototype-note">Brokerage shipper invoices — not All In One service billing.</p>
      {invoices.map((inv) => (
        <Link key={inv.id} to={aioPaths.shipperInvoice(inv.id)} className="aio-brokerage-row">
          <strong>{inv.invoiceNumber}</strong>
          <span>{inv.status.replace(/_/g, ' ')}</span>
          <span>{formatMoney(inv.totalMinor)}</span>
        </Link>
      ))}
    </div>
  );
}

export function ShipperInvoiceDetailPage() {
  const { invoiceId } = useParams();
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const inv = store.brokerageShipperInvoices.find((i) => i.id === invoiceId && i.shipperOrganizationId === orgId);
  const load = inv ? store.loads.find((l) => l.id === inv.loadId) : undefined;
  if (!inv) return <p>Invoice not found.</p>;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipperBilling} className="aio-rr-link">← Billing</Link>
      <h1>{inv.invoiceNumber}</h1>
      {load && <p>Load {load.loadNumber} · {load.originCity} → {load.destinationCity}</p>}
      <p>Total: {formatMoney(inv.totalMinor)} · Balance: {formatMoney(inv.balanceMinor)}</p>
    </div>
  );
}

export function ShipperRequestsListPage() {
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const requests = getShipperRequests(orgId, store);

  return (
    <div className="aio-brokerage">
      <h1>Shipment Requests</h1>
      {requests.map((r) => (
        <div key={r.id} className="aio-brokerage-card">
          <strong>{r.requestNumber}</strong>
          <p>{r.pickupCity}, {r.pickupState} → {r.deliveryCity}, {r.deliveryState}</p>
          <p>{SHIPMENT_REQUEST_STATUS_LABELS[r.status]}</p>
        </div>
      ))}
    </div>
  );
}
