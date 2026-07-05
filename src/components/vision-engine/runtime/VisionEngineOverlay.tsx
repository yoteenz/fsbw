import { useState } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);
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
    <div
      className={`vision-engine-overlay${collapsed ? ' is-collapsed' : ''}`}
      role="dialog"
      aria-label="VISION ENGINE PRESENTATION"
    >
      <div className="vision-engine-overlay__panel">
        <button
          type="button"
          className="vision-engine-overlay__toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
        >
          {collapsed ? 'RESUME CONTROLS' : 'HIDE CONTROLS'}
        </button>

        {collapsed ? (
          <p className="vision-engine-overlay__step-collapsed">
            {stopIndex + 1} / {stopCount || '—'} · {currentStop.title}
          </p>
        ) : (
          <>
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
                PREVIOUS
              </button>
              {autoTourRunning ? (
                <button type="button" onClick={pauseAutoTour}>
                  PAUSE
                </button>
              ) : (
                <button type="button" onClick={resumeAutoTour}>
                  RESUME
                </button>
              )}
              <button type="button" onClick={nextStop} disabled={stopIndex >= stopCount - 1}>
                NEXT
              </button>
            </div>

            <div className="vision-engine-overlay__secondary">
              <button type="button" onClick={restartTour}>
                RESTART
              </button>
              <button type="button" onClick={exitVision}>
                EXIT
              </button>
            </div>

            <div className="vision-engine-overlay__toggles">
              <button type="button" className={luxuryAudioEnabled ? 'is-on' : ''} onClick={onToggleLuxuryAudio}>
                AMBIENT AUDIO
              </button>
              <button type="button" className={presenterMode ? 'is-on' : ''} onClick={onTogglePresenterMode}>
                PRESENTER NOTES
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
