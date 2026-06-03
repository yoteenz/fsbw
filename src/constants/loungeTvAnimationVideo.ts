import type React from 'react';

import { LOUNGE_TV_CONTENT_FRAME_SRC } from '../components/lounge/loungeTvAssets';

export type LoungeTvAnimationDirection = 'forward' | 'reverse';

const FINAL_LP_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

/**
 * Uncropped Supabase original — do **not** use as a `<video><source>` (reintroduces letterbox).
 * Re-bake with `npm run lounge:bake-tv-animation-crop`; upload replacement to Supabase when ready.
 */
export const LOUNGE_TV_ANIMATION_VIDEO_REMOTE = `${FINAL_LP_BASE}/video.mov`;

export const LOUNGE_TV_ANIMATION_VIDEO_VERSION = 'final-lp-video-full-letterbox-v3';

/** Native Seedance export (720×1280) — full frame, no ffmpeg crop / CSS zoom. */
export const LOUNGE_TV_ANIMATION_VIDEO_WIDTH = 720;
export const LOUNGE_TV_ANIMATION_VIDEO_HEIGHT = 1280;

/** Full uncropped clip (H.264 + MOV). */
export const LOUNGE_TV_ANIMATION_VIDEO_SRC = `/assets/lounge-tv-animation-full.mp4?v=${LOUNGE_TV_ANIMATION_VIDEO_VERSION}`;

export const LOUNGE_TV_ANIMATION_VIDEO_SRC_MOV = `/assets/lounge-tv-animation-source-letterbox.mov?v=${LOUNGE_TV_ANIMATION_VIDEO_VERSION}`;

/** @deprecated Cropped bake — do not use as primary `<source>` (hides edges). */
export const LOUNGE_TV_ANIMATION_VIDEO_SRC_CROPPED = `/assets/lounge-tv-animation.mp4?v=final-lp-video-crop-v2`;

/** Extra transparent band (px) split above/below frame — masks play settle. */
export const LOUNGE_TV_ANIMATION_LETTERBOX_BOUNCE_PAD_PX = 16;

/**
 * Open: `cover` + `center top` to match the lounge carousel slide under the overlay.
 * Close (reverse): `contain` so the full theater frame stays visible.
 */
export function loungeTvAnimationMediaLayerStyle(
  direction: LoungeTvAnimationDirection = 'forward',
): React.CSSProperties {
  const opening = direction === 'forward';
  return {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: opening ? 'cover' : 'contain',
    objectPosition: opening ? 'center top' : 'center center',
    pointerEvents: 'none',
  };
}

export function loungeTvAnimationLetterboxShellStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  };
}

export function loungeTvAnimationLetterboxTopBandStyle(heightPx: number): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: `${heightPx}px`,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  };
}

export function loungeTvAnimationLetterboxBottomBandStyle(heightPx: number): React.CSSProperties {
  return {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: `${heightPx}px`,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  };
}

export function loungeTvAnimationFrameStyle(layout: {
  frameWidth: number;
  frameHeight: number;
  topBandPx: number;
}): React.CSSProperties {
  return {
    position: 'absolute',
    top: `${layout.topBandPx}px`,
    left: '50%',
    width: `${layout.frameWidth}px`,
    height: `${layout.frameHeight}px`,
    maxWidth: '100vw',
    transform: 'translateX(-50%)',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  };
}

/** Full-viewport lounge poster while clip loads (original `center top` cover). */
export function loungeTvAnimationFullBleedPosterStyle(posterSrc: string): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${posterSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
  };
}

export function loungeTvAnimationPosterInFrameStyle(
  posterSrc: string,
  direction: LoungeTvAnimationDirection,
): React.CSSProperties {
  const opening = direction === 'forward';
  return {
    ...loungeTvAnimationMediaLayerStyle(direction),
    backgroundImage: `url(${posterSrc})`,
    backgroundSize: opening ? 'cover' : 'contain',
    backgroundPosition: opening ? 'center top' : 'center center',
    backgroundRepeat: 'no-repeat',
  };
}

/** @deprecated Use {@link LOUNGE_TV_ANIMATION_LETTERBOX_BOUNCE_PAD_PX} — no CSS scale zoom. */
export const LOUNGE_TV_ANIMATION_LETTERBOX_CROP_SCALE = 1;

/** Reverse close — RAF step-back speed (lower = slower; was 2, eased for less rushed close). */
export const LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE = 1.5;

/** When true, open/close use `video.mov` instead of CSS curtains/hand/grow. */
export const LOUNGE_TV_ANIMATION_VIDEO_ENABLED = true;

export function loungeTvAnimationVideoSrc(): string {
  return LOUNGE_TV_ANIMATION_VIDEO_SRC;
}

/**
 * Pre-play placeholder — forward: none (lounge carousel shows through until frame 0).
 * Reverse: theater end-still (matches {@link LoungeTvFullscreenShell}).
 */
export function loungeTvAnimationPosterSrc(direction: LoungeTvAnimationDirection): string | null {
  return direction === 'forward' ? null : LOUNGE_TV_CONTENT_FRAME_SRC;
}
