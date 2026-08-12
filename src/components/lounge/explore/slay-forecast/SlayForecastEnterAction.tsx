import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';

type SlayForecastEnterActionProps = {
  focusId: string;
  onSelect: () => void;
  label?: string;
};

/** Navigation CTA — enters Forecast Hub (not video playback). */
export function SlayForecastEnterAction({
  focusId,
  onSelect,
  label = 'ENTER THE FORECAST →',
}: SlayForecastEnterActionProps) {
  return (
    <button
      type="button"
      className="lounge-tv-slay-forecast-enter"
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={focusId}
      aria-label={label.replace(/\s*→\s*$/, '')}
      onClick={onSelect}
      onFocusCapture={loungeTvFocusGlowIn}
      onBlurCapture={loungeTvFocusGlowOut}
      style={{
        fontFamily: LOUNGE_TV_FONT_MEDIUM,
        fontSize: LOUNGE_TV_TYPE.l3,
        color: LOUNGE_TV_TEXT_WHITE,
        letterSpacing: '0.06em',
      }}
    >
      {label}
    </button>
  );
}
