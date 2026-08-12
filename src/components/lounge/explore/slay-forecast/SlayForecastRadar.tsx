import type { ForecastSeason, ForecastSignal } from '../../../../content/slay-forecast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { ForecastStatusBadge } from './ForecastStatusBadge';
import { forecastCategoryShortLabel } from './slayForecastPresentation';

type SlayForecastRadarProps = {
  season: ForecastSeason;
  onSelectSignal: (signal: ForecastSignal) => void;
};

const RADAR_POSITIONS = [
  'top',
  'upper-right',
  'lower-right',
  'lower-left',
  'upper-left',
] as const;

export function SlayForecastRadar({ season, onSelectSignal }: SlayForecastRadarProps) {
  const signals = season.signals.slice(0, 5);

  return (
    <section className="lounge-tv-slay-forecast-radar" aria-label="Forecast radar">
      <h3
        className="lounge-tv-slay-forecast-radar__title"
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l2,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        THE FORECAST RADAR
      </h3>
      <div className="lounge-tv-slay-forecast-radar__stage">
        <span className="lounge-tv-slay-forecast-radar__ring lounge-tv-slay-forecast-radar__ring--outer" aria-hidden />
        <span className="lounge-tv-slay-forecast-radar__ring lounge-tv-slay-forecast-radar__ring--inner" aria-hidden />
        <span className="lounge-tv-slay-forecast-radar__core" aria-hidden>
          FS
        </span>
        {signals.map((signal, index) => {
          const pos = RADAR_POSITIONS[index] ?? 'top';
          return (
            <button
              key={signal.id}
              type="button"
              className={`lounge-tv-slay-forecast-radar__node lounge-tv-slay-forecast-radar__node--${pos}`}
              data-lounge-tv-focusable
              data-lounge-tv-focus-id={`forecast-radar-${signal.id}`}
              aria-label={`Signal ${signal.number}: ${signal.title}`}
              onClick={() => onSelectSignal(signal)}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
            >
              <span className="lounge-tv-slay-forecast-radar__node-index">
                {String(signal.number).padStart(2, '0')}
              </span>
              <span
                className="lounge-tv-slay-forecast-radar__node-category"
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  letterSpacing: '0.07em',
                }}
              >
                {forecastCategoryShortLabel(signal.categoryLabel)}
              </span>
              <span
                className="lounge-tv-slay-forecast-radar__node-title"
                style={{
                  fontFamily: LOUNGE_TV_FONT_DEMI,
                  fontSize: LOUNGE_TV_TYPE.l3,
                  letterSpacing: '0.04em',
                }}
              >
                {signal.title}
              </span>
              <ForecastStatusBadge status={signal.status} compact />
            </button>
          );
        })}
      </div>
    </section>
  );
}
