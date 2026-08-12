import type { ForecastEdition } from '../../../../content/slay-forecast';
import { getEditionPulses } from '../../../../content/slay-forecast';
import { FORECAST_PULSE_TYPE_LABELS } from '../../../../content/slay-forecast/weeklyForecastTypes';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';

type SlayForecastPulsesSectionProps = {
  edition: ForecastEdition;
};

/** Mid-week developing coverage — never replaces the weekly forecast. */
export function SlayForecastPulsesSection({ edition }: SlayForecastPulsesSectionProps) {
  const pulses = getEditionPulses(edition).filter((p) => p.status === 'published');
  if (pulses.length === 0) return null;

  return (
    <section className="lounge-tv-slay-forecast-pulses" aria-label="Forecast pulses">
      <h3
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l2,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        FORECAST PULSES
      </h3>
      <ul className="lounge-tv-slay-forecast-pulses__list">
        {pulses.map((pulse) => (
          <li key={pulse.id} className="lounge-tv-slay-forecast-pulses__item">
            <p
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_GRAY,
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              {FORECAST_PULSE_TYPE_LABELS[pulse.type]}
            </p>
            <p
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.04em',
                margin: '0.2em 0 0',
              }}
            >
              {pulse.headline}
            </p>
            <p
              style={{
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: 'rgba(255,255,255,0.72)',
                letterSpacing: '0.02em',
                margin: '0.25em 0 0',
                lineHeight: 1.4,
                textTransform: 'none',
              }}
            >
              {pulse.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
