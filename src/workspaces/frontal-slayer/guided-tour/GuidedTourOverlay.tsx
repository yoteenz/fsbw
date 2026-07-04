import { useGuidedTour } from './GuidedTourContext';
import { GUIDED_TOUR_STOPS } from './tourScript';

type Props = {
  autoTourRunning: boolean;
  luxuryAudioEnabled: boolean;
  creativePartnerMode: boolean;
  onToggleLuxuryAudio: () => void;
  onToggleCreativePartner: () => void;
};

/** Floating acrylic presentation panel — progress & tour controls. */
export function GuidedTourOverlay({
  autoTourRunning,
  luxuryAudioEnabled,
  creativePartnerMode,
  onToggleLuxuryAudio,
  onToggleCreativePartner,
}: Props) {
  const {
    currentStop,
    progress,
    stopIndex,
    pauseAutoTour,
    resumeAutoTour,
    nextStop,
    prevStop,
    restartTour,
    exitGuidedTour,
  } = useGuidedTour();

  return (
    <div className="guided-tour-overlay" role="dialog" aria-label="Guided Tour">
      <div className="guided-tour-overlay__panel">
        <p className="guided-tour-overlay__section">{currentStop.sectionLabel}</p>
        <p className="guided-tour-overlay__title">{currentStop.title}</p>
        {currentStop.subtitle ? <p className="guided-tour-overlay__subtitle">{currentStop.subtitle}</p> : null}

        <div className="guided-tour-overlay__progress">
          <div className="guided-tour-overlay__progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="guided-tour-overlay__step">
          {stopIndex + 1} / {GUIDED_TOUR_STOPS.length}
        </p>

        <div className="guided-tour-overlay__controls">
          <button type="button" onClick={prevStop} disabled={stopIndex <= 0}>
            Previous
          </button>
          {autoTourRunning ? (
            <button type="button" onClick={pauseAutoTour}>
              Pause
            </button>
          ) : (
            <button type="button" onClick={resumeAutoTour}>
              Resume
            </button>
          )}
          <button type="button" onClick={nextStop} disabled={stopIndex >= GUIDED_TOUR_STOPS.length - 1}>
            Next
          </button>
        </div>

        <div className="guided-tour-overlay__secondary">
          <button type="button" onClick={restartTour}>
            Restart Tour
          </button>
          <button type="button" onClick={exitGuidedTour}>
            Exit
          </button>
        </div>

        <div className="guided-tour-overlay__toggles">
          <button
            type="button"
            className={luxuryAudioEnabled ? 'is-on' : ''}
            onClick={onToggleLuxuryAudio}
          >
            🎵 Luxury Audio
          </button>
          <button
            type="button"
            className={creativePartnerMode ? 'is-on' : ''}
            onClick={onToggleCreativePartner}
          >
            🎨 Creative Partner
          </button>
        </div>
      </div>
    </div>
  );
}
