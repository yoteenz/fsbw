import type { ForecastEdition } from '../../../../content/slay-forecast';
import {
  formatEditionSummaryKicker,
  formatPrimaryForecastOverlay,
  getEditionConfidenceLabel,
  getEditionDashboardSummary,
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
import { forecastStatusArrow, forecastStatusDisplay } from './slayForecastPresentation';
import { SlayForecastWidgetShell } from './SlayForecastWidgetShell';

type SlayForecastCurrentCardProps = {
  edition: ForecastEdition;
};

function MomentumWaveform() {
  return (
    <svg
      className="lounge-tv-slay-forecast-current-card__waveform"
      viewBox="0 0 48 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        className="lounge-tv-slay-forecast-current-card__waveform-path"
        d="M0 8 Q6 2 12 8 T24 8 T36 8 T48 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ConfidenceDiamond() {
  return (
    <span className="lounge-tv-slay-forecast-current-card__confidence-gem" aria-hidden>
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 2l5 5-5 5-5-5 5-5z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Primary weekly forecast — weather-dashboard hero card. */
export function SlayForecastCurrentCard({ edition }: SlayForecastCurrentCardProps) {
  const { label, action } = formatPrimaryForecastOverlay(edition);
  const titleLead = /\bARE\b/i.test(label) ? label.toUpperCase() : `${label.toUpperCase()} ARE`;
  const titleAction = action.toUpperCase().replace(/\.$/, '');
  const momentumArrow = edition.momentum ? forecastStatusArrow(edition.momentum) : '↑';
  const summary = getEditionDashboardSummary(edition);
  const kicker = formatEditionSummaryKicker(edition);
  const confidence = getEditionConfidenceLabel(edition);

  return (
    <SlayForecastWidgetShell className="lounge-tv-slay-forecast-current-card" dataWidget="current">
      <div className="lounge-tv-slay-forecast-current-card__layout">
        <section className="lounge-tv-slay-forecast-current-card__main" aria-label="Weekly forecast">
          <p
            className="lounge-tv-slay-forecast-current-card__kicker"
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.08em',
            }}
          >
            {kicker}
          </p>
          <h3 className="lounge-tv-slay-forecast-current-card__title">
            <span
              className="lounge-tv-slay-forecast-current-card__title-lead"
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l1,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.04em',
              }}
            >
              {titleLead}
            </span>
            <span
              className="lounge-tv-slay-forecast-current-card__title-action"
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l1,
                color: LOUNGE_TV_BRAND_RED,
                letterSpacing: '0.04em',
              }}
            >
              {titleAction}. {momentumArrow}
            </span>
          </h3>
          {summary ? (
            <p
              className="lounge-tv-slay-forecast-current-card__summary"
              style={{
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: 'rgba(255,255,255,0.78)',
                letterSpacing: '0.02em',
                textTransform: 'none',
              }}
            >
              {summary}
            </p>
          ) : null}
        </section>

        <aside className="lounge-tv-slay-forecast-current-card__metrics" aria-label="Forecast metrics">
          {edition.momentum ? (
            <div className="lounge-tv-slay-forecast-current-card__metric">
              <p
                className="lounge-tv-slay-forecast-current-card__metric-label"
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.08em',
                }}
              >
                MOMENTUM
              </p>
              <p
                className="lounge-tv-slay-forecast-current-card__metric-value"
                style={{
                  fontFamily: LOUNGE_TV_FONT_DEMI,
                  fontSize: LOUNGE_TV_TYPE.l3,
                  color: LOUNGE_TV_TEXT_WHITE,
                  letterSpacing: '0.06em',
                }}
              >
                {forecastStatusDisplay(edition.momentum)}
              </p>
              <MomentumWaveform />
            </div>
          ) : null}
          <div className="lounge-tv-slay-forecast-current-card__metric lounge-tv-slay-forecast-current-card__metric--confidence">
            <p
              className="lounge-tv-slay-forecast-current-card__metric-label"
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_GRAY,
                letterSpacing: '0.08em',
              }}
            >
              CONFIDENCE
            </p>
            <p
              className="lounge-tv-slay-forecast-current-card__metric-value"
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.06em',
              }}
            >
              {confidence}
            </p>
            <ConfidenceDiamond />
          </div>
        </aside>
      </div>
    </SlayForecastWidgetShell>
  );
}
