import type React from 'react';

import { FINAL_LOUNGE_BACKGROUND_SRC } from './finalLobbySceneAssets';

export type LoungeTvAnimationDirection = 'forward' | 'reverse';

const FINAL_LP_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

/** Seedance lounge TV open clip (curtains, TV grow, hand, static). */
export const LOUNGE_TV_ANIMATION_VIDEO_REMOTE = `${FINAL_LP_BASE}/video.mov`;

export const LOUNGE_TV_ANIMATION_VIDEO_VERSION = 'final-lp-video-crop-v1';

/** Bundled fallback when present (`public/assets/lounge-tv-animation.mov`). */
export const LOUNGE_TV_ANIMATION_VIDEO_SRC = `/assets/lounge-tv-animation.mov?v=${LOUNGE_TV_ANIMATION_VIDEO_VERSION}`;

/**
 * Extra vertical zoom on the open/close clip if letterbox remains (1 = none).
 * Prefer `npm run lounge:bake-tv-animation-crop` — do not combine large scale with baked crop.
 */
export const LOUNGE_TV_ANIMATION_LETTERBOX_CROP_SCALE = 1;

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
