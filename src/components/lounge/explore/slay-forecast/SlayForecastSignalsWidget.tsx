import type { ForecastEdition } from '../../../../content/slay-forecast';
import { getEditionObservations } from '../../../../content/slay-forecast';
import {
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { forecastObservationDisplay } from './slayForecastPresentation';
import { SlayForecastSignalIcon } from './SlayForecastSignalIcon';
import { SlayForecastWidgetShell } from './SlayForecastWidgetShell';

type SlayForecastSignalsWidgetProps = {
  edition: ForecastEdition;
  maxRows?: number;
};

/** Supporting evidence rows — not separate forecasts. */
export function SlayForecastSignalsWidget({
  edition,
  maxRows = 4,
}: SlayForecastSignalsWidgetProps) {
  const observations = getEditionObservations(edition).slice(0, maxRows);
  if (observations.length === 0) return null;

  return (
    <SlayForecastWidgetShell className="lounge-tv-slay-forecast-signals" dataWidget="signals">
      <p
        className="lounge-tv-slay-forecast-signals__title"
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.08em',
        }}
      >
        WHAT WE&apos;RE SEEING
      </p>
      <ul className="lounge-tv-slay-forecast-signals__list">
        {observations.map((observation) => (
          <li key={observation.id} className="lounge-tv-slay-forecast-signals__row">
            <span className="lounge-tv-slay-forecast-signals__icon-wrap">
              <SlayForecastSignalIcon category={observation.category} />
            </span>
            <span
              className="lounge-tv-slay-forecast-signals__label"
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.04em',
              }}
            >
              {observation.label}
            </span>
            <span
              className="lounge-tv-slay-forecast-signals__status"
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: 'rgba(255,255,255,0.62)',
                letterSpacing: '0.06em',
              }}
            >
              {forecastObservationDisplay(observation.momentum)}
            </span>
          </li>
        ))}
      </ul>
    </SlayForecastWidgetShell>
  );
}
