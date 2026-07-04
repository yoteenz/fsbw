import { VisionEngineOpeningCinematic } from './VisionEngineOpeningCinematic';
import { VisionEngineEndingCinematic } from './VisionEngineEndingCinematic';
import { VisionEngineOverlay } from './VisionEngineOverlay';
import { VisionEnginePresenterPanel } from './VisionEnginePresenterPanel';
import { VisionEngineTransitionLayer } from './VisionEngineTransitionLayer';
import { VisionEngineHotspots } from './VisionEngineHotspots';
import { VisionEngineLuxuryAudio } from './VisionEngineLuxuryAudio';
import type { VisionPhase, VisionStop, VisionTransitionKind } from '../../../studio-os-core/vision-engine/types';

export type VisionEngineChromeProps = {
  showOpening: boolean;
  showEnding: boolean;
  onOpeningComplete: () => void;
  onEndingComplete: () => void;
  transitionKind: VisionTransitionKind;
  phase: VisionPhase;
  currentStop: VisionStop;
  presenterMode: boolean;
  luxuryAudioEnabled: boolean;
  autoTourRunning: boolean;
  recordMode: boolean;
  onTogglePresenterMode: () => void;
  onToggleLuxuryAudio: () => void;
  logoText: string;
  tagline: string;
  endingTagline: string;
};

export function VisionEngineChrome({
  showOpening,
  showEnding,
  onOpeningComplete,
  onEndingComplete,
  transitionKind,
  phase,
  currentStop,
  presenterMode,
  luxuryAudioEnabled,
  autoTourRunning,
  recordMode,
  onTogglePresenterMode,
  onToggleLuxuryAudio,
  logoText,
  tagline,
  endingTagline,
}: VisionEngineChromeProps) {
  const showTransition = phase === 'transition';
  const showOverlay = phase !== 'idle' && phase !== 'complete' && !showOpening && !showEnding;
  const showHotspots =
    showOverlay && (phase === 'running' || phase === 'mobile' || phase === 'paused') && currentStop.hotspots?.length;

  return (
    <>
      <VisionEngineLuxuryAudio enabled={luxuryAudioEnabled} recordMode={recordMode} />
      {showOpening ? (
        <VisionEngineOpeningCinematic onComplete={onOpeningComplete} logoText={logoText} tagline={tagline} />
      ) : null}
      {showTransition ? <VisionEngineTransitionLayer kind={transitionKind} /> : null}
      {showHotspots ? <VisionEngineHotspots hotspots={currentStop.hotspots!} /> : null}
      {showOverlay ? (
        <>
          <VisionEngineOverlay
            autoTourRunning={autoTourRunning}
            luxuryAudioEnabled={luxuryAudioEnabled}
            presenterMode={presenterMode}
            onToggleLuxuryAudio={onToggleLuxuryAudio}
            onTogglePresenterMode={onTogglePresenterMode}
          />
          {presenterMode ? <VisionEnginePresenterPanel stop={currentStop} /> : null}
        </>
      ) : null}
      {showEnding ? (
        <VisionEngineEndingCinematic onComplete={onEndingComplete} logoText={logoText} endingTagline={endingTagline} />
      ) : null}
      {phase !== 'idle' && autoTourRunning ? <div className="vision-engine-nav-shield" aria-hidden /> : null}
    </>
  );
}
