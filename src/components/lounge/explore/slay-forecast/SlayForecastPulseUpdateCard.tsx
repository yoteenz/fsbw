import type { ForecastEdition } from '../../../../content/slay-forecast';
import {
  formatPulseUpdateLabel,
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
import { SlayForecastWidgetShell } from './SlayForecastWidgetShell';

type SlayForecastPulseUpdateCardProps = {
  edition: ForecastEdition;
};

/** Mid-week pulse update — evolves the same weekly forecast. */
export function SlayForecastPulseUpdateCard({ edition }: SlayForecastPulseUpdateCardProps) {
  const pulse = getNewestPublishedPulse(edition);
  if (!pulse) return null;

  return (
    <SlayForecastWidgetShell className="lounge-tv-slay-forecast-pulse-update" dataWidget="pulse-update">
      <div className="lounge-tv-slay-forecast-pulse-update__header">
        <span className="lounge-tv-slay-forecast-pulse-update__star" aria-hidden>
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 1.5l1.6 3.4 3.7.5-2.7 2.6.6 3.7-3.2-1.7-3.2 1.7.6-3.7-2.7-2.6 3.7-.5L8 1.5z"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p
          className="lounge-tv-slay-forecast-pulse-update__label"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_BRAND_RED,
            letterSpacing: '0.1em',
          }}
        >
          FORECAST PULSE
        </p>
      </div>
      <p
        className="lounge-tv-slay-forecast-pulse-update__headline"
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l3,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {pulse.headline}
      </p>
      <p
        className="lounge-tv-slay-forecast-pulse-update__body"
        style={{
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: 'rgba(255,255,255,0.72)',
          letterSpacing: '0.02em',
          textTransform: 'none',
          lineHeight: 1.4,
        }}
      >
        {pulse.body}
      </p>
      <p
        className="lounge-tv-slay-forecast-pulse-update__stamp"
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.08em',
        }}
      >
        {formatPulseUpdateLabel(pulse.publishedAt)}
      </p>
    </SlayForecastWidgetShell>
  );
}
