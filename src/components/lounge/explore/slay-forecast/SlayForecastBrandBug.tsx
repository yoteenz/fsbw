import { memo, useEffect } from 'react';
import {
  SLAY_FORECAST_BRAND_BUG_ASSET_URL,
  SLAY_FORECAST_BRAND_BUG_DEFAULT,
} from '../../../../constants/slayForecastBroadcast';

export type SlayForecastBrandBugProps = {
  visible?: boolean;
  asset?: string;
  /** Subtle one-time entrance on mount (CSS handles reduced-motion). */
  animateEntrance?: boolean;
};

let preloadScheduled = false;

function preloadBrandBugAsset(url: string) {
  if (preloadScheduled || typeof document === 'undefined') return;
  preloadScheduled = true;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
}

/** Persistent Slay Forecast signature — composited by the website, never encoded in PSA video. */
export const SlayForecastBrandBug = memo(function SlayForecastBrandBug({
  visible = true,
  asset = SLAY_FORECAST_BRAND_BUG_ASSET_URL,
  animateEntrance = true,
}: SlayForecastBrandBugProps) {
  useEffect(() => {
    preloadBrandBugAsset(asset);
  }, [asset]);

  if (!visible) return null;

  const position = SLAY_FORECAST_BRAND_BUG_DEFAULT.position;

  return (
    <div
      className={`lounge-tv-slay-forecast-brand-bug${
        animateEntrance ? ' lounge-tv-slay-forecast-brand-bug--enter' : ''
      }`.trim()}
      style={{
        left: position.left,
        bottom: position.bottom,
        width: SLAY_FORECAST_BRAND_BUG_DEFAULT.width,
      }}
      aria-hidden
    >
      <img
        src={asset}
        alt=""
        className="lounge-tv-slay-forecast-brand-bug__img"
        width={SLAY_FORECAST_BRAND_BUG_DEFAULT.intrinsicWidth}
        height={SLAY_FORECAST_BRAND_BUG_DEFAULT.intrinsicHeight}
        decoding="async"
        draggable={false}
      />
    </div>
  );
});
