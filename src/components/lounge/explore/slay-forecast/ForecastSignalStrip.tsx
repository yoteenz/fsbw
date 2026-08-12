import type { ForecastSignal } from '../../../../content/slay-forecast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { forecastCategoryShortLabel } from './slayForecastPresentation';
import { ForecastStatusBadge } from './ForecastStatusBadge';

type ForecastSignalStripProps = {
  signals: ForecastSignal[];
  focusIdPrefix: string;
  onSelect: (signal: ForecastSignal) => void;
};

/** Signal observations read from the Forecast orb — subordinate instrument output. */
export function ForecastSignalStrip({ signals, focusIdPrefix, onSelect }: ForecastSignalStripProps) {
  if (signals.length === 0) return null;

  return (
    <div className="lounge-tv-slay-forecast-signals" role="list" aria-label="Current forecast signals">
      <span className="lounge-tv-slay-forecast-signals__line" aria-hidden />
      <p className="lounge-tv-slay-forecast-signals__heading">CURRENT SIGNALS</p>
      <div className="lounge-tv-slay-forecast-signals__row">
        {signals.map((signal, index) => (
          <button
            key={signal.id}
            type="button"
            className={`lounge-tv-slay-forecast-signals__item lounge-tv-slay-forecast-signals__item--${index + 1}`}
            role="listitem"
            data-lounge-tv-focusable
            data-lounge-tv-focus-id={`${focusIdPrefix}-${signal.id}`}
            aria-label={`Signal ${String(signal.number).padStart(2, '0')}: ${signal.categoryLabel}, ${signal.title}`}
            onClick={() => onSelect(signal)}
            onFocusCapture={loungeTvFocusGlowIn}
            onBlurCapture={loungeTvFocusGlowOut}
          >
            <span
              className="lounge-tv-slay-forecast-signals__index"
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: '#EB1C24',
                letterSpacing: '0.08em',
              }}
            >
              {String(signal.number).padStart(2, '0')}
            </span>
            <span
              className="lounge-tv-slay-forecast-signals__category"
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_GRAY,
                letterSpacing: '0.07em',
              }}
            >
              {forecastCategoryShortLabel(signal.categoryLabel)}
            </span>
            <span
              className="lounge-tv-slay-forecast-signals__title"
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.04em',
              }}
            >
              {signal.title}
            </span>
            <ForecastStatusBadge status={signal.status} compact />
          </button>
        ))}
      </div>
    </div>
  );
}
