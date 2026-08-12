import {
  SLAY_FORECAST_GOLDEN_PROMPT_VERSION,
} from './goldenPrompt.js';
import { livePreviewPublicUrl } from './publicAssetUrls.js';

/** Approved PSA Slay Forecast master image — production source frame (unchanged). */
export const PSA_FORECAST_MASTER_ASSET_VERSION = 'PSA_FORECAST_MASTER_V1';

export const APPROVED_PSA_FORECAST_MASTER_IMAGE_URL = livePreviewPublicUrl(
  '3D%20Stock/Lounge/F5C94CE3-DF1B-4B42-9ECD-BA3768B93A10.png',
);

/** Canonical locked generation configuration — single source of truth. */
export const slayForecastGenerationConfig = {
  provider: 'minimax' as const,
  model: 'MiniMax-H3',
  modelAlias: 'h3',
  durationSeconds: 15,
  aspectRatio: '16:9' as const,
  /** Production target; MiniMax API may map to highest supported tier (2K). */
  resolution: '4K' as const,
  apiResolution: '2K' as const,
  masterImage: APPROVED_PSA_FORECAST_MASTER_IMAGE_URL,
  masterAssetVersion: PSA_FORECAST_MASTER_ASSET_VERSION,
  promptTemplateVersion: SLAY_FORECAST_GOLDEN_PROMPT_VERSION,
  phaseTiming: {
    openingEndSec: 4,
    graphicsWindowStartSec: 4,
    closingStartSec: 11,
    completeSec: 15,
  },
  silentHoldMinSec: 5,
  maxSpokenSec: 8,
} as const;
