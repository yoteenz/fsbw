import type { ForecastSignal } from '../../../../content/slay-forecast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { ForecastStatusBadge } from './ForecastStatusBadge';

type ForecastSignalPreviewCardProps = {
  signal: ForecastSignal;
  focusId: string;
  compact?: boolean;
  onSelect: (signal: ForecastSignal) => void;
};

export function ForecastSignalPreviewCard({
  signal,
  focusId,
  compact = false,
  onSelect,
}: ForecastSignalPreviewCardProps) {
  const thumb = signal.assets.thumbnail ?? signal.assets.hero;

  return (
    <button
      type="button"
      className={`lounge-tv-forecast-signal-card ${compact ? 'lounge-tv-forecast-signal-card--compact' : ''}`.trim()}
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={focusId}
      aria-label={`${signal.categoryLabel}: ${signal.title}`}
      onClick={() => onSelect(signal)}
      onFocusCapture={loungeTvFocusGlowIn}
      onBlurCapture={loungeTvFocusGlowOut}
    >
      {thumb ? (
        <span className="lounge-tv-forecast-signal-card__thumb">
          <img src={thumb} alt="" loading="lazy" decoding="async" />
          <span className="lounge-tv-forecast-signal-card__thumb-veil" aria-hidden />
        </span>
      ) : null}
      <span className="lounge-tv-forecast-signal-card__copy">
        <span
          className="lounge-tv-forecast-signal-card__category"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.07em',
          }}
        >
          {signal.categoryLabel}
        </span>
        <span
          className="lounge-tv-forecast-signal-card__title"
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: compact ? LOUNGE_TV_TYPE.l3 : LOUNGE_TV_TYPE.l2,
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.04em',
          }}
        >
          {signal.title}
        </span>
        <ForecastStatusBadge status={signal.status} compact={compact} />
      </span>
    </button>
  );
}
