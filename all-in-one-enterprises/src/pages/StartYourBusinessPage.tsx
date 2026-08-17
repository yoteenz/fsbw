import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOButton } from '../components/AIOButton';
import { ServiceJourneyHeader } from '../components/journey/ServiceJourneyHeader';
import { ServiceJourneyStepper } from '../components/journey/ServiceJourneyStepper';
import { ServiceJourneyStepDetail } from '../components/journey/ServiceJourneyStepDetail';
import { MobileJourneyRoadmap } from '../components/mobile/MobileJourneyRoadmap';
import { usePageMeta } from '../hooks/usePageMeta';
import { useStartBusinessJourney } from '../journeys/useStartBusinessJourney';
import type { JourneyStepId } from '../journeys/journeyTypes';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';

export function StartYourBusinessPage() {
  const [selectedStepId, setSelectedStepId] = useState<JourneyStepId | undefined>();
  const view = useStartBusinessJourney(selectedStepId);
  const selectedStep = view.steps.find((s) => s.def.id === view.selectedStepId) ?? view.steps[0];

  usePageMeta({
    title: `Start Your Business — ${aioAppConfig.company.legalName}`,
    description:
      'Interactive startup journey — build, authorize, protect, register, activate, and roll with real progress tracking.',
  });

  return (
    <>
      <div className="aio-page-hero aio-page-hero--elevated aio-page-hero--compact">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Start Your Business</p>
          <h1 className="aio-page-hero__title">From formation to freight</h1>
          <p className="aio-page-hero__desc">
            Click any milestone to start or continue. Progress reflects your Road Ready requirements and service
            statuses — not demo placeholders.
          </p>
          <div className="aio-page-hero__actions aio-cta-row">
            <AIOButton
              to={view.nextAction?.ctaRoute ?? `${aioPaths.startYourBusiness}/build`}
              variant="gold"
              className="aio-btn--block aio-cta-row__link"
              showArrow
            >
              {view.progress.completedCount > 0 ? 'Continue Where I Left Off' : 'Start My Business'}
            </AIOButton>
            <AIOButton to={aioPaths.roadReadyPublic} variant="outline-gold" className="aio-btn--block aio-cta-row__link" showArrow>
              Get My Roadmap
            </AIOButton>
          </div>
        </div>
      </div>

      <div className="aio-page-content">
        <div className="aio-container">
          <ServiceJourneyHeader view={view} />

          <section className="aio-journey-workspace" aria-label="Interactive startup milestones">
            <div className="aio-mobile-only">
              <MobileJourneyRoadmap
                view={view}
                selectedStepId={view.selectedStepId}
                onSelect={(id) => setSelectedStepId(id)}
              />
            </div>
            <div className="aio-desktop-only aio-journey-workspace__desktop">
              <ServiceJourneyStepper
                steps={view.steps}
                selectedStepId={view.selectedStepId}
                onSelect={(id) => setSelectedStepId(id)}
              />
              <ServiceJourneyStepDetail step={selectedStep} />
            </div>
          </section>

          <section className="aio-page-section">
            <AIOSectionHeader
              align="center"
              eyebrow="Need something specific?"
              title="Additional startup services"
              subtitle="Jump directly to a service not shown in your current milestone path."
            />
            <div className="aio-start-links">
              <Link to={aioPaths.permitting} className="aio-start-links__item">
                Permits & Compliance →
              </Link>
              <Link to={aioPaths.portalRenewals} className="aio-start-links__item">
                Renewals →
              </Link>
              <Link to={aioPaths.portalCalendar} className="aio-start-links__item">
                Compliance Calendar →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
