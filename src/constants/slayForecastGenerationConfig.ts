/**
 * Client-safe mirror of locked Slay Forecast generation config.
 * Server canonical source: api/_lib/slayForecastBroadcast/generationConfig.ts
 */
import { loungeTvLivePreviewPublicUrl } from '../components/lounge/loungeTvAssets';

export const SLAY_FORECAST_GOLDEN_PROMPT_VERSION = 'SLAY_FORECAST_GOLDEN_V1';
export const PSA_FORECAST_MASTER_ASSET_VERSION = 'PSA_FORECAST_MASTER_V1';

export const APPROVED_PSA_FORECAST_MASTER_IMAGE_URL = loungeTvLivePreviewPublicUrl(
  '3D%20Stock/Lounge/F5C94CE3-DF1B-4B42-9ECD-BA3768B93A10.png',
);

export const slayForecastGenerationConfig = {
  provider: 'minimax' as const,
  model: 'MiniMax-H3',
  durationSeconds: 15,
  aspectRatio: '16:9' as const,
  resolution: '4K' as const,
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
