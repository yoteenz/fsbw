import { FormEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatMoney, dollarsToMinor, minorToDollars } from '../../billing/money';
import {
  SHIPMENT_REQUEST_STATUS_LABELS,
  BROKERAGE_QUOTE_STATUS_LABELS,
} from '../../brokerage/brokerageConfig';
import type { LoadDistributionStrategy } from '../../brokerage/brokerageTypes';
import {
  applyLoadDistributionStrategy,
  assignRequestToStaff,
  computePricingDraft,
  createQuoteFromRequest,
  getPendingShipperRequests,
  getRequestAudit,
  requestMoreInformation,
  sendBrokerageQuoteWorkflow,
  setLoadCarrierRate,
} from '../../brokerage/brokerageWorkflow';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';

function requestAgeHours(createdAt: string): number {
  return Math.round((Date.now() - new Date(createdAt).getTime()) / 3_600_000);
}

export function BrokerageRequestsQueuePage() {
  const store = useDemoStore();
  const pending = useMemo(() => getPendingShipperRequests(store), [store]);

  return (
    <div className="aio-office-page aio-brokerage-requests">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeBrokerage} className="aio-office-link">← Control Center</Link>
        <h1>New Shipper Requests</h1>
        <p>Freight submitted by shippers — review, price, and convert to AIO brokered loads without re-entering lane data.</p>
      </header>

      {pending.length === 0 ? (
        <p className="aio-prototype-note">No open shipper requests.</p>
      ) : (
        <div className="aio-brokerage-requests__list">
          {pending.map((r) => {
            const shipper = store.shipperProfiles.find((p) => p.organizationId === r.shipperOrganizationId);
            const client = store.clients.find((c) => c.id === r.shipperOrganizationId);
            return (
              <Link key={r.id} to={aioPaths.officeBrokerageRequest(r.id)} className="aio-office-list-row aio-brokerage-requests__row">
                <div>
                  <strong>{r.requestNumber}</strong>
                  <span>{shipper?.legalName ?? client?.companyName ?? r.shipperOrganizationId}</span>
                </div>
                <div>
                  <span>{r.pickupCity}, {r.pickupState} → {r.deliveryCity}, {r.deliveryState}</span>
                  <span>{r.pickupDate} · {r.equipmentType}</span>
                </div>
                <div>
                  <span>{r.commodity ?? '—'} · {r.weight ?? '—'}</span>
                  <span>{requestAgeHours(r.createdAt)}h old</span>
                </div>
                <div>
                  <span className={`aio-status-pill aio-status-pill--${r.status}`}>
                    {SHIPMENT_REQUEST_STATUS_LABELS[r.status]}
                  </span>
                  {r.documentIds.length > 0 && <span>{r.documentIds.length} doc(s)</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BrokerageRequestDetailPage() {
  const { requestId = '' } = useParams();
  const store = useDemoStore();
  const staffId = store.officeStaffId ?? 'staff-7';

  const req = store.shipmentRequests.find((r) => r.id === requestId);
  const shipper = req ? store.shipperProfiles.find((p) => p.organizationId === req.shipperOrganizationId) : undefined;
  const client = req ? store.clients.find((c) => c.id === req.shipperOrganizationId) : undefined;
  const quote = req
    ? store.brokerageFreightQuotes.find((q) => q.shipmentRequestId === req.id)
    : undefined;
  const pricingDraft = quote
    ? store.brokerageQuotePricingDrafts?.find((p) => p.quoteId === quote.id)
    : undefined;
  const load = req?.convertedLoadId ? store.loads.find((l) => l.id === req.convertedLoadId) : undefined;
  const audit = useMemo(() => getRequestAudit(requestId, store), [requestId, store]);

  const [shipperRate, setShipperRate] = useState(() =>
    quote ? String(minorToDollars(quote.freightChargeMinor)) : '2850',
  );
  const [carrierRate, setCarrierRate] = useState(() =>
    pricingDraft ? String(minorToDollars(pricingDraft.targetCarrierRateMinor)) : '2400',
  );
  const [termsNote, setTermsNote] = useState(pricingDraft?.termsNote ?? 'Standard AIO brokerage terms apply.');
  const [validDays, setValidDays] = useState('3');
  const [infoMessage, setInfoMessage] = useState('');
  const [missingFields, setMissingFields] = useState('weight, commodity');
  const [distribution, setDistribution] = useState<LoadDistributionStrategy>('publish_load_board');
  const [inviteCarrierIds, setInviteCarrierIds] = useState<string[]>([]);

  if (!req) return <p>Request not found.</p>;

  const pricingPreview = computePricingDraft(dollarsToMinor(Number(shipperRate) || 0), dollarsToMinor(Number(carrierRate) || 0));

  const onCreateQuote = () => {
    const validUntil = new Date(Date.now() + Number(validDays) * 86400000).toISOString();
    const q = createQuoteFromRequest(
      req.id,
      {
        ...pricingPreview,
        termsNote,
        validUntil,
      },
      staffId,
    );
    if (q) sendBrokerageQuoteWorkflow(q.id);
  };

  const onRequestInfo = (e: FormEvent) => {
    e.preventDefault();
    requestMoreInformation(
      req.id,
      staffId,
      missingFields.split(',').map((s) => s.trim()).filter(Boolean),
      infoMessage || 'Please provide the missing information.',
    );
    setInfoMessage('');
  };

  const onSetCarrierRate = () => {
    if (!load) return;
    setLoadCarrierRate(load.id, dollarsToMinor(Number(carrierRate) || 0), staffId);
  };

  const onDistribute = () => {
    if (!load) return;
    applyLoadDistributionStrategy(load.id, distribution, staffId, {
      invitedCarrierOrgIds: inviteCarrierIds,
      offersEnabled: true,
    });
  };

  const activeCarriers = store.carrierNetworkProfiles.filter((c) => c.status === 'active');

  return (
    <div className="aio-office-page aio-brokerage-request-workspace">
      <Link to={aioPaths.officeBrokerageRequests} className="aio-office-link">← New Shipper Requests</Link>

      <div className="aio-brokerage-request-workspace__shell">
        <nav className="aio-brokerage-request-workspace__rail aio-desktop-only">
          <h3>Lifecycle</h3>
          <ol className="aio-brokerage-request-workspace__lifecycle">
            <li className={req.status !== 'draft' ? 'is-done' : 'is-active'}>Request</li>
            <li className={quote ? 'is-done' : req.status === 'under_review' ? 'is-active' : ''}>Quote</li>
            <li className={load ? 'is-done' : quote?.status === 'accepted' ? 'is-active' : ''}>Load</li>
            <li className={load?.brokerageCoverageStatus === 'booked' ? 'is-done' : load ? 'is-active' : ''}>Coverage</li>
          </ol>
        </nav>

        <div className="aio-brokerage-request-workspace__center">
          <header className="aio-office-page__header">
            <h1>{req.requestNumber}</h1>
            <p>{SHIPMENT_REQUEST_STATUS_LABELS[req.status]}</p>
          </header>

          <section className="aio-office-panel">
            <h2>Lane</h2>
            <dl className="aio-office-dl">
              <dt>Origin</dt>
              <dd>{req.pickupCompany ? `${req.pickupCompany} · ` : ''}{req.pickupCity}, {req.pickupState} {req.pickupZip ?? ''}</dd>
              <dt>Destination</dt>
              <dd>{req.deliveryCompany ? `${req.deliveryCompany} · ` : ''}{req.deliveryCity}, {req.deliveryState} {req.deliveryZip ?? ''}</dd>
              <dt>Pickup</dt>
              <dd>{req.pickupDate}{req.pickupTimeStart ? ` · ${req.pickupTimeStart}–${req.pickupTimeEnd ?? ''}` : ''}</dd>
              <dt>Delivery</dt>
              <dd>{req.deliveryDate}{req.deliveryTimeStart ? ` · ${req.deliveryTimeStart}–${req.deliveryTimeEnd ?? ''}` : ''}</dd>
            </dl>
          </section>

          <section className="aio-office-panel">
            <h2>Freight</h2>
            <dl className="aio-office-dl">
              <dt>Equipment</dt>
              <dd>{req.equipmentType}{req.trailerLengthFt ? ` · ${req.trailerLengthFt}'` : ''} · {req.fullPartial ?? 'full'}</dd>
              <dt>Commodity</dt><dd>{req.commodity ?? '—'}</dd>
              <dt>Weight</dt><dd>{req.weight ?? '—'}</dd>
              <dt>Reference</dt><dd>{req.poNumber ?? req.referenceNumbers ?? '—'}</dd>
              <dt>Instructions</dt><dd>{req.specialInstructions ?? '—'}</dd>
            </dl>
          </section>

          {req.documentIds.length > 0 && (
            <section className="aio-office-panel">
              <h2>Documents</h2>
              <ul>{req.documentIds.map((d) => <li key={d}>{d}</li>)}</ul>
            </section>
          )}

          <section className="aio-office-panel">
            <h2>Actions</h2>
            <div className="aio-office-actions">
              <button type="button" className="aio-btn aio-btn--sm" onClick={() => assignRequestToStaff(req.id, staffId)}>
                Assign to Me
              </button>
              {!quote && ['under_review', 'submitted', 'quote_preparation'].includes(req.status) && (
                <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={onCreateQuote}>
                  Create &amp; Send Quote
                </button>
              )}
              {quote && quote.status === 'draft' && (
                <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => sendBrokerageQuoteWorkflow(quote.id)}>
                  Send Quote
                </button>
              )}
              {load && (
                <Link to={aioPaths.officeBrokerageLoad(load.id)} className="aio-btn aio-btn--sm">Open Load</Link>
              )}
            </div>
          </section>

          <section className="aio-office-panel">
            <h2>Request More Information</h2>
            <form onSubmit={onRequestInfo} className="aio-brokerage-request-workspace__info-form">
              <label>Missing fields (comma-separated)
                <input value={missingFields} onChange={(e) => setMissingFields(e.target.value)} />
              </label>
              <label>Message to shipper
                <textarea value={infoMessage} onChange={(e) => setInfoMessage(e.target.value)} rows={2} />
              </label>
              <button type="submit" className="aio-btn aio-btn--outline-dark aio-btn--sm">Send to Shipper</button>
            </form>
          </section>

          {audit.length > 0 && (
            <section className="aio-office-panel">
              <h2>Audit Trail</h2>
              <ul className="aio-office-timeline">
                {audit.map((e) => (
                  <li key={e.id}>
                    <time>{new Date(e.createdAt).toLocaleString()}</time>
                    <span>{e.action.replace(/_/g, ' ')}</span>
                    {e.note && <span> — {e.note}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="aio-brokerage-request-workspace__intel aio-desktop-only">
          <section className="aio-office-panel">
            <h2>Shipper</h2>
            <p><strong>{shipper?.legalName ?? client?.companyName}</strong></p>
            <p>{shipper?.primaryContactName ?? '—'}</p>
            <p>{shipper?.primaryEmail ?? client?.contactEmail ?? '—'}</p>
            <Link to={aioPaths.officeBrokerageShipper(req.shipperOrganizationId)} className="aio-office-link">Shipper profile</Link>
          </section>

          <section className="aio-office-panel">
            <h2>Pricing (Internal)</h2>
            <label>Shipper rate ($)
              <input type="number" value={shipperRate} onChange={(e) => setShipperRate(e.target.value)} />
            </label>
            <label>Target carrier rate ($)
              <input type="number" value={carrierRate} onChange={(e) => setCarrierRate(e.target.value)} />
            </label>
            <label>Quote valid (days)
              <input type="number" min={1} value={validDays} onChange={(e) => setValidDays(e.target.value)} />
            </label>
            <label>Terms
              <textarea value={termsNote} onChange={(e) => setTermsNote(e.target.value)} rows={2} />
            </label>
            <dl className="aio-office-dl aio-office-dl--compact">
              <dt>Est. margin</dt>
              <dd>{formatMoney(pricingPreview.estimatedMarginMinor)} ({pricingPreview.estimatedMarginPercent?.toFixed(1) ?? '—'}%)</dd>
            </dl>
            {quote && (
              <p>Quote {quote.quoteNumber}: {BROKERAGE_QUOTE_STATUS_LABELS[quote.status]}</p>
            )}
          </section>

          {load && (
            <section className="aio-office-panel">
              <h2>Carrier Distribution</h2>
              <label>Strategy
                <select value={distribution} onChange={(e) => setDistribution(e.target.value as LoadDistributionStrategy)}>
                  <option value="hold">Hold / Do Not Publish</option>
                  <option value="publish_load_board">Publish to AIO Load Board</option>
                  <option value="private_invite">Private Invite</option>
                  <option value="matched_carriers">Matched Carriers</option>
                </select>
              </label>
              {distribution === 'private_invite' && (
                <fieldset>
                  <legend>Invite carriers</legend>
                  {activeCarriers.filter((c) => c.organizationId).map((c) => (
                    <label key={c.id} className="aio-check">
                      <input
                        type="checkbox"
                        checked={inviteCarrierIds.includes(c.organizationId!)}
                        onChange={(e) => {
                          const orgId = c.organizationId!;
                          setInviteCarrierIds((ids) =>
                            e.target.checked ? [...ids, orgId] : ids.filter((x) => x !== orgId),
                          );
                        }}
                      />
                      {c.legalName}
                    </label>
                  ))}
                </fieldset>
              )}
              <div className="aio-office-actions">
                <button type="button" className="aio-btn aio-btn--sm" onClick={onSetCarrierRate}>Set Carrier Rate</button>
                <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={onDistribute}>Apply Distribution</button>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
