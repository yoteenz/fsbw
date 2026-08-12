import {
  SLAY_FORECAST_PLAY_ICON_SRC,
  SLAY_FORECAST_REPLAY_ICON_SRC,
} from '../../../../constants/slayForecastBroadcast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';

type SlayForecastAcrylicControlProps = {
  mode: 'play' | 'replay';
  focusId: string;
  onPress: () => void;
  ariaLabel: string;
};

/** Shipped 3D acrylic Play / Replay PNG — full ring + glyph, above blurred broadcast. */
export function SlayForecastAcrylicControl({
  mode,
  focusId,
  onPress,
  ariaLabel,
}: SlayForecastAcrylicControlProps) {
  return (
    <button
      type="button"
      className={`lounge-tv-slay-forecast-acrylic-control lounge-tv-slay-forecast-acrylic-control--${mode}`}
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={focusId}
      onClick={onPress}
      onFocusCapture={loungeTvFocusGlowIn}
      onBlurCapture={loungeTvFocusGlowOut}
      aria-label={ariaLabel}
    >
      <img
        className="lounge-tv-slay-forecast-acrylic-control__asset"
        src={mode === 'play' ? SLAY_FORECAST_PLAY_ICON_SRC : SLAY_FORECAST_REPLAY_ICON_SRC}
        alt=""
        draggable={false}
      />
    </button>
  );
}
