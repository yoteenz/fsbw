import type { ForecastEdition } from '../../../../content/slay-forecast';
import {
  buildForecastWeekPulseDays,
  getWeeklyPulseCaption,
  pulseTierToArrows,
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

type SlayForecastWeeklyPulseProps = {
  edition: ForecastEdition;
};

/** 7-day intensity strip — same forecast strengthening through the week. */
export function SlayForecastWeeklyPulse({ edition }: SlayForecastWeeklyPulseProps) {
  const days = buildForecastWeekPulseDays(edition);
  const caption = getWeeklyPulseCaption(edition);

  return (
    <SlayForecastWidgetShell className="lounge-tv-slay-forecast-weekly-pulse" dataWidget="weekly-pulse">
      <p
        className="lounge-tv-slay-forecast-weekly-pulse__label"
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_BRAND_RED,
          letterSpacing: '0.1em',
        }}
      >
        FORECAST PULSE
      </p>

      <ol className="lounge-tv-slay-forecast-weekly-pulse__days" aria-label="Weekly forecast intensity">
        {days.map((day) => (
          <li key={day.isoDate} className="lounge-tv-slay-forecast-weekly-pulse__day">
            <span
              className="lounge-tv-slay-forecast-weekly-pulse__day-label"
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_GRAY,
                letterSpacing: '0.06em',
              }}
            >
              {day.label}
            </span>
            <span
              className={`lounge-tv-slay-forecast-weekly-pulse__indicator lounge-tv-slay-forecast-weekly-pulse__indicator--tier-${day.tier}`}
              aria-hidden
            />
            <span
              className="lounge-tv-slay-forecast-weekly-pulse__arrows"
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_BRAND_RED,
                letterSpacing: '0.04em',
              }}
            >
              {pulseTierToArrows(day.tier)}
            </span>
          </li>
        ))}
      </ol>

      <p
        className="lounge-tv-slay-forecast-weekly-pulse__caption"
        style={{
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.04em',
        }}
      >
        {caption}
      </p>
    </SlayForecastWidgetShell>
  );
}
