import { Link } from 'react-router-dom';
import type { ClientCommandCenterView } from '../../portal/clientCommandCenterTypes';
import { ROAD_READY_PRODUCT_NAME } from '../../road-ready/roadReadyConfig';
import { aioPaths } from '../../utils/paths';
import { RoadReadyRing } from '../RoadReadyRing';

type Props = {
  view: ClientCommandCenterView;
};

const quickActionIcons: Record<string, string> = {
  roadmap: '🗺',
  documents: '📄',
  services: '⚙',
  messages: '💬',
  profile: '👤',
  help: '?',
};

export function MobilePortalHome({ view }: Props) {
  const rr = view.roadReady;

  return (
    <div className="aio-mobile-portal-dash">
      <header className="aio-mobile-portal-dash__header">
        <p className="aio-mobile-portal-dash__greeting">{view.greeting}</p>
        <div className="aio-mobile-portal-dash__header-row">
          <h1 className="aio-mobile-portal-dash__name">{view.context.companyName}</h1>
          <Link to={aioPaths.portalNotifications} className="aio-mobile-portal-dash__notif" aria-label="Notifications">
            🔔
            {view.communication.unreadNotifications > 0 ? (
              <span className="aio-mobile-portal-dash__notif-badge">{view.communication.unreadNotifications}</span>
            ) : null}
          </Link>
        </div>
      </header>

      {rr && !view.context.isShipper ? (
        <section className="aio-mobile-portal-dash__progress">
          <p className="aio-mobile-portal-dash__progress-label">{ROAD_READY_PRODUCT_NAME} Progress</p>
          <div className="aio-mobile-portal-dash__progress-row">
            <RoadReadyRing setupProgress={rr.setupProgress} verifiedProgress={rr.verifiedProgress} dual size="sm" />
            <div>
              <p className="aio-mobile-portal-dash__progress-pct">{rr.setupProgress}%</p>
              <p className="aio-mobile-portal-dash__progress-meta">
                {rr.attentionCount} tasks need attention
              </p>
            </div>
          </div>
          <Link to={rr.ctaHref} className="aio-btn aio-btn--outline-gold aio-mobile-portal-dash__roadmap-btn">
            View Roadmap
          </Link>
        </section>
      ) : null}

      <section className="aio-mobile-portal-dash__actions">
        <p className="aio-mobile-portal-dash__section-label">Quick Actions</p>
        <div className="aio-mobile-portal-dash__grid">
          {view.quickActions.slice(0, 6).map((action) => (
            <Link key={action.id} to={action.href} className="aio-mobile-portal-dash__action">
              <span className="aio-mobile-portal-dash__action-icon" aria-hidden="true">
                {quickActionIcons[action.id] ?? '→'}
              </span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
