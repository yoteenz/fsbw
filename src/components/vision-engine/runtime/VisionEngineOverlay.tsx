import { useRef, useState, type ReactNode } from 'react';
import { useVisionEngine } from './VisionEngineContext';
import { useVisionEngineOverlayDrag } from './useVisionEngineOverlayDrag';

function MinimizeIcon(): ReactNode {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 8h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ExpandIcon(): ReactNode {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 3.5v5M3.5 6h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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
  const overlayRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { positionStyle, isDragging, isPositioned, onDragHandlePointerDown } =
    useVisionEngineOverlayDrag(overlayRef);
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
      ref={overlayRef}
      className={`vision-engine-overlay${collapsed ? ' is-collapsed' : ''}${isPositioned ? ' is-positioned' : ''}${isDragging ? ' is-dragging' : ''}`}
      style={positionStyle}
      role="dialog"
      aria-label="VISION ENGINE PRESENTATION"
    >
      <div className="vision-engine-overlay__panel">
        <button
          type="button"
          className="vision-engine-overlay__minimize"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'EXPAND CONTROLS' : 'MINIMIZE CONTROLS'}
          title={collapsed ? 'EXPAND CONTROLS' : 'MINIMIZE CONTROLS'}
        >
          {collapsed ? <ExpandIcon /> : <MinimizeIcon />}
        </button>

        <div className="vision-engine-overlay__header">
          <button
            type="button"
            className="vision-engine-overlay__drag-handle"
            onPointerDown={onDragHandlePointerDown}
            aria-label="DRAG CONTROLS PANEL"
            title="DRAG TO REPOSITION"
          />
        </div>

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
