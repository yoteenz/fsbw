import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BROKERAGE_QUOTE_STATUS_LABELS,
  DEMO_BROKERAGE_LABEL,
  SHIPMENT_REQUEST_STATUS_LABELS,
} from '../../brokerage/brokerageConfig';
import { formatMoney } from '../../billing/money';
import { useDemoStore } from '../../demo/useDemoStore';
import { ShipperFreightError } from '../../shipper/ShipperFreightError';
import { useShipperFreightRepository } from '../../shipper/useShipperFreightRepository';
import {
  useShipperInvoicesList,
  useShipperQuotesList,
  useShipperRequestsList,
  useShipperShipmentsList,
} from '../../shipper/useShipperPortalData';
import { aioPaths } from '../../utils/paths';
import { useCallback, useEffect, useState } from 'react';
import type { BrokerageFreightQuote, BrokerageShipperInvoice } from '../../brokerage/brokerageTypes';
import type { Load } from '../../dispatch/dispatchTypes';
import { getLoadFinancials } from '../../demo/brokerageActions';
import { isShipperFreightDemoMode } from '../../shipper/shipperFreightRepository';

export function ShipperHomePage() {
  const store = useDemoStore();
  const { orgId, loading: authLoading, error: repoError } = useShipperFreightRepository();
  const { data: requests, loading: reqLoading, error: reqError } = useShipperRequestsList();
  const { data: quotes, loading: quoteLoading, error: quoteError } = useShipperQuotesList();
  const profile = store.shipperProfiles.find((p) => p.organizationId === orgId);
  const sentQuotes = (quotes ?? []).filter((q) => q.status === 'sent');

  if (authLoading || reqLoading || quoteLoading) return <p className="aio-prototype-note">Loading…</p>;
  if (repoError || reqError || quoteError) {
    return <ShipperFreightError message={repoError ?? reqError ?? quoteError ?? undefined} />;
  }

  return (
    <div className="aio-brokerage">
      <header className="aio-brokerage-hero">
        <h1>Shipper Portal</h1>
        <p>{DEMO_BROKERAGE_LABEL}</p>
      </header>
      {profile && <p>{profile.legalName} · {profile.status.replace(/_/g, ' ')}</p>}
      <div className="aio-brokerage-metrics">
        <div className="aio-brokerage-metric"><span>{requests?.length ?? 0}</span><label>Requests</label></div>
        <div className="aio-brokerage-metric"><span>{sentQuotes.length}</span><label>Quotes to Review</label></div>
      </div>
      <div className="aio-brokerage-actions">
        <Link to={aioPaths.shipperShipWithAio} className="aio-btn aio-btn--gold">Ship with AIO</Link>
        <Link to={aioPaths.shipperRequests} className="aio-btn aio-btn--outline">Requests</Link>
        <Link to={aioPaths.shipperShipments} className="aio-btn aio-btn--outline">Shipments</Link>
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
  const navigate = useNavigate();
  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <h1>New Shipment Request</h1>
      <p>Use the structured freight wizard to submit lane, freight, and schedule details once — AIO Office receives it as a brokerage opportunity.</p>
      <button type="button" className="aio-btn aio-btn--gold" onClick={() => navigate(aioPaths.shipperShipWithAio)}>
        Open Ship with AIO Wizard
      </button>
    </div>
  );
}

