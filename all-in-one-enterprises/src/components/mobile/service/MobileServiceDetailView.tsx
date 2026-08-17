import type { AioService } from '../../../data/services';
import { useMobileServicePage } from '../../../hooks/useMobileServicePage';
import { MobileServiceHero } from './MobileServiceHero';
import { MobileServiceActionPanel } from './MobileServiceActionPanel';
import { MobileServiceBenefits } from './MobileServiceBenefits';
import { MobileServiceJourney } from './MobileServiceJourney';
import { MobileServiceProgress } from './MobileServiceProgress';
import { MobileServiceRequirements } from './MobileServiceRequirements';
import { MobileServiceFAQ } from './MobileServiceFAQ';
import { MobileRelatedServices } from './MobileRelatedServices';
import { MobileServiceNotice } from './MobileServiceNotice';

type Props = {
  service: AioService;
  onAddToPlan: () => void;
  showJourneyBack?: boolean;
};

export function MobileServiceDetailView({ service, onAddToPlan, showJourneyBack }: Props) {
  const view = useMobileServicePage(service, onAddToPlan);

  return (
    <article className="aio-msvc-page">
      <MobileServiceHero
        service={service}
        categoryLabel={view.categoryLabel}
        heroIconSrc={view.heroIconSrc}
        showJourneyBack={showJourneyBack}
      />
      <div className="aio-msvc-page__body">
        <MobileServiceActionPanel ctas={view.ctas} />
        <MobileServiceBenefits benefits={view.benefits} />
        <MobileServiceProgress progress={view.progress} />
        <MobileServiceJourney steps={view.processSteps} />
        <MobileServiceRequirements requirements={view.requirements} documents={view.documents} />
        <MobileServiceFAQ
          items={view.faq}
          heading={
            service.slug === 'operating-authority-assistance'
              ? 'Questions About Authority?'
              : 'Questions About This Service?'
          }
        />
        <MobileRelatedServices related={view.related} />
        <MobileServiceNotice notice={view.notice} disclosure={view.disclosure} />
      </div>
    </article>
  );
}
