import type { ForecastEdition } from '../../../../content/slay-forecast';
import { formatForecastEditionStatusLabel } from '../../../../content/slay-forecast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import {
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';

type SlayForecastEditionNavProps = {
  previous?: ForecastEdition;
  current: ForecastEdition;
  next?: ForecastEdition;
  onSelectEdition: (editionId: string) => void;
  focusIdPrefix?: string;
  /** Active live week — subtle red glow on current period. */
  highlightCurrent?: boolean;
};

export function SlayForecastEditionNav({
  previous,
  current,
  next,
  onSelectEdition,
  focusIdPrefix = 'slay-forecast-edition',
  highlightCurrent = false,
}: SlayForecastEditionNavProps) {
  const statusLabel = formatForecastEditionStatusLabel(current);

  return (
    <nav
      className="lounge-tv-slay-forecast-edition-nav"
      aria-label="Forecast edition navigation"
    >
      {previous ? (
        <button
          type="button"
          className="lounge-tv-slay-forecast-edition-nav__adjacent lounge-tv-slay-forecast-edition-nav__prev"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id={`${focusIdPrefix}-prev`}
          aria-label={`Previous forecast ${previous.displayPeriod}`}
          onClick={() => onSelectEdition(previous.id)}
          onFocusCapture={loungeTvFocusGlowIn}
          onBlurCapture={loungeTvFocusGlowOut}
        >
          <span className="lounge-tv-slay-forecast-edition-nav__chevron" aria-hidden>
            ‹
          </span>
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.06em',
            }}
          >
            {previous.displayPeriod}
          </span>
        </button>
      ) : (
        <span className="lounge-tv-slay-forecast-edition-nav__spacer" aria-hidden />
      )}

      <div
        className={[
          'lounge-tv-slay-forecast-edition-nav__current',
          highlightCurrent ? 'lounge-tv-slay-forecast-edition-nav__current--live' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: LOUNGE_TV_TYPE.l2,
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.06em',
          }}
        >
          {current.displayPeriod}
        </span>
        <span
          className="lounge-tv-slay-forecast-edition-nav__status"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.08em',
          }}
        >
          {statusLabel}
        </span>
      </div>

      {next ? (
        <button
          type="button"
          className="lounge-tv-slay-forecast-edition-nav__adjacent lounge-tv-slay-forecast-edition-nav__next"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id={`${focusIdPrefix}-next`}
          aria-label={`Next forecast ${next.displayPeriod}`}
          onClick={() => onSelectEdition(next.id)}
          onFocusCapture={loungeTvFocusGlowIn}
          onBlurCapture={loungeTvFocusGlowOut}
        >
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.06em',
            }}
          >
            {next.displayPeriod}
          </span>
          <span className="lounge-tv-slay-forecast-edition-nav__chevron" aria-hidden>
            ›
          </span>
        </button>
      ) : (
        <span className="lounge-tv-slay-forecast-edition-nav__spacer" aria-hidden />
      )}
    </nav>
  );
}
