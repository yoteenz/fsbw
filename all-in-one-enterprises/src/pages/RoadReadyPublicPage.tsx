import { AIOButton } from '../components/AIOButton';
import { usePageMeta } from '../hooks/usePageMeta';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';
import { ROAD_READY_PRODUCT_NAME } from '../road-ready/roadReadyConfig';
import {
  AioPageShell,
  AioCinematicHero,
  AioSectionHeading,
  AioProgressRing,
  AioRoadmapFooterCta,
} from '../components/page-system';

export function RoadReadyPublicPage() {
  usePageMeta({
    title: `${ROAD_READY_PRODUCT_NAME}™ — ${aioAppConfig.company.legalName}`,
    description:
      'Answer a few questions and Road Ready builds your personalized trucking startup and compliance roadmap.',
  });

  return (
    <AioPageShell>
      <AioCinematicHero
        eyebrow="Road Ready™"
        title={
          <>
            Know where
            <br />
            you stand.
            <br />
            Know what&apos;s next.
          </>
        }
        description={`${ROAD_READY_PRODUCT_NAME} helps you understand formation, authority, insurance, registration, and compliance steps — then routes you to the right All In One services.`}
        breadcrumbs={[{ label: 'Road Ready™' }]}
        actions={
          <AIOButton to={aioPaths.getStarted} variant="gold" showArrow>
            Start Assessment
          </AIOButton>
        }
        compact
      />

      <div className="aio-ps-body">
        <div className="aio-container">
          <div className="aio-ps-road-ready-hero-grid">
            <div>
              <AioSectionHeading
                eyebrow="Your roadmap"
                title="A business roadmap dashboard"
                subtitle="Complete the intake questionnaire to generate a checklist tailored to your business stage, equipment, and operating plans."
                light
              />
              <ul className="aio-road-ready-public__bullets">
                <li>Understand required filings before you roll</li>
                <li>See optional services for growth and cash flow</li>
                <li>Add recommended services to your plan and submit requests</li>
              </ul>
              <AIOButton to={aioPaths.getStarted} variant="gold" showArrow>
                Continue Assessment
              </AIOButton>
            </div>
            <div className="aio-road-ready-public__sample" aria-hidden="true">
              <AioProgressRing progress={0} sublabel="Sign in to see your progress" label="Road Ready™" size="lg" />
              <p className="aio-road-ready-public__sample-label">Your personalized roadmap appears after intake</p>
            </div>
          </div>
        </div>
      </div>

      <AioRoadmapFooterCta />
    </AioPageShell>
  );
}
