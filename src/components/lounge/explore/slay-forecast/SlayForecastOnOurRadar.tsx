import type { ForecastRadarSignal } from '../../../../content/slay-forecast';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';

type SlayForecastOnOurRadarProps = {
  signals: ForecastRadarSignal[];
};

const RADAR_STATUS_LABEL: Record<ForecastRadarSignal['status'], string> = {
  early: 'EARLY',
  forming: 'FORMING',
  watching: 'WATCHING',
};

export function SlayForecastOnOurRadar({ signals }: SlayForecastOnOurRadarProps) {
  if (signals.length === 0) return null;

  return (
    <section className="lounge-tv-slay-forecast-radar-list" aria-label="On our radar">
      <h3
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l2,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        ON OUR RADAR
      </h3>
      <p
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.04em',
          margin: '0.35em 0 0',
        }}
      >
        Early reads — not yet strong enough for the primary forecast.
      </p>
      <ul className="lounge-tv-slay-forecast-radar-list__items">
        {signals.map((signal) => (
          <li key={signal.id} className="lounge-tv-slay-forecast-radar-list__item">
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.05em',
              }}
            >
              {signal.label}
            </span>
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_GRAY,
                letterSpacing: '0.08em',
                marginLeft: '0.65em',
              }}
            >
              {RADAR_STATUS_LABEL[signal.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
