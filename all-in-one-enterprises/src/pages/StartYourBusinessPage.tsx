import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import {
  AioPageShell,
  AioCinematicHero,
  AioJourneySection,
  AioRoadmapFooterCta,
} from '../components/page-system';
import { AioDesktopContextShell } from '../components/context-rail';
import { buildStartBusinessRail } from '../context-rail/configs';

export function StartYourBusinessPage() {
  const { t } = useTranslation('contextRail');
  const [selectedStepId, setSelectedStepId] = useState<JourneyStepId | undefined>();
  const view = useStartBusinessJourney(selectedStepId);
  const selectedStep = view.steps.find((s) => s.def.id === view.selectedStepId) ?? view.steps[0];

  usePageMeta({
    title: `Start Your Business — ${aioAppConfig.company.legalName}`,
    description:
      'Interactive startup journey — build, authorize, protect, register, activate, and roll with real progress tracking.',
  });

  return (
    <AioPageShell>
      <AioDesktopContextShell config={buildStartBusinessRail(t, view)}>
      <AioCinematicHero
        eyebrow="Start My Business"
        title={
          <>
            From idea to
            <br />
            running your
            <br />
            trucking business.
          </>
        }
        description="Click any milestone to start or continue. Progress reflects your Road Ready requirements and service statuses when you're signed in."
        breadcrumbs={[{ label: 'Start Your Business' }]}
        actions={
          <>
            <AIOButton
              to={view.nextAction?.ctaRoute ?? `${aioPaths.startYourBusiness}/build`}
              variant="gold"
              showArrow
            >
              {view.progress.completedCount > 0 ? 'Continue My Journey' : 'Start My Business'}
            </AIOButton>
            <AIOButton to={aioPaths.roadReadyPublic} variant="outline-gold" showArrow>
              Get My Roadmap
            </AIOButton>
          </>
        }
        compact
      />

      <div className="aio-ps-body">
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
              <AioJourneySection steps={view.steps} />
              <ServiceJourneyStepper
                steps={view.steps}
                selectedStepId={view.selectedStepId}
                onSelect={(id) => setSelectedStepId(id)}
              />
              <ServiceJourneyStepDetail step={selectedStep} />
            </div>
          </section>

          <section className="aio-ps-block">
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

      <AioRoadmapFooterCta
        title="Not sure where to start?"
        description="Road Ready™ assesses your business and recommends the right services in order."
      />
      </AioDesktopContextShell>
    </AioPageShell>
  );
}
