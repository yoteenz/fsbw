import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../../demo/useDemoStore';
import {
  getDispatchMetrics,
  getEnrollment,
  getLoads,
  getOrganizationId,
  getTruckProfiles,
} from '../../../demo/dispatchActions';
import { LoadLane, LoadMetrics, LoadStatusBadge, TruckAvailabilityBadge } from '../../../components/dispatch/LoadDisplay';
import { nextCustomerAction } from '../../../dispatch/dispatchRules';
import { DEMO_DISPATCH_LABEL } from '../../../dispatch/dispatchConfig';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';
import { requestDispatchService } from '../../../demo/dispatchActions';

export function DispatchHomePage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const enrollment = getEnrollment(orgId, store);
  const loads = getLoads(orgId, store);
  const trucks = getTruckProfiles(orgId, store);
  const metrics = useMemo(() => getDispatchMetrics(orgId, store), [orgId, store.loads]);

  if (!enrollment || enrollment.status === 'interested') {
    return (
      <div className="aio-dispatch aio-dispatch--inactive">
        <header className="aio-dispatch-hero">
          <p className="aio-dispatch-hero__eyebrow">All In One Dispatch</p>
          <h1>Put your truck to work.</h1>
          <p>
            All In One helps owner-operators and fleets find and manage loads with a dedicated dispatcher.
            We coordinate opportunities, booking, documents, and operational updates — without income guarantees.
          </p>
        </header>
        <div className="aio-dispatch-cta">
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => requestDispatchService(orgId)}>
            Request Dispatch Services
          </button>
          <Link to={aioPaths.dispatching} className="aio-btn aio-btn--outline">
            Learn How It Works
          </Link>
        </div>
        <p className="aio-prototype-note">{DEMO_DISPATCH_LABEL}</p>
      </div>
    );
  }

  if (enrollment.status === 'onboarding' || !enrollment.onboardingComplete) {
    return (
      <div className="aio-dispatch">
        <header className="aio-dispatch-hero">
          <h1>Dispatch Onboarding</h1>
          <p>Complete your operating profile so your dispatcher can match opportunities.</p>
        </header>
        <Link to={aioPaths.portalDispatchOnboarding} className="aio-btn aio-btn--gold">
          Continue Onboarding
        </Link>
      </div>
    );
  }

  const activeLoad = loads.find((l) => !['complete', 'cancelled', 'opportunity'].includes(l.operationalStatus) && l.offerStatus === 'accepted');
  const pendingOffer = loads.find((l) => l.offerStatus === 'awaiting_carrier');
  const nextAction = activeLoad ? nextCustomerAction(activeLoad) : pendingOffer ? 'Review load offer' : null;
  const docsNeeded = loads.filter((l) => l.operationalStatus === 'pod_needed' && !l.podDocumentId);

  return (
    <div className="aio-dispatch">
      <header className="aio-dispatch-hero aio-dispatch-hero--compact">
        <h1>Dispatch</h1>
        <p className="aio-prototype-note">{DEMO_DISPATCH_LABEL}</p>
      </header>

      {activeLoad && (
        <section className="aio-dispatch-card aio-dispatch-card--primary">
          <h2>Current Load</h2>
          <LoadStatusBadge load={activeLoad} />
          <LoadLane load={activeLoad} />
          <LoadMetrics load={activeLoad} compact />
          {nextAction && (
            <Link to={aioPaths.portalDispatchLoad(activeLoad.id)} className="aio-btn aio-btn--gold aio-dispatch-next-action">
              {nextAction}
            </Link>
          )}
        </section>
      )}

      {!activeLoad && pendingOffer && (
        <section className="aio-dispatch-card aio-dispatch-card--offer">
          <h2>Load Offer</h2>
          <LoadLane load={pendingOffer} />
          <p>Gross: {formatMoney(pendingOffer.grossMinor)} · Pickup: {pendingOffer.pickupDate}</p>
          <Link to={aioPaths.portalDispatchLoad(pendingOffer.id)} className="aio-btn aio-btn--gold">
            Review Load
          </Link>
        </section>
      )}

      <section className="aio-dispatch-card">
        <h2>Truck Availability</h2>
        {trucks.length === 0 ? (
          <p className="aio-empty-state__text">No trucks on dispatch profile.</p>
        ) : (
          trucks.map((t) => (
            <div key={t.id} className="aio-dispatch-truck-row">
              <strong>{t.nickname}</strong>
              <TruckAvailabilityBadge truck={t} />
              {t.nextAvailableCity && (
                <span>{t.nextAvailableCity}, {t.nextAvailableState} · {t.nextAvailableDate}</span>
              )}
            </div>
          ))
        )}
      </section>

      <section className="aio-dispatch-card">
        <h2>This Week</h2>
        <dl className="aio-dispatch-metrics aio-dispatch-metrics--inline">
          <div><dt>Active</dt><dd>{metrics.activeLoads}</dd></div>
          <div><dt>Completed</dt><dd>{metrics.completedLoads}</dd></div>
          <div><dt>Loaded mi</dt><dd>{metrics.loadedMiles}</dd></div>
          <div><dt>Gross</dt><dd>{formatMoney(metrics.grossMinor)}</dd></div>
        </dl>
        <Link to={aioPaths.portalDispatchHistory} className="aio-rr-link">View load history →</Link>
      </section>

      {docsNeeded.length > 0 && (
        <section className="aio-dispatch-card aio-dispatch-card--warn">
          <h2>Documents Needed</h2>
          {docsNeeded.map((l) => (
            <Link key={l.id} to={aioPaths.portalDispatchLoad(l.id)}>
              {l.loadNumber} — Upload POD
            </Link>
          ))}
        </section>
      )}

      <div className="aio-dispatch-actions">
        <Link to={aioPaths.portalDispatchLoads} className="aio-btn aio-btn--outline">All Loads</Link>
        <Link to={aioPaths.officeMessages} className="aio-btn aio-btn--outline">Message Dispatcher</Link>
      </div>
    </div>
  );
}
