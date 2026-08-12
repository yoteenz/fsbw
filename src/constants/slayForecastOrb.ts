import type { ForecastSeason } from '../content/slay-forecast';
import { loungeTvLivePreviewPublicUrl } from '../components/lounge/loungeTvAssets';

/** Ambient Slay Forecast instrument — looping MP4 (H.264, iOS Safari compatible). */
export const SLAY_FORECAST_ORB_VIDEO_SRC = loungeTvLivePreviewPublicUrl(
  '3D%20Stock/Lounge/openart-output_1786480065629_017f0cc2.mp4',
);

/** Static poster until a dedicated first-frame asset ships — crossfades to video. */
export const SLAY_FORECAST_ORB_POSTER_FALLBACK = '/assets/NOIR/noir-thumb.png';

export function slayForecastOrbPosterSrc(season?: ForecastSeason): string {
  return season?.heroAsset?.trim() || SLAY_FORECAST_ORB_POSTER_FALLBACK;
}

export function slayForecastOrbAccessibleLabel(season: ForecastSeason): string {
  const seasonLabel = `${season.season.charAt(0).toUpperCase()}${season.season.slice(1)} ${season.year}`;
  const count = season.signals.length;
  const signalWord = count === 1 ? 'signal' : 'signals';
  return `Open ${seasonLabel} Slay Forecast, ${count} ${signalWord}`;
}