export function ShipperShipmentsPage() {
  const { data: loads, loading, error } = useShipperShipmentsList();
  if (loading) return <p className="aio-prototype-note">Loading shipments…</p>;
  if (error) return <ShipperFreightError message={error} />;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <h1>Shipments</h1>
      {(loads ?? []).map((l) => (
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
  const { repository, orgId, loading: authLoading, error: repoError } = useShipperFreightRepository();
  const [load, setLoad] = useState<Load | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!loadId) return;
    const result = await repository.getShipment(orgId, loadId);
    if (!result.ok) {
      setFetchError(result.error.message);
      return;
    }
    setLoad(result.data);
  }, [loadId, orgId, repository]);

  useEffect(() => {
    if (authLoading || repoError) return;
    void loadData();
  }, [authLoading, repoError, loadData]);

  if (authLoading) return <p className="aio-prototype-note">Loading…</p>;
  if (repoError || fetchError) return <ShipperFreightError message={repoError ?? fetchError ?? undefined} onRetry={() => void loadData()} />;
  if (!load) return <p>Shipment not found.</p>;

  const fin = isShipperFreightDemoMode() ? getLoadFinancials(load.id, store) : null;

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
  const { data: quotes, loading, error } = useShipperQuotesList();
  if (loading) return <p className="aio-prototype-note">Loading quotes…</p>;
  if (error) return <ShipperFreightError message={error} />;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <h1>Quotes</h1>
      {(quotes ?? []).map((q) => (
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
  const { repository, orgId, loading: authLoading, error: repoError } = useShipperFreightRepository();
  const [quote, setQuote] = useState<BrokerageFreightQuote | null>(null);
  const [reqLabel, setReqLabel] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!quoteId) return;
    const result = await repository.getQuote(orgId, quoteId);
    if (!result.ok) {
      setActionError(result.error.message);
      return;
    }
    setQuote(result.data);
    if (result.data) {
      const reqResult = await repository.getRequest(orgId, result.data.shipmentRequestId);
      if (reqResult.ok && reqResult.data) {
        setReqLabel(`${reqResult.data.pickupCity}, ${reqResult.data.pickupState} → ${reqResult.data.deliveryCity}, ${reqResult.data.deliveryState}`);
      } else if (isShipperFreightDemoMode()) {
        const req = store.shipmentRequests.find((r) => r.id === result.data!.shipmentRequestId);
        if (req) setReqLabel(`${req.pickupCity}, ${req.pickupState} → ${req.deliveryCity}, ${req.deliveryState}`);
      }
    }
  }, [quoteId, orgId, repository, store.shipmentRequests]);

  useEffect(() => {
    if (authLoading || repoError) return;
    void load();
  }, [authLoading, repoError, load]);

  const onAccept = async () => {
    if (!quoteId) return;
    const result = await repository.acceptQuote(orgId, quoteId);
    if (!result.ok) {
      setActionError(result.error.message);
      return;
    }
    void load();
  };

  if (authLoading) return <p className="aio-prototype-note">Loading…</p>;
  if (repoError || actionError) return <ShipperFreightError message={repoError ?? actionError ?? undefined} onRetry={() => void load()} />;
  if (!quote) return <p>Quote not found.</p>;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipperQuotes} className="aio-rr-link">← Quotes</Link>
      <h1>{quote.quoteNumber}</h1>
      {reqLabel && <p>{reqLabel}</p>}
      <p className="aio-brokerage-charge">Freight charge: {formatMoney(quote.freightChargeMinor)}</p>
      <p className="aio-prototype-note">Carrier pay and brokerage margin are not shown to shippers.</p>
      {quote.status === 'sent' && (
        <div className="aio-brokerage-actions">
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => void onAccept()}>Accept Quote</button>
        </div>
      )}
    </div>
  );
}

export function ShipperBillingPage() {
  const { data: invoices, loading, error } = useShipperInvoicesList();
  if (loading) return <p className="aio-prototype-note">Loading billing…</p>;
  if (error) return <ShipperFreightError message={error} />;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <h1>Freight Billing</h1>
      <p className="aio-prototype-note">Brokerage shipper invoices — not All In One service billing.</p>
      {(invoices ?? []).map((inv) => (
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
  const { repository, orgId, loading: authLoading, error: repoError } = useShipperFreightRepository();
  const [inv, setInv] = useState<BrokerageShipperInvoice | null>(null);
  const [loadSummary, setLoadSummary] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || repoError || !invoiceId) return;
    void repository.getInvoice(orgId, invoiceId).then(async (result) => {
      if (!result.ok) {
        setFetchError(result.error.message);
        return;
      }
      if (!result.data) return;
      setInv(result.data);
      const loadResult = await repository.getShipment(orgId, result.data.loadId);
      if (loadResult.ok && loadResult.data) {
        setLoadSummary(`${loadResult.data.loadNumber} · ${loadResult.data.originCity} → ${loadResult.data.destinationCity}`);
      }
    });
  }, [authLoading, repoError, invoiceId, orgId, repository]);

  if (authLoading) return <p className="aio-prototype-note">Loading…</p>;
  if (repoError || fetchError) return <ShipperFreightError message={repoError ?? fetchError ?? undefined} />;
  if (!inv) return <p>Invoice not found.</p>;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipperBilling} className="aio-rr-link">← Billing</Link>
      <h1>{inv.invoiceNumber}</h1>
      {loadSummary && <p>Load {loadSummary}</p>}
      <p>Total: {formatMoney(inv.totalMinor)} · Balance: {formatMoney(inv.balanceMinor)}</p>
    </div>
  );
}

export function ShipperRequestsListPage() {
  const { data: requests, loading, error, reload } = useShipperRequestsList();
  if (loading) return <p className="aio-prototype-note">Loading requests…</p>;
  if (error) return <ShipperFreightError message={error} onRetry={reload} />;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
      <header className="aio-brokerage-hero aio-brokerage-hero--compact">
        <h1>Freight Requests</h1>
      </header>
      <Link to={aioPaths.shipperShipWithAio} className="aio-btn aio-btn--gold aio-btn--sm">Ship with AIO</Link>
      {(requests ?? []).length === 0 ? (
        <p className="aio-prototype-note">No requests yet.</p>
      ) : (
        (requests ?? []).map((r) => (
          <Link key={r.id} to={aioPaths.shipperRequest(r.id)} className="aio-brokerage-row">
            <strong>{r.requestNumber}</strong>
            <span>{r.pickupCity}, {r.pickupState} → {r.deliveryCity}, {r.deliveryState}</span>
            <span>{SHIPMENT_REQUEST_STATUS_LABELS[r.status]}</span>
          </Link>
        ))
      )}
    </div>
  );
}
