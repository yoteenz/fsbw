import { useVisionEngine } from './VisionEngineContext';

type Props = {
  autoTourRunning: boolean;
  luxuryAudioEnabled: boolean;
  presenterMode: boolean;
  onToggleLuxuryAudio: () => void;
  onTogglePresenterMode: () => void;
};

export function VisionEngineOverlay({
  autoTourRunning,
  luxuryAudioEnabled,
  presenterMode,
  onToggleLuxuryAudio,
  onTogglePresenterMode,
}: Props) {
  const {
    currentStop,
    progress,
    stopIndex,
    modeLabel,
    stopCount,
    pauseAutoTour,
    resumeAutoTour,
    nextStop,
    prevStop,
    restartTour,
    exitVision,
  } = useVisionEngine();

  return (
    <div className="vision-engine-overlay" role="dialog" aria-label="Vision Engine presentation">
      <div className="vision-engine-overlay__panel">
        <p className="vision-engine-overlay__section">{currentStop.sectionLabel}</p>
        <p className="vision-engine-overlay__title">{currentStop.title}</p>
        {currentStop.subtitle ? <p className="vision-engine-overlay__subtitle">{currentStop.subtitle}</p> : null}
        <p className="vision-engine-overlay__mode">{modeLabel}</p>

        <div className="vision-engine-overlay__progress">
          <div className="vision-engine-overlay__progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="vision-engine-overlay__step">
          {stopIndex + 1} / {stopCount || '—'}
        </p>

        <div className="vision-engine-overlay__controls">
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
          <button type="button" onClick={nextStop} disabled={stopIndex >= stopCount - 1}>
            Next
          </button>
        </div>

        <div className="vision-engine-overlay__secondary">
          <button type="button" onClick={restartTour}>
            Restart
          </button>
          <button type="button" onClick={exitVision}>
            Exit
          </button>
        </div>

        <div className="vision-engine-overlay__toggles">
          <button type="button" className={luxuryAudioEnabled ? 'is-on' : ''} onClick={onToggleLuxuryAudio}>
            Ambient Audio
          </button>
          <button type="button" className={presenterMode ? 'is-on' : ''} onClick={onTogglePresenterMode}>
            Presenter Notes
          </button>
        </div>
      </div>
    </div>
  );
}
