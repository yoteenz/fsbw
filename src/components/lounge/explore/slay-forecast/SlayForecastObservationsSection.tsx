import type { ForecastEdition, ForecastObservation } from '../../../../content/slay-forecast';
import { getEditionObservations } from '../../../../content/slay-forecast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import {
  forecastCategoryShortLabel,
  forecastObservationDisplay,
} from './slayForecastPresentation';

type SlayForecastObservationsSectionProps = {
  edition: ForecastEdition;
  onSelectObservation?: (observation: ForecastObservation) => void;
  onOpenTrendReport?: (packId: string) => void;
  focusIdPrefix?: string;
  /** Hub detail uses full section title; compact modes can shorten. */
  heading?: string;
};

/** Supporting evidence for the weekly forecast — not separate forecasts. */
export function SlayForecastObservationsSection({
  edition,
  onSelectObservation,
  onOpenTrendReport,
  focusIdPrefix = 'forecast-observation',
  heading = "WHAT WE'RE SEEING",
}: SlayForecastObservationsSectionProps) {
  const observations = getEditionObservations(edition);
  if (observations.length === 0) return null;

  return (
    <section className="lounge-tv-slay-forecast-observations" aria-label="Supporting forecast observations">
      <h3
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l2,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        {heading}
      </h3>
      <div className="lounge-tv-slay-forecast-observations__grid">
        {observations.map((observation, index) => (
          <article key={observation.id} className="lounge-tv-slay-forecast-observations__card">
            <button
              type="button"
              className="lounge-tv-slay-forecast-observations__hit"
              data-lounge-tv-focusable
              data-lounge-tv-focus-id={`${focusIdPrefix}-${observation.id}`}
              onClick={() => onSelectObservation?.(observation)}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
            >
              <span
                className="lounge-tv-slay-forecast-observations__category"
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.1em',
                }}
              >
                {forecastCategoryShortLabel(observation.categoryLabel)}
              </span>
              <span
                style={{
                  fontFamily: LOUNGE_TV_FONT_DEMI,
                  fontSize: LOUNGE_TV_TYPE.l2,
                  color: LOUNGE_TV_TEXT_WHITE,
                  letterSpacing: '0.04em',
                  display: 'block',
                  marginTop: '0.2em',
                }}
              >
                {observation.label}
              </span>
              <span
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: 'rgba(255,255,255,0.78)',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginTop: '0.25em',
                }}
              >
                {forecastObservationDisplay(observation.momentum)}
              </span>
              {observation.description ? (
                <span
                  style={{
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: LOUNGE_TV_TYPE.l4,
                    color: LOUNGE_TV_TEXT_GRAY,
                    letterSpacing: '0.02em',
                    display: 'block',
                    marginTop: '0.3em',
                    lineHeight: 1.35,
                    textTransform: 'none',
                  }}
                >
                  {observation.description}
                </span>
              ) : null}
            </button>
            {observation.relatedTrendReportId && onOpenTrendReport ? (
              <button
                type="button"
                className="lounge-tv-slay-forecast-observations__report-link"
                data-lounge-tv-focusable
                data-lounge-tv-focus-id={`${focusIdPrefix}-report-${observation.id}`}
                onClick={() => onOpenTrendReport(observation.relatedTrendReportId!)}
                onFocusCapture={loungeTvFocusGlowIn}
                onBlurCapture={loungeTvFocusGlowOut}
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_BRAND_RED,
                  letterSpacing: '0.06em',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '0.35em',
                }}
              >
                VIEW SUPPORTING INTELLIGENCE →
              </button>
            ) : null}
            <span className="lounge-tv-slay-forecast-observations__index" aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

/** @deprecated Use SlayForecastObservationsSection */
export const SlayForecastCurrentSignals = SlayForecastObservationsSection;
