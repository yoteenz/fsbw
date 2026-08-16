import { Link } from 'react-router-dom';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIORoadmapProgress } from '../components/AIORoadmapProgress';
import { AIOCard } from '../components/AIOCard';
import { AIOButton } from '../components/AIOButton';
import { mockRoadmapItems, mockRoadmapProgress } from '../data/mockRoadmap';
import { usePageMeta } from '../hooks/usePageMeta';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';
import { ROAD_READY_PRODUCT_NAME } from '../road-ready/roadReadyConfig';

export function RoadReadyPublicPage() {
  usePageMeta({
    title: `${ROAD_READY_PRODUCT_NAME}™ — ${aioAppConfig.company.legalName}`,
    description:
      'Answer a few questions and Road Ready builds your personalized trucking startup and compliance roadmap.',
  });

  return (
    <>
      <div className="aio-page-hero aio-page-hero--dark">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Road Ready™</p>
          <h1 className="aio-page-hero__title">See what stands between you and the road</h1>
          <p className="aio-page-hero__desc">
            {ROAD_READY_PRODUCT_NAME} helps you understand formation, authority, insurance, registration, and compliance
            steps — then routes you to the right All In One services.
          </p>
          <Link to={aioPaths.getStarted}>
            <AIOButton variant="gold">Get My Roadmap →</AIOButton>
          </Link>
        </div>
      </div>
      <div className="aio-page-content aio-page-content--dark">
        <div className="aio-container">
          <div className="aio-road-ready-public">
            <div>
              <AIOSectionHeader
                light
                title="Your personalized roadmap"
                subtitle="Complete the intake questionnaire to generate a checklist tailored to your business stage, equipment, and operating plans."
              />
              <ul className="aio-road-ready-public__bullets">
                <li>Understand required filings before you roll</li>
                <li>See optional services for growth and cash flow</li>
                <li>Add recommended services to your plan and submit requests</li>
              </ul>
              <Link to={aioPaths.getStarted}>
                <AIOButton variant="gold">Start Road Ready Intake</AIOButton>
              </Link>
            </div>
            <AIOCard dark>
              <p className="aio-road-ready-public__sample-label">Sample roadmap preview</p>
              <AIORoadmapProgress progress={mockRoadmapProgress} items={mockRoadmapItems.slice(0, 7)} />
            </AIOCard>
          </div>
        </div>
      </div>
    </>
  );
}
