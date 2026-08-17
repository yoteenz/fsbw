import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AioPageShell } from '../AioPageShell';
import { AioCinematicHero } from '../AioCinematicHero';
import { AioSectionHeading } from '../AioSectionHeading';
import { AioFeatureGrid, type FeatureItem } from '../AioFeatureGrid';
import { AioProcessRail, type ProcessStep } from '../AioProcessRail';
import { AioActionPanel } from '../AioActionPanel';
import { AioRelatedServices, type RelatedServiceItem } from '../AioRelatedServices';
import { JourneyBackNav } from '../../journey/JourneyBackNav';

type Breadcrumb = { label: string; href?: string };

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  heroActions?: ReactNode;
  showJourneyBack?: boolean;
  handles: FeatureItem[];
  processSteps: ProcessStep[];
  requirements?: string[];
  timelineLabel?: string;
  timelineValue?: string;
  sidebar: ReactNode;
  relatedServices: RelatedServiceItem[];
  disclaimer?: string;
  compactHero?: boolean;
  backgroundImage?: string;
  afterProcess?: ReactNode;
};

export function ServiceDetailTemplate({
  eyebrow,
  title,
  description,
  breadcrumbs,
  heroActions,
  showJourneyBack,
  handles,
  processSteps,
  requirements = [],
  timelineLabel,
  timelineValue,
  sidebar,
  relatedServices,
  disclaimer,
  compactHero = true,
  backgroundImage,
  afterProcess,
}: Props) {
  return (
    <AioPageShell>
      {showJourneyBack ? (
        <div className="aio-container aio-ps-journey-back">
          <JourneyBackNav />
        </div>
      ) : null}
      <AioCinematicHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={heroActions}
        compact={compactHero}
        backgroundImage={backgroundImage}
      />
      <div className="aio-ps-body">
        <div className="aio-container aio-ps-detail-grid">
          <div className="aio-ps-detail-main">
            <section className="aio-ps-block">
              <AioSectionHeading eyebrow="What AIO Handles" title="We coordinate the work" light />
              <AioFeatureGrid items={handles} />
            </section>

            <section className="aio-ps-block">
              <AioSectionHeading eyebrow="The Process" title="How it works" light />
              <AioProcessRail steps={processSteps} />
              {afterProcess}
            </section>

            {(requirements.length > 0 || timelineValue) && (
              <section className="aio-ps-block aio-ps-requirements">
                {requirements.length > 0 ? (
                  <div className="aio-ps-requirements__col">
                    <AioSectionHeading eyebrow="Preparation" title="What you'll need" light />
                    <ul className="aio-ps-requirements__list">
                      {requirements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {timelineValue ? (
                  <div className="aio-ps-requirements__timeline">
                    <span className="aio-ps-requirements__timeline-label">{timelineLabel ?? 'Typical timeline'}</span>
                    <strong className="aio-ps-requirements__timeline-value">{timelineValue}</strong>
                    <p className="aio-ps-requirements__timeline-note">
                      Timelines vary by agency workload and application completeness.
                    </p>
                  </div>
                ) : null}
              </section>
            )}

            {relatedServices.length > 0 ? (
              <section className="aio-ps-block">
                <AioSectionHeading eyebrow="Connected services" title="Related services" light />
                <AioRelatedServices services={relatedServices} />
              </section>
            ) : null}

            {disclaimer ? <p className="aio-ps-disclaimer">{disclaimer}</p> : null}
          </div>

          <AioActionPanel title="Get Started">{sidebar}</AioActionPanel>
        </div>
      </div>
    </AioPageShell>
  );
}

/** Secondary text action used in hero areas */
export function AioTextAction({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="aio-ps-text-action">
      {children}
    </Link>
  );
}
