import { JourneyBackNav } from '../../components/journey/JourneyBackNav';
import { ServiceJourneyStepDetail } from '../../components/journey/ServiceJourneyStepDetail';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useStartBusinessJourney } from '../../journeys/useStartBusinessJourney';

export function StartBusinessActivatePage() {
  usePageMeta({ title: 'Activate — Compliance & Filings', description: 'Compliance activation sub-journey.' });
  const view = useStartBusinessJourney('activate');
  const step = view.steps.find((s) => s.def.id === 'activate')!;

  return (
    <div className="aio-page-content">
      <div className="aio-container aio-container--narrow">
        <JourneyBackNav />
        <header className="aio-page-section">
          <p className="aio-label aio-gold-text">Step 05 — Activate</p>
          <h1 className="aio-display-md">Complete compliance & filings</h1>
          <p className="aio-body">Remaining filings and operational requirements before you roll.</p>
        </header>
        <ServiceJourneyStepDetail step={step} />
      </div>
    </div>
  );
}
