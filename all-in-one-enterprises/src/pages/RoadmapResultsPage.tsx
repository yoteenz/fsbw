import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { roadmapRepository } from '../repositories/roadmapRepository';
import { getServiceBySlug } from '../data/services';
import { useServicePlan } from '../components/AIOServicePlanBar';
import {
  RoadmapCategoryGroup,
  RoadmapProgressBars,
} from '../components/AIORoadmapResults';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';
import type { RoadmapCategory, RoadmapItem } from '../roadmap/roadmapTypes';

export function RoadmapResultsPage() {
  const roadmap = roadmapRepository.load();
  const { add } = useServicePlan();

  const grouped = useMemo(() => {
    if (!roadmap) return {};
    const groups: Partial<Record<RoadmapCategory, RoadmapItem[]>> = {};
    for (const item of roadmap.items) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category]!.push(item);
    }
    return groups;
  }, [roadmap]);

  if (!roadmap) {
    return (
      <div className="aio-page-content">
        <div className="aio-container">
          <h1>No Roadmap Yet</h1>
          <p>Complete the Smart Intake to generate your preliminary roadmap.</p>
          <Link to={aioPaths.getStarted}>
            <AIOButton variant="gold">Start Smart Intake</AIOButton>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddService = (item: RoadmapItem) => {
    if (!item.serviceSlug) return;
    const service = getServiceBySlug(item.serviceSlug);
    if (!service) return;
    add({
      slug: service.slug,
      title: service.title,
      division: service.division,
      addedAt: new Date().toISOString(),
      reason: item.reason,
      fromRoadmap: true,
    });
  };

  const categoryOrder: RoadmapCategory[] = [
    'business',
    'authority',
    'registration',
    'tax',
    'insurance',
    'compliance',
    'operations',
    'factoring',
    'brokerage',
  ];

  return (
    <>
      <div className="aio-page-hero aio-page-hero--dark">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Preliminary Roadmap</p>
          <h1 className="aio-page-hero__title">Your All In One Roadmap</h1>
          <p className="aio-page-hero__desc">{roadmap.summary}</p>
          <p className="aio-prototype-note" style={{ marginTop: '1rem' }}>
            Based on the information you provided — not a legal compliance determination.
          </p>
        </div>
      </div>

      <div className="aio-page-content">
        <div className="aio-container">
          <RoadmapProgressBars
            complianceProgress={roadmap.complianceProgress}
            businessServicesProgress={roadmap.businessServicesProgress}
          />

          {categoryOrder.map((cat) =>
            grouped[cat] ? <RoadmapCategoryGroup key={cat} category={cat} items={grouped[cat]!} /> : null,
          )}

          {roadmap.crossSellRecommendations.length > 0 && (
            <section className="aio-cross-sell">
              <h2 className="aio-display-md" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                You May Also Consider
              </h2>
              {roadmap.crossSellRecommendations.map((rec) => (
                <div key={rec.id} className="aio-cross-sell__item">
                  <p>{rec.message}</p>
                  <Link to={aioPaths.serviceSlug(rec.serviceSlug)}>{rec.title} →</Link>
                </div>
              ))}
            </section>
          )}

          <div className="aio-roadmap-actions">
            <h2 className="aio-display-md" style={{ fontSize: '1.25rem' }}>
              Recommended Services
            </h2>
            <div className="aio-intent-grid">
              {roadmap.items
                .filter((i) => i.serviceSlug && i.status !== 'completed' && i.serviceAvailable)
                .slice(0, 6)
                .map((item) => {
                  const service = getServiceBySlug(item.serviceSlug!);
                  if (!service) return null;
                  return (
                    <div key={item.id} className="aio-card">
                      <h3 className="aio-intent-card__title">{service.title}</h3>
                      <p className="aio-intent-card__desc">{item.reason}</p>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => handleAddService(item)}>
                          Add to My Plan
                        </button>
                        <Link to={aioPaths.serviceSlug(service.slug)} className="aio-intent-card__cta">
                          Learn More →
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="aio-intake__actions" style={{ marginTop: '2.5rem' }}>
            <Link to={aioPaths.servicePlan}>
              <AIOButton variant="gold">Review My Service Plan</AIOButton>
            </Link>
            <Link to={aioPaths.requestSubmit}>
              <AIOButton variant="outline-dark">Request Help From All In One</AIOButton>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
