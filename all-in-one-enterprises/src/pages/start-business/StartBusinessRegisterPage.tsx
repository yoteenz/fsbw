import { JourneyBackNav } from '../../components/journey/JourneyBackNav';
import { ServiceJourneyStepDetail } from '../../components/journey/ServiceJourneyStepDetail';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useStartBusinessJourney } from '../../journeys/useStartBusinessJourney';

export function StartBusinessRegisterPage() {
  usePageMeta({ title: 'Register — Tags, IFTA, IRP & Permits', description: 'Registration sub-journey for your startup.' });
  const view = useStartBusinessJourney('register');
  const step = view.steps.find((s) => s.def.id === 'register')!;

  return (
    <div className="aio-page-content">
      <div className="aio-container aio-container--narrow">
        <JourneyBackNav label="Back to Startup Journey" />
        <header className="aio-page-section">
          <p className="aio-label aio-gold-text">Step 04 — Register</p>
          <h1 className="aio-display-md">Register your operation</h1>
          <p className="aio-body">Applicable registration steps based on your Road Ready profile and operating scope.</p>
        </header>
        <ServiceJourneyStepDetail step={step} />
      </div>
    </div>
  );
}
