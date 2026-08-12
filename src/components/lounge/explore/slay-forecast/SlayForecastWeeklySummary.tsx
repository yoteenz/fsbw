import type { ForecastEdition } from '../../../../content/slay-forecast';
import {
  formatEditionSummaryKicker,
  getEditionObservations,
  getNewestPublishedPulse,
} from '../../../../content/slay-forecast';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { forecastObservationDisplay, forecastStatusDisplay } from './slayForecastPresentation';

type SlayForecastWeeklySummaryProps = {
  edition: ForecastEdition;
};

function confidenceLabel(edition: ForecastEdition): string {
  const observations = getEditionObservations(edition);
  const highCount = observations.filter((o) => o.evidenceStrength === 'high').length;
  if (highCount >= 2 || edition.momentum === 'accelerating') return 'HIGH';
  if (observations.some((o) => o.evidenceStrength === 'medium')) return 'MODERATE';
  return 'BUILDING';
}

/** Compact weekly forecast summary — below nav row, never over the video. */
export function SlayForecastWeeklySummary({ edition }: SlayForecastWeeklySummaryProps) {
  const observations = getEditionObservations(edition).slice(0, 3);
  const newestPulse = getNewestPublishedPulse(edition);
  const outlook =
    edition.shortForecast?.trim() ||
    edition.outlook?.trim() ||
    edition.optionalSubheadline?.trim() ||
    '';
  const summaryKicker = formatEditionSummaryKicker(edition);

  return (
    <div className="lounge-tv-slay-forecast-weekly-summary">
      <div className="lounge-tv-slay-forecast-weekly-summary__accent" aria-hidden />

      <section className="lounge-tv-slay-forecast-weekly-summary__hero" aria-label="Weekly forecast">
        <p
          className="lounge-tv-slay-forecast-weekly-summary__kicker"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l3,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.08em',
            margin: 0,
          }}
        >
          {summaryKicker}
        </p>
        <h3
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: LOUNGE_TV_TYPE.l1,
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.04em',
            margin: '0.18em 0 0',
            lineHeight: 1.08,
          }}
        >
          {edition.headline}
        </h3>
        {outlook ? (
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_TYPE.l3,
              color: 'rgba(255,255,255,0.78)',
              letterSpacing: '0.02em',
              margin: '0.35em 0 0',
              lineHeight: 1.4,
              textTransform: 'none',
            }}
          >
            {outlook}
          </p>
        ) : null}

        <dl className="lounge-tv-slay-forecast-weekly-summary__status-row">
          {edition.momentum ? (
            <div className="lounge-tv-slay-forecast-weekly-summary__status-item">
              <dt
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.08em',
                }}
              >
                MOMENTUM
              </dt>
              <dd
                style={{
                  fontFamily: LOUNGE_TV_FONT_DEMI,
                  fontSize: LOUNGE_TV_TYPE.l3,
                  color: LOUNGE_TV_TEXT_WHITE,
                  letterSpacing: '0.06em',
                  margin: '0.08em 0 0',
                }}
              >
                {forecastStatusDisplay(edition.momentum)}
              </dd>
            </div>
          ) : null}
          <div className="lounge-tv-slay-forecast-weekly-summary__status-item">
            <dt
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_GRAY,
                letterSpacing: '0.08em',
              }}
            >
              CONFIDENCE
            </dt>
            <dd
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.06em',
                margin: '0.08em 0 0',
              }}
            >
              {confidenceLabel(edition)}
            </dd>
          </div>
        </dl>
      </section>

      {observations.length > 0 ? (
        <section
          className="lounge-tv-slay-forecast-weekly-summary__seeing"
          aria-label="What we're seeing"
        >
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.08em',
              margin: 0,
            }}
          >
            WHAT WE&apos;RE SEEING
          </p>
          <ul className="lounge-tv-slay-forecast-weekly-summary__signals">
            {observations.map((observation) => (
              <li key={observation.id} className="lounge-tv-slay-forecast-weekly-summary__signal">
                <span
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
        </section>
      ) : null}

      {newestPulse ? (
        <section className="lounge-tv-slay-forecast-weekly-summary__pulse" aria-label="Latest forecast pulse">
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.1em',
              margin: 0,
            }}
          >
            FORECAST PULSE
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
            {newestPulse.headline}
          </p>
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.02em',
              margin: '0.15em 0 0',
              lineHeight: 1.35,
              textTransform: 'none',
            }}
          >
            {newestPulse.body}
          </p>
        </section>
      ) : null}
    </div>
  );
}
