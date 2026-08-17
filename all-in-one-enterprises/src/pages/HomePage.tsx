import { useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { AioHomepageHero } from '../components/homepage/AioHomepageHero';
import { AioPathwayRouter } from '../components/homepage/AioPathwayRouter';
import { AioRoadReadyJourney } from '../components/homepage/AioRoadReadyJourney';
import { AioConnectedValue } from '../components/homepage/AioConnectedValue';
import { AioHomepageFinalCTA } from '../components/homepage/AioHomepageFinalCTA';
import { aioAppConfig } from '../config/appConfig';

export function HomePage() {
  usePageMeta({
    title: `${aioAppConfig.company.legalName} — ${aioAppConfig.company.tagline}`,
    description: aioAppConfig.company.brandDescription,
  });

  useEffect(() => {
    const root = document.querySelector('.aio-app');
    root?.classList.add('aio-homepage-active');
    return () => root?.classList.remove('aio-homepage-active');
  }, []);

  return (
    <div className="aio-homepage">
      <AioHomepageHero />
      <AioPathwayRouter />
      <AioRoadReadyJourney />
      <AioConnectedValue />
      <AioHomepageFinalCTA />
    </div>
  );
}
