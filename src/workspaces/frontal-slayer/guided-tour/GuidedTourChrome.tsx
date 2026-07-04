import { GuidedTourOpeningCinematic } from './GuidedTourOpeningCinematic';
import { GuidedTourEndingCinematic } from './GuidedTourEndingCinematic';
import { GuidedTourOverlay } from './GuidedTourOverlay';
import { GuidedTourPresenterPanel } from './GuidedTourPresenterPanel';
import { GuidedTourTransitionLayer } from './GuidedTourTransitionLayer';
import { GuidedTourHotspots } from './GuidedTourHotspots';
import { GuidedTourLuxuryAudio } from './GuidedTourLuxuryAudio';
import type { GuidedTourPhase, GuidedTourStop, GuidedTourTransitionKind } from './types';

export type GuidedTourChromeProps = {
  showOpening: boolean;
  showEnding: boolean;
  onOpeningComplete: () => void;
  onEndingComplete: () => void;
  transitionKind: GuidedTourTransitionKind;
  phase: GuidedTourPhase;
  currentStop: GuidedTourStop;
  presentationActive: boolean;
  creativePartnerMode: boolean;
  luxuryAudioEnabled: boolean;
  autoTourRunning: boolean;
  recordMode: boolean;
  onToggleCreativePartner: () => void;
  onToggleLuxuryAudio: () => void;
  onStartRecord: () => void;
};

export function GuidedTourChrome({
  showOpening,
  showEnding,
  onOpeningComplete,
  onEndingComplete,
  transitionKind,
  phase,
  currentStop,
  presentationActive,
  creativePartnerMode,
  luxuryAudioEnabled,
  autoTourRunning,
  recordMode,
  onToggleCreativePartner,
  onToggleLuxuryAudio,
}: GuidedTourChromeProps) {
  const showTransition = phase === 'transition';
  const showOverlay = phase !== 'idle' && phase !== 'complete' && !showOpening && !showEnding;
  const showHotspots =
    showOverlay && (phase === 'running' || phase === 'mobile' || phase === 'paused') && currentStop.hotspots?.length;

  return (
    <>
      <GuidedTourLuxuryAudio enabled={luxuryAudioEnabled} recordMode={recordMode} />
      {showOpening ? <GuidedTourOpeningCinematic onComplete={onOpeningComplete} /> : null}
      {showTransition ? <GuidedTourTransitionLayer kind={transitionKind} /> : null}
      {showHotspots ? <GuidedTourHotspots hotspots={currentStop.hotspots!} /> : null}
      {showOverlay ? (
        <>
          <GuidedTourOverlay
            autoTourRunning={autoTourRunning}
            luxuryAudioEnabled={luxuryAudioEnabled}
            creativePartnerMode={creativePartnerMode}
            onToggleLuxuryAudio={onToggleLuxuryAudio}
            onToggleCreativePartner={onToggleCreativePartner}
          />
          {creativePartnerMode ? <GuidedTourPresenterPanel stop={currentStop} /> : null}
        </>
      ) : null}
      {showEnding ? <GuidedTourEndingCinematic onComplete={onEndingComplete} /> : null}
      {presentationActive && phase !== 'idle' && autoTourRunning ? (
        <div className="guided-tour-nav-shield" aria-hidden />
      ) : null}
    </>
  );
}
