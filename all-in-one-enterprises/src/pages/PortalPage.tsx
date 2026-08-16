import { Link } from 'react-router-dom';
import { useClientCommandCenter } from '../portal/useClientCommandCenter';
import {
  AllCaughtUpBanner,
  AttentionCenter,
  BusinessHealthGrid,
  CommandCenterHeader,
  CurrentLoadHero,
  MoneySummaryCards,
  NextActionHero,
  NotificationDigest,
  QuickActionsBar,
  RoadReadyHero,
  UpcomingList,
} from '../components/CommandCenterComponents';
import { ActiveJourneysPanel } from '../components/journey/ActiveJourneysPanel';
import { aioPaths } from '../utils/paths';

export function PortalPage() {
  const view = useClientCommandCenter();

  if (view.context.isShipper) {
    return (
      <div className="aio-cc-home">
        <CommandCenterHeader view={view} />
        <NextActionHero action={view.nextAction} />
        <AttentionCenter items={view.attentionItems} />
        <section className="aio-cc-panel">
          <h2>Shipper Portal</h2>
          <p>Shipment requests, quotes, and freight billing.</p>
          <Link to={aioPaths.shipper} className="aio-btn aio-btn--gold">Open Shipper Dashboard →</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="aio-cc-home">
      <CommandCenterHeader view={view} />
      <NotificationDigest view={view} />
      <NextActionHero action={view.nextAction} />
      <AllCaughtUpBanner view={view} />
      <AttentionCenter items={view.attentionItems} />

      <div className="aio-cc-home-grid">
        <div className="aio-cc-home-main">
          <ActiveJourneysPanel />
          <RoadReadyHero view={view} />
          <BusinessHealthGrid view={view} />
          <CurrentLoadHero view={view} />
          {view.fleet && view.fleet.vehicles.length > 0 && (
            <section className="aio-cc-panel">
              <h2 className="aio-cc-panel__title">My Fleet</h2>
              {view.fleet.vehicles.map((v) => (
                <Link key={v.id} to={v.href} className="aio-cc-vehicle-card">
                  <strong>{v.label}</strong>
                  <span>{v.subtitle}</span>
                  <span className={`aio-badge aio-badge--${v.roadReadyTone === 'complete' ? 'complete' : 'needed'}`}>{v.roadReadyLabel}</span>
                </Link>
              ))}
              <Link to={aioPaths.portalFleet} className="aio-portal-panel__link">View Fleet →</Link>
            </section>
          )}
          <MoneySummaryCards view={view} />
        </div>
        <aside className="aio-cc-home-aside">
          {view.today.length > 0 && (
            <section className="aio-cc-panel">
              <h2 className="aio-cc-panel__title">Today</h2>
              {view.today.map((t) => (
                <div key={t.id} className="aio-portal-list__item">
                  <span>{t.title}</span>
                  <Link to={t.href} className="aio-badge aio-badge--progress">Open</Link>
                </div>
              ))}
            </section>
          )}
          <UpcomingList view={view} />
          <QuickActionsBar view={view} />
          <section className="aio-cc-panel">
            <h2 className="aio-cc-panel__title">Documents</h2>
            <p>{view.documents.needed} needed · {view.documents.underReview} under review</p>
            <Link to={aioPaths.portalDocuments} className="aio-portal-panel__link">Document Center →</Link>
          </section>
          <section className="aio-cc-panel">
            <h2 className="aio-cc-panel__title">Recent Activity</h2>
            {view.activityPreview.slice(0, 4).map((a) => (
              <div key={a.id} className="aio-portal-list__item">
                <span>{a.title}</span>
                <small>{new Date(a.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
            <Link to={aioPaths.portalActivity} className="aio-portal-panel__link">Full timeline →</Link>
          </section>
        </aside>
      </div>

      {view.moduleErrors.factoring && (
        <p className="aio-cc-module-error">Factoring summary temporarily unavailable.</p>
      )}
    </div>
  );
}
