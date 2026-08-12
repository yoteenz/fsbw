import type { ForecastRealityEntry } from '../../../../content/slay-forecast';
import { FORECAST_OUTCOME_LABELS } from '../../../../content/slay-forecast';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { ForecastStatusBadge } from './ForecastStatusBadge';

type SlayForecastRealitySectionProps = {
  entries: ForecastRealityEntry[];
};

export function SlayForecastRealitySection({ entries }: SlayForecastRealitySectionProps) {
  if (!entries.length) return null;

  return (
    <section className="lounge-tv-slay-forecast-reality" aria-label="Forecast to reality">
      <h3
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l2,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        FORECAST → REALITY
      </h3>
      <div className="lounge-tv-slay-forecast-reality__list">
        {entries.map((entry) => (
          <article key={entry.id} className="lounge-tv-slay-forecast-reality__item">
            <p
              className="lounge-tv-slay-forecast-reality__season"
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_GRAY,
                letterSpacing: '0.06em',
                margin: 0,
              }}
            >
              {entry.seasonLabel}
            </p>
            <div className="lounge-tv-slay-forecast-reality__compare">
              <div className="lounge-tv-slay-forecast-reality__side">
                {entry.beforeAsset ? (
                  <img src={entry.beforeAsset} alt="" className="lounge-tv-slay-forecast-reality__image" loading="lazy" />
                ) : null}
                <span
                  style={{
                    fontFamily: LOUNGE_TV_FONT_DEMI,
                    fontSize: LOUNGE_TV_TYPE.l3,
                    color: LOUNGE_TV_TEXT_WHITE,
                    letterSpacing: '0.04em',
                  }}
                >
                  {entry.signalTitle}
                </span>
                <span
                  style={{
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: LOUNGE_TV_TYPE.l4,
                    color: LOUNGE_TV_TEXT_GRAY,
                    letterSpacing: '0.06em',
                  }}
                >
                  {entry.originalLabel}
                </span>
                <ForecastStatusBadge status={entry.originalStatus} compact />
              </div>
              <span className="lounge-tv-slay-forecast-reality__arrow" aria-hidden>
                →
              </span>
              <div className="lounge-tv-slay-forecast-reality__side">
                {entry.currentAsset ? (
                  <img src={entry.currentAsset} alt="" className="lounge-tv-slay-forecast-reality__image" loading="lazy" />
                ) : null}
                <span
                  style={{
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: LOUNGE_TV_TYPE.l4,
                    color: LOUNGE_TV_TEXT_GRAY,
                    letterSpacing: '0.06em',
                  }}
                >
                  {entry.outcomeStatus === 'confirmed' ? 'TRENDING NOW' : 'OUTCOME'}
                </span>
                <span
                  style={{
                    fontFamily: LOUNGE_TV_FONT_DEMI,
                    fontSize: LOUNGE_TV_TYPE.l3,
                    color: LOUNGE_TV_TEXT_WHITE,
                    letterSpacing: '0.04em',
                  }}
                >
                  {entry.signalTitle}
                </span>
                <span
                  className="lounge-tv-slay-forecast-reality__outcome"
                  data-outcome={entry.outcomeStatus}
                  style={{
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: LOUNGE_TV_TYPE.l4,
                    letterSpacing: '0.06em',
                  }}
                >
                  {entry.currentLabel || FORECAST_OUTCOME_LABELS[entry.outcomeStatus]}
                </span>
              </div>
            </div>
            {entry.outcomeSummary ? (
              <p
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.03em',
                  margin: '0.5em 0 0',
                  lineHeight: 1.4,
                }}
              >
                {entry.outcomeSummary}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
