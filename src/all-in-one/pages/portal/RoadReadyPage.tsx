import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROAD_READY_PRODUCT_NAME } from '../../road-ready/roadReadyConfig';
import { useRoadReady } from '../../road-ready/useRoadReady';
import { RoadReadyRing } from '../../components/RoadReadyRing';
import { RoadReadyCategoryCard } from '../../components/RoadReadyCategoryCard';
import { RoadReadyAttentionCenter, RoadReadyNextStep } from '../../components/RoadReadyAttentionCenter';
import { RoadReadyStatusBadge } from '../../components/RoadReadyStatusBadge';
import { requestHelpFromRoadReady } from '../../demo/roadReadyActions';
import { expirationLabel } from '../../road-ready/roadReadyScoring';
import { aioPaths } from '../../utils/paths';

export function RoadReadyPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categoryFilter = params.get('category');
  const {
    isShipper,
    summary,
    attention,
    nextCopy,
    nextAction,
    history,
    profile,
    items,
    organizationId,
    needsOnboarding,
  } = useRoadReady();

  if (isShipper) {
    return (
      <div className="aio-road-ready">
        <h1>Shipper Dashboard</h1>
        <p>Road Ready profiles are designed for carrier and owner-operator accounts.</p>
        <Link to={aioPaths.portal} className="aio-btn aio-btn--gold">Return to Dashboard</Link>
      </div>
    );
  }

  if (!summary || !profile) {
    return (
      <div className="aio-road-ready aio-rr-empty">
        <h1>{ROAD_READY_PRODUCT_NAME}</h1>
        <p>Build your persistent business-readiness profile to track setup progress and verified status.</p>
        <Link to={aioPaths.portalOnboarding} className="aio-btn aio-btn--gold">Start {ROAD_READY_PRODUCT_NAME}</Link>
      </div>
    );
  }

  const { scores, categories } = summary;
  const filteredCategories = categoryFilter
    ? categories.filter((c) => c.category === categoryFilter)
    : categories;

  return (
    <div className="aio-road-ready">
      {needsOnboarding && (
        <section className="aio-portal-banner aio-portal-banner--rr">
          <p><strong>Setup in progress.</strong> Continue onboarding to complete your profile.</p>
          <Link to={aioPaths.portalOnboarding} className="aio-btn aio-btn--gold aio-btn--sm">Continue Setup</Link>
        </section>
      )}
      <header className="aio-rr-hero">
        <div className="aio-rr-hero__ring">
          <RoadReadyRing
            setupProgress={scores.setupProgress}
            verifiedProgress={scores.verifiedProgress}
            dual
            size="lg"
            sublabel={`${scores.needsAttentionCount} items still need attention`}
          />
        </div>
        <div className="aio-rr-hero__copy">
          <p className="aio-label">Your Business Is</p>
          <h1>{scores.setupProgress}% {ROAD_READY_PRODUCT_NAME}</h1>
          <ul className="aio-rr-hero__stats">
            <li><strong>{scores.verifiedCount}</strong> verified</li>
            <li><strong>{scores.selfReportedCount}</strong> self-reported</li>
            <li><strong>{scores.needsAttentionCount}</strong> need attention</li>
            <li><strong>{scores.inProgressCount}</strong> in progress</li>
          </ul>
          <p className="aio-prototype-note">
            Setup progress reflects information provided. Verified status reflects items confirmed by All In One.
            This is not a legal compliance determination.
          </p>
          {profile.mode === 'monitoring' && (
            <p className="aio-rr-mode-badge">Monitoring Mode — renewals and expirations tracked</p>
          )}
        </div>
      </header>

      {nextCopy && (
        <RoadReadyNextStep
          title={nextCopy.title}
          body={nextCopy.body}
          cta={nextCopy.cta}
          onAction={
            nextAction?.action === 'request_help'
              ? () => {
                  const ri = items.find((i) => i.id === nextAction.itemId);
                  if (ri) {
                    const reqId = requestHelpFromRoadReady(organizationId, ri);
                    navigate(aioPaths.portalRequest(reqId));
                  }
                }
              : undefined
          }
        />
      )}

      <div className="aio-rr-layout">
        <main className="aio-rr-main">
          <RoadReadyAttentionCenter items={attention} />

          <section className="aio-rr-categories">
            <h2 className="aio-rr-section-title">Categories</h2>
            <div className="aio-rr-category-grid">
              {filteredCategories.map((cat) => (
                <RoadReadyCategoryCard key={cat.category} category={cat} />
              ))}
            </div>
          </section>

          <section className="aio-rr-items-detail">
            <h2 className="aio-rr-section-title">All Items</h2>
            <ul className="aio-rr-item-list">
              {items.filter((i) => i.category !== 'operate').map((item) => (
                <li key={item.id} className="aio-rr-item-row">
                  <div>
                    <strong>{item.title}</strong>
                    {item.reason && <p className="aio-rr-item-reason">{item.reason}</p>}
                    {item.expiresAt && <span className="aio-rr-expiration">{expirationLabel(item.expiresAt)}</span>}
                  </div>
                  <div className="aio-rr-item-badges">
                    <RoadReadyStatusBadge kind="status" value={item.status} />
                    <RoadReadyStatusBadge kind="verification" value={item.verificationStatus} />
                  </div>
                  <div className="aio-rr-item-actions">
                    {(item.status === 'action_needed' || item.status === 'needs_review') && item.serviceSlug && (
                      <button
                        type="button"
                        className="aio-btn aio-btn--gold aio-btn--sm"
                        onClick={() => {
                          const reqId = requestHelpFromRoadReady(organizationId, item);
                          navigate(aioPaths.portalRequest(reqId));
                        }}
                      >
                        Get Help With This
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="aio-rr-operate">
            <h2 className="aio-rr-section-title">Operate &amp; Grow</h2>
            <p className="aio-prototype-note">Optional operational services — do not affect Road Ready compliance progress.</p>
            <div className="aio-rr-operate-grid">
              <article className="aio-rr-operate-card">
                <h3>Dispatch Services</h3>
                <p>Operational freight matching support.</p>
                <Link to={aioPaths.dispatching}>Learn More →</Link>
              </article>
              <article className="aio-rr-operate-card">
                <h3>Factoring</h3>
                <p>Working capital through invoice services.</p>
                <Link to={aioPaths.portalFactoring}>View Factoring →</Link>
              </article>
              <article className="aio-rr-operate-card">
                <h3>Brokerage Services</h3>
                <p>Freight coordination where applicable.</p>
                <Link to={aioPaths.brokerage}>Learn More →</Link>
              </article>
            </div>
          </section>

          <section className="aio-rr-history">
            <h2 className="aio-rr-section-title">{ROAD_READY_PRODUCT_NAME} History</h2>
            {history.length === 0 ? (
              <p className="aio-empty-state__text">No history yet.</p>
            ) : (
              <ul className="aio-rr-history__list">
                {history.slice(0, 10).map((ev) => (
                  <li key={ev.id}>
                    <time dateTime={ev.createdAt}>{new Date(ev.createdAt).toLocaleDateString()}</time>
                    <span>{ev.title}</span>
                    {ev.detail && <small>{ev.detail}</small>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <button type="button" className="aio-btn aio-btn--outline aio-btn--sm aio-rr-summary-placeholder" disabled title="Coming soon">
            Download Summary (Coming Soon)
          </button>
        </main>
      </div>
    </div>
  );
}
