import type React from 'react';

import { FINAL_LOUNGE_BACKGROUND_SRC } from './finalLobbySceneAssets';

export type LoungeTvAnimationDirection = 'forward' | 'reverse';

const FINAL_LP_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

/**
 * Uncropped Supabase original — do **not** use as a `<video><source>` (reintroduces letterbox).
 * Re-bake with `npm run lounge:bake-tv-animation-crop`; upload replacement to Supabase when ready.
 */
export const LOUNGE_TV_ANIMATION_VIDEO_REMOTE = `${FINAL_LP_BASE}/video.mov`;

export const LOUNGE_TV_ANIMATION_VIDEO_VERSION = 'final-lp-video-crop-v2';

/** Primary bundled clip (cropped). Prefer MP4; MOV kept for Safari fallback. */
export const LOUNGE_TV_ANIMATION_VIDEO_SRC = `/assets/lounge-tv-animation.mp4?v=${LOUNGE_TV_ANIMATION_VIDEO_VERSION}`;

export const LOUNGE_TV_ANIMATION_VIDEO_SRC_MOV = `/assets/lounge-tv-animation.mov?v=${LOUNGE_TV_ANIMATION_VIDEO_VERSION}`;

/**
 * Extra vertical zoom if letterbox remains after bake (1 = none).
 * Do not stack with aggressive ffmpeg crop unless QA needs a small nudge.
 */
export const LOUNGE_TV_ANIMATION_LETTERBOX_CROP_SCALE = 1.08;

/** Full-bleed layer for {@link LoungeTvAnimationVideo} — tune crop via bake script + scale above. */
export function loungeTvAnimationMediaLayerStyle(): React.CSSProperties {
  const scale = LOUNGE_TV_ANIMATION_LETTERBOX_CROP_SCALE;
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    transform: scale > 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'center center',
    pointerEvents: 'none',
  };
}

/** Reverse close uses forward clip + negative playback (same as lobby/lounge room transition). */
export const LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE = 2;

/** When true, open/close use `video.mov` instead of CSS curtains/hand/grow. */
export const LOUNGE_TV_ANIMATION_VIDEO_ENABLED = true;

export function loungeTvAnimationVideoSrc(): string {
  return LOUNGE_TV_ANIMATION_VIDEO_SRC;
}

/**
 * Pre-play placeholder for the Seedance clip — not the end-still (that frame includes the hand).
 * Forward: lounge composite; reverse: none (black until frames play).
 */
export function loungeTvAnimationPosterSrc(direction: LoungeTvAnimationDirection): string | null {
  return direction === 'forward' ? FINAL_LOUNGE_BACKGROUND_SRC : null;
}
