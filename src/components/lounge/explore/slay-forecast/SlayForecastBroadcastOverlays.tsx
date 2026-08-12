import type { CSSProperties } from 'react';
import type { ForecastBeat, ForecastBroadcastPhase } from '../../../../content/slay-forecast';
import { beatExitProgress } from '../../../../content/slay-forecast';
import { SLAY_FORECAST_OVERLAY_ZONES } from '../../../../constants/slayForecastBroadcast';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { forecastObservationDisplay } from './slayForecastPresentation';

type SlayForecastBroadcastOverlaysProps = {
  beats: ForecastBeat[];
  phase: ForecastBroadcastPhase;
  currentTime: number;
  reducedMotion?: boolean;
};

function zoneStyle(
  zoneKey: ForecastBeat['zoneKey'],
): CSSProperties {
  const zone = SLAY_FORECAST_OVERLAY_ZONES[zoneKey];
  const style: CSSProperties = {
    top: zone.top,
    bottom: zone.bottom,
    textAlign: zone.align,
  };
  if (zone.left != null) style.left = zone.left;
  if (zone.right != null) style.right = zone.right;
  if (zone.align === 'center') {
    style.left = zone.left ?? '50%';
    style.transform = 'translateX(-50%)';
  }
  return style;
}

function momentumArrow(momentum?: ForecastBeat['momentum']): string {
  if (!momentum) return '↑';
  if (momentum === 'cooling') return '↓';
  if (momentum === 'holding') return '→';
  return '↑';
}

export function SlayForecastBroadcastOverlays({
  beats,
  phase,
  currentTime,
  reducedMotion = false,
}: SlayForecastBroadcastOverlaysProps) {
  if (phase !== 'hold' && phase !== 'clearing') return null;
  if (beats.length === 0) return null;

  return (
    <div className="lounge-tv-slay-forecast-broadcast__overlays" aria-live="polite">
      <div className="lounge-tv-slay-forecast-broadcast__brand-safe-zone" aria-hidden />
      <div className="lounge-tv-slay-forecast-broadcast__hud-field" aria-hidden />

      {beats.map((beat) => {
        const exit = beatExitProgress(currentTime, beat, phase);
        const enterDelay =
          reducedMotion ? 0 : Math.max(0, (beat.revealAt - (beats[0]?.revealAt ?? 0)) * 1000);
        const isPrimary = beat.kind === 'primary';

        return (
          <div
            key={beat.id}
            className={[
              'lounge-tv-slay-forecast-hud',
              isPrimary ? 'lounge-tv-slay-forecast-hud--primary' : 'lounge-tv-slay-forecast-hud--supporting',
              `lounge-tv-slay-forecast-hud--${beat.zoneKey}`,
              exit > 0 ? 'lounge-tv-slay-forecast-hud--exit' : 'lounge-tv-slay-forecast-hud--enter',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              ...zoneStyle(beat.zoneKey),
              animationDelay: `${enterDelay}ms`,
              opacity: exit > 0 ? Math.max(0, 1 - exit) : undefined,
              transform:
                exit > 0
                  ? `translate3d(0, ${exit * 8}px, 0) scale(${1 - exit * 0.06})`
                  : undefined,
            }}
          >
            <span className="lounge-tv-slay-forecast-hud__chrome" aria-hidden />
            <span className="lounge-tv-slay-forecast-hud__scan" aria-hidden />
            <div className="lounge-tv-slay-forecast-hud__content">
              {isPrimary ? (
                <>
                  <span
                    className="lounge-tv-slay-forecast-hud__label"
                    style={{
                      fontFamily: LOUNGE_TV_FONT_DEMI,
                      fontSize: LOUNGE_TV_TYPE.l1,
                      color: LOUNGE_TV_TEXT_WHITE,
                    }}
                  >
                    {beat.label}
                  </span>
                  <span
                    className="lounge-tv-slay-forecast-hud__action"
                    style={{
                      fontFamily: LOUNGE_TV_FONT_MEDIUM,
                      fontSize: LOUNGE_TV_TYPE.l2,
                    }}
                  >
                    {beat.action ?? 'MOVING IN'} {momentumArrow(beat.momentum)}
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="lounge-tv-slay-forecast-hud__support-label"
                    style={{
                      fontFamily: LOUNGE_TV_FONT_DEMI,
                      fontSize: LOUNGE_TV_TYPE.l3,
                      color: LOUNGE_TV_TEXT_WHITE,
                    }}
                  >
                    {beat.label}
                  </span>
                  <span
                    className="lounge-tv-slay-forecast-hud__support-momentum"
                    style={{
                      fontFamily: LOUNGE_TV_FONT_MEDIUM,
                      fontSize: LOUNGE_TV_TYPE.l4,
                    }}
                  >
                    {forecastObservationDisplay(beat.momentum ?? 'rising')} {momentumArrow(beat.momentum)}
                  </span>
                </>
              )}
            </div>
            <span className="lounge-tv-slay-forecast-hud__vector" aria-hidden />
          </div>
        );
      })}
    </div>
  );
}
