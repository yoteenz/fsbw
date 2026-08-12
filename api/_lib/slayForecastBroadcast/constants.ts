/** Slay Forecast Broadcast Pipeline — canonical constants */

export const SLAY_FORECAST_STORAGE_BUCKET =
  process.env.SLAY_FORECAST_STORAGE_BUCKET?.trim() ||
  process.env.STORAGE_BUCKET?.trim() ||
  'live-preview';

export const SLAY_FORECAST_STORAGE_PREFIX = 'slay-forecast';

export const OPENING_TEMPLATE_VERSION = 'opening-template-v1';
export const CLOSING_TEMPLATE_VERSION = 'closing-template-v1';

export const DEFAULT_PSA_SPEECH_RATE_WPS = 2.8;
export const OPENING_DURATION_MIN_SEC = 2.5;
export const OPENING_DURATION_MAX_SEC = 4;
export const CLOSING_DURATION_MIN_SEC = 2.5;
export const CLOSING_DURATION_MAX_SEC = 4;

export const DEFAULT_OPENING_DURATION_SEC = 3.5;
export const DEFAULT_CLOSING_DURATION_SEC = 3.5;

export const TIMELINE_INITIAL_HOLD_MS = 300;
export const TIMELINE_SIGNAL_INTERVAL_MS = 900;
export const TIMELINE_PRE_CLOSING_HOLD_MS = 600;

export const SEAM_CROSSFADE_MS = 90;

export const FS_MIN_SAMPLE_SIZE = 50;

export const GENERATION_PROVIDERS = ['mock', 'fal', 'minimax', 'openart'] as const;

/** Continuous weekly broadcast standard */
export const FULL_BROADCAST_DURATION_SEC = 15;
export const FULL_BROADCAST_SILENT_HOLD_MIN_SEC = 5;
export const FULL_BROADCAST_MAX_SPOKEN_SEC = 8;

export const DEFAULT_FAL_VIDEO_MODEL =
  process.env.SLAY_FORECAST_FAL_VIDEO_MODEL?.trim() ||
  'fal-ai/kling-video/v3/pro/image-to-video';

export const MOCK_OPENING_PLACEHOLDER =
  '/assets/lounge/slay-forecast/mock-opening.mp4';
export const MOCK_CLOSING_PLACEHOLDER =
  '/assets/lounge/slay-forecast/mock-closing.mp4';
