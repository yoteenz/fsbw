import type { ForecastBroadcastPhase } from '../../../../content/slay-forecast';
import { isLoungeTvDebugUiEnabled } from '../../loungeTvDebugUi';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';

type SlayForecastBroadcastCueDebugProps = {
  currentTime: number;
  phase: ForecastBroadcastPhase;
  cues: {
    opening: number;
    hold: number;
    clear: number;
    closing: number;
    end: number;
  };
};

export function SlayForecastBroadcastCueDebug({
  currentTime,
  phase,
  cues,
}: SlayForecastBroadcastCueDebugProps) {
  if (!isLoungeTvDebugUiEnabled()) return null;

  return (
    <div
      className="lounge-tv-slay-forecast-broadcast__debug"
      aria-hidden
      style={{
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: LOUNGE_TV_TYPE.l4,
        color: LOUNGE_TV_TEXT_GRAY,
        letterSpacing: '0.04em',
      }}
    >
      <span>t={currentTime.toFixed(2)}s</span>
      <span> · phase={phase.toUpperCase()}</span>
      <span>
        {' '}
        · OPEN≤{cues.opening}s · HOLD≤{cues.clear}s · CLOSE≥{cues.closing}s · END {cues.end}s
      </span>
    </div>
  );
}
