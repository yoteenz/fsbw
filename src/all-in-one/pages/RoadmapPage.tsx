import { mockRoadmapItems, mockRoadmapProgress, mockBusinessSteps } from '../data/mockRoadmap';
import { mockOperateGrowSteps } from '../data/mockFactoring';
import { AIORoadmapProgress } from '../components/AIORoadmapProgress';

export function RoadmapPage() {
  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Roadmap</p>
          <h1 className="aio-page-hero__title">The All In One Roadmap</h1>
          <p className="aio-page-hero__desc">
            A visual prototype of the future onboarding and compliance journey. All progress and checklist data is
            mocked for Sprint 01.
          </p>
        </div>
      </div>
      <div className="aio-page-content">
        <div className="aio-container">
          <div className="aio-card aio-card--dark" style={{ marginBottom: '3rem', padding: '1.5rem' }}>
            <AIORoadmapProgress progress={mockRoadmapProgress} items={mockRoadmapItems} />
          </div>

          <h2 className="aio-display-md" style={{ marginBottom: '1.5rem' }}>
            Business progression
          </h2>
          <div className="aio-steps">
            {mockBusinessSteps.map((step) => (
              <article key={step.step} className="aio-step">
                <div className="aio-step__num">{step.step}</div>
                <h3 className="aio-step__title">{step.title}</h3>
                <p className="aio-step__sub">{step.subtitle}</p>
              </article>
            ))}
          </div>

          <h2 className="aio-display-md" style={{ margin: '2.5rem 0 1rem' }}>
            Operate &amp; Grow
          </h2>
          <p style={{ maxWidth: '40rem', color: 'var(--aio-gray-600)', marginBottom: '1.5rem', lineHeight: 1.65 }}>
            Factoring is an optional operational service — it does not affect Road Ready compliance completion.
          </p>
          <div className="aio-steps aio-steps--grow">
            {mockOperateGrowSteps.map((step) => (
              <article key={step.step} className="aio-step">
                <div className="aio-step__num">{step.step}</div>
                <h3 className="aio-step__title">{step.title}</h3>
                <p className="aio-step__sub">{step.subtitle}</p>
              </article>
            ))}
          </div>

          <p className="aio-prototype-note">
            The Roadmap system will eventually connect to a compliance rules engine and customer-specific progress
            tracking. That engine is not built in Sprint 01.
          </p>
        </div>
      </div>
    </>
  );
}
