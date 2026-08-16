import { Link } from 'react-router-dom';
import { mockBusinessSteps } from '../data/mockRoadmap';
import { mockOperateGrowSteps } from '../data/mockFactoring';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOButton } from '../components/AIOButton';
import { AIOStartupMilestones } from '../components/AIOStartupMilestones';
import { usePageMeta } from '../hooks/usePageMeta';
import { aioAppConfig } from '../config/appConfig';
import { aioGetStarted, aioPaths } from '../utils/paths';

export function StartYourBusinessPage() {
  usePageMeta({
    title: `Start Your Business — ${aioAppConfig.company.legalName}`,
    description:
      'From formation through your first load — business formation, authority, insurance, registration, compliance, and getting road-ready with All In One.',
  });

  return (
    <>
      <div className="aio-page-hero aio-page-hero--elevated">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Start Your Business</p>
          <h1 className="aio-page-hero__title">From formation to freight</h1>
          <p className="aio-page-hero__desc">
            The full startup journey — build, authorize, protect, register, activate, and roll. Use Road Ready™ for a
            personalized roadmap, or begin with the services you need today.
          </p>
          <div className="aio-page-hero__actions aio-cta-row">
            <Link to={aioGetStarted('start-business')} className="aio-cta-row__link">
              <AIOButton variant="gold" className="aio-btn--block">
                Start My Business
              </AIOButton>
            </Link>
            <Link to={aioPaths.roadReadyPublic} className="aio-cta-row__link">
              <AIOButton variant="outline-gold" className="aio-btn--block" showArrow>
                Get My Roadmap
              </AIOButton>
            </Link>
          </div>
        </div>
      </div>
      <AIOStartupMilestones />
      <div className="aio-page-content">
        <div className="aio-container">
          <section className="aio-page-section">
            <AIOSectionHeader
              align="center"
              eyebrow="Start Your Business"
              title="Your milestone path"
              subtitle="How All In One may guide new trucking entrepreneurs through each stage."
            />
            <div className="aio-steps" style={{ marginTop: '2rem' }}>
              {mockBusinessSteps.map((step) => (
                <article key={step.step} className="aio-step">
                  <div className="aio-step__num">{step.step}</div>
                  <h3 className="aio-step__title">{step.title}</h3>
                  <p className="aio-step__sub">{step.subtitle}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="aio-page-section">
            <AIOSectionHeader
              align="center"
              eyebrow="Related services"
              title="Explore startup & compliance services"
              subtitle="Formation, authority, insurance, permits, and registration — each with dedicated service pages."
            />
            <div className="aio-start-links">
              <Link to={aioPaths.businessFormation} className="aio-start-links__item">
                Business Formation
              </Link>
              <Link to={aioPaths.serviceSlug('operating-authority-assistance')} className="aio-start-links__item">
                Operating Authority
              </Link>
              <Link to={aioPaths.insurance} className="aio-start-links__item">
                Trucking Insurance
              </Link>
              <Link to={aioPaths.permitting} className="aio-start-links__item">
                Permits & Compliance
              </Link>
            </div>
          </section>

          <section className="aio-page-section">
            <AIOSectionHeader
              align="center"
              eyebrow="Operate & Grow"
              title="After you're rolling"
              subtitle="Optional operational services — dispatch, factoring, and brokerage support cash flow and growth."
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
            <div className="aio-start-links" style={{ marginTop: '2rem' }}>
              <Link to={aioPaths.dispatching} className="aio-start-links__item">
                Dispatching
              </Link>
              <Link to={aioPaths.factoring} className="aio-start-links__item">
                Factoring
              </Link>
              <Link to={aioPaths.brokerage} className="aio-start-links__item">
                Brokerage
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
