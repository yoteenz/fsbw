import type { ForecastOverlayZone } from '../content/slay-forecast/editionTypes';
import { loungeTvLivePreviewPublicUrl } from '../components/lounge/loungeTvAssets';
import {
  APPROVED_PSA_FORECAST_MASTER_IMAGE_URL,
  slayForecastGenerationConfig,
} from './slayForecastGenerationConfig';

export { APPROVED_PSA_FORECAST_MASTER_IMAGE_URL, slayForecastGenerationConfig };

export const SLAY_FORECAST_STUDIO_POSTER = APPROVED_PSA_FORECAST_MASTER_IMAGE_URL;

/**
 * MiniMax test broadcast slot for current edition (`forecast-2026-08-10`).
 * Insert MP4 at this path when ready — player works with poster-only until then.
 */
export const SLAY_FORECAST_BROADCAST_VIDEO_SLOT =
  '/assets/lounge/slay-forecast/forecast-2026-08-10-broadcast.mp4';

/** Approved acrylic play glyph — Slay Forecast broadcast idle state only. */
export const SLAY_FORECAST_PLAY_ICON_SRC = loungeTvLivePreviewPublicUrl(
  '3D%20Stock/Lounge/4AF90241-6975-4DD3-9747-CD49D15B7079.png',
);

/** Approved acrylic replay glyph — Slay Forecast broadcast ended state only. */
export const SLAY_FORECAST_REPLAY_ICON_SRC = loungeTvLivePreviewPublicUrl(
  '3D%20Stock/Lounge/7DA4DBC0-8FBB-41D7-B51E-108C3836DDBA.png',
);

/** Approved on-screen Slay Forecast signature emblem — global branding, not per-episode. */
export const SLAY_FORECAST_BRAND_BUG_ASSET_URL = loungeTvLivePreviewPublicUrl(
  '3D%20Stock/Lounge/89C3CD03-773A-474B-8A03-D48DA6386277.png',
);

/** Lower-left safe zone reserved for the brand bug — forecast graphics must avoid this footprint. */
export const SLAY_FORECAST_BRAND_BUG_SAFE_ZONE = {
  left: '0%',
  bottom: '0%',
  width: '28%',
  height: '36%',
} as const;

/** Default lower-left placement tuned to approved reference mockup. */
export const SLAY_FORECAST_BRAND_BUG_DEFAULT = {
  asset: SLAY_FORECAST_BRAND_BUG_ASSET_URL,
  position: {
    left: '3.5%',
    bottom: '7%',
  },
  /** ~18–22% of video width on full TV presentation. */
  width: 'clamp(14%, 20cqw, 22%)',
  intrinsicWidth: 512,
  intrinsicHeight: 512,
} as const;

/** Reusable broadcast-safe overlay regions (camera composition, not outfit-bound). */
export const SLAY_FORECAST_OVERLAY_ZONES: Record<
  ForecastOverlayZone,
  { top: string; left?: string; right?: string; bottom?: string; align: 'left' | 'right' | 'center' }
> = {
  'broadcast-left': {
    top: '8%',
    left: '4%',
    align: 'left',
  },
  'broadcast-right': {
    top: '8%',
    right: '4%',
    align: 'right',
  },
  'broadcast-bottom': {
    top: 'auto',
    bottom: '12%',
    left: '54%',
    align: 'center',
  },
  'broadcast-top-accent': {
    top: '3%',
    left: '50%',
    align: 'center',
  },
};

export const SLAY_FORECAST_DEFAULT_OVERLAY_ASSIGNMENTS: ForecastOverlayZone[] = [
  'broadcast-left',
  'broadcast-right',
  'broadcast-left',
  'broadcast-right',
];
