const FINAL_LP_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

/** Seedance lounge TV open clip (curtains, TV grow, hand, static). */
export const LOUNGE_TV_ANIMATION_VIDEO_REMOTE = `${FINAL_LP_BASE}/video.mov`;

export const LOUNGE_TV_ANIMATION_VIDEO_VERSION = 'final-lp-video-mov-1';

/** Bundled fallback when present (`public/assets/lounge-tv-animation.mov`). */
export const LOUNGE_TV_ANIMATION_VIDEO_SRC = `/assets/lounge-tv-animation.mov?v=${LOUNGE_TV_ANIMATION_VIDEO_VERSION}`;

/** Reverse close uses forward clip + negative playback (same as lobby/lounge room transition). */
export const LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE = 2;

/** When true, open/close use `video.mov` instead of CSS curtains/hand/grow. */
export const LOUNGE_TV_ANIMATION_VIDEO_ENABLED = true;

export function loungeTvAnimationVideoSrc(): string {
  return LOUNGE_TV_ANIMATION_VIDEO_SRC;
}
