/** Must match `LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT` in `api/_lib/liveTryOnOverlay.ts`. */
export const LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT = 'hair-v4-on-model';

/**
 * Legacy spike URLs (full mannequin — do not use for live camera try-on).
 */
export type LiveTryOnWigView = 'left' | 'front' | 'right';

export const LIVE_TRY_ON_SPIKE_WIG_URLS: Record<LiveTryOnWigView, string> = {
  left: '/assets/natural left.png',
  front: '/assets/natural front.png',
  right: '/assets/natural right.png',
};

export const LIVE_TRY_ON_ROUTE = '/tools/live-try-on';

/** MediaPipe WASM + model CDN (spike; pin version in production). */
export const LIVE_TRY_ON_MEDIAPIPE_WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm';

export const LIVE_TRY_ON_FACE_LANDMARKER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
