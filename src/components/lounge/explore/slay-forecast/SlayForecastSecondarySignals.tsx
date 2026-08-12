import type { ForecastSecondarySignal } from '../../../../content/slay-forecast';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { ForecastStatusBadge } from './ForecastStatusBadge';

type SlayForecastSecondarySignalsProps = {
  signals: ForecastSecondarySignal[];
};

export function SlayForecastSecondarySignals({ signals }: SlayForecastSecondarySignalsProps) {
  if (!signals.length) return null;

  return (
    <section className="lounge-tv-slay-forecast-secondary" aria-label="Other signals on our radar">
      <h3
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l2,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        OTHER SIGNALS ON OUR RADAR
      </h3>
      <div className="lounge-tv-slay-forecast-secondary__row">
        {signals.map((signal) => (
          <article key={signal.id} className="lounge-tv-slay-forecast-secondary__card">
            {signal.thumbnail ? (
              <span className="lounge-tv-slay-forecast-secondary__thumb">
                <img src={signal.thumbnail} alt="" loading="lazy" decoding="async" />
              </span>
            ) : null}
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.04em',
              }}
            >
              {signal.title}
            </span>
            <ForecastStatusBadge status={signal.status} compact />
            {signal.sparkline?.length ? (
              <Sparkline points={signal.sparkline} />
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const width = 64;
  const height = 18;
  const max = Math.max(...points, 0.01);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 0.01);
  const coords = points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      className="lounge-tv-slay-forecast-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      width={width}
      height={height}
    >
      <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
