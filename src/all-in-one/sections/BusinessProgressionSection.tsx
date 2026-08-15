import { mockBusinessSteps } from '../data/mockRoadmap';
import { mockOperateGrowSteps } from '../data/mockFactoring';
import { AIOSectionHeader } from '../components/AIOSectionHeader';

export function BusinessProgressionSection() {
  return (
    <section className="aio-section aio-section--light" aria-labelledby="aio-steps-heading">
      <div className="aio-container">
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <AIOSectionHeader
            align="center"
            eyebrow="Start Your Business"
            title="From formation to freight"
            subtitle="How All In One may guide new trucking entrepreneurs through each milestone."
          />
        </div>
        <div className="aio-steps" id="aio-steps-heading">
          {mockBusinessSteps.map((step) => (
            <article key={step.step} className="aio-step">
              <div className="aio-step__num">{step.step}</div>
              <h3 className="aio-step__title">{step.title}</h3>
              <p className="aio-step__sub">{step.subtitle}</p>
            </article>
          ))}
        </div>

        <div style={{ marginTop: '3.5rem' }}>
          <AIOSectionHeader
            align="center"
            eyebrow="Operate & Grow"
            title="After you're rolling"
            subtitle="Optional operational services — factoring supports cash flow but is not a compliance requirement."
          />
          <div className="aio-steps aio-steps--grow" style={{ marginTop: '1.5rem' }}>
            {mockOperateGrowSteps.map((step) => (
              <article key={step.step} className="aio-step">
                <div className="aio-step__num">{step.step}</div>
                <h3 className="aio-step__title">{step.title}</h3>
                <p className="aio-step__sub">{step.subtitle}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
