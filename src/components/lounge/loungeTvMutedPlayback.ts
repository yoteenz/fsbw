/** Attribute — decorative motion loops must never join the audio-capable media path. */
export const LOUNGE_TV_DECORATIVE_MOTION_ATTR = 'data-lounge-tv-decorative-motion';

type VideoWithOptionalAudioTracks = HTMLVideoElement & {
  audioTracks?: { length: number; [index: number]: { enabled: boolean } };
  mozHasAudio?: boolean;
  webkitAudioDecodedByteCount?: number;
};

/** True when the element is a silent decorative loop (mastery focus motion, rail previews, etc.). */
export function isLoungeTvDecorativeMotionVideo(
  video: HTMLVideoElement | null | undefined,
): boolean {
  if (!video) return false;
  return video.getAttribute(LOUNGE_TV_DECORATIVE_MOTION_ATTR) === 'true';
}

/** App-level guard — only user-facing watch/learn players may expose audio controls. */
export function loungeTvVideoMayPlayUserAudio(video: HTMLVideoElement | null | undefined): boolean {
  if (!video) return false;
  return !isLoungeTvDecorativeMotionVideo(video);
}

export function markLoungeTvDecorativeMotion(video: HTMLVideoElement): void {
  video.setAttribute(LOUNGE_TV_DECORATIVE_MOTION_ATTR, 'true');
}

function disableEmbeddedAudioTracks(video: HTMLVideoElement): void {
  const tracks = (video as VideoWithOptionalAudioTracks).audioTracks;
  if (!tracks?.length) return;
  for (let i = 0; i < tracks.length; i += 1) {
    tracks[i].enabled = false;
  }
}

function clearMediaSessionPlaybackState(): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.playbackState = 'none';
    navigator.mediaSession.metadata = null;
  } catch {
    /* best-effort — decorative loops must not register as Now Playing */
  }
}

/** Lounge TV policy — previews, loops, and autoplay must never hijack the user's audio session. */
export function applyLoungeTvMutedPlayback(video: HTMLVideoElement): void {
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.setAttribute('muted', '');
}

/**
 * Decorative motion — muted loops with no audio pathway.
 * Marks the element so unmute / soundtrack logic never treats it as music-capable.
 */
export function applyLoungeTvDecorativeMotionPlayback(video: HTMLVideoElement): void {
  markLoungeTvDecorativeMotion(video);
  applyLoungeTvMutedPlayback(video);
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.disablePictureInPicture = true;
  video.disableRemotePlayback = true;
  video.setAttribute('disablePictureInPicture', '');
  video.setAttribute('disableRemotePlayback', '');
  video.removeAttribute('controls');
  disableEmbeddedAudioTracks(video);
  clearMediaSessionPlaybackState();
}

/** Autoplay helper — always silent (browser-safe + does not duck external music when muted). */
export function playLoungeTvMuted(video: HTMLVideoElement): Promise<void> {
  if (isLoungeTvDecorativeMotionVideo(video)) {
    return playLoungeTvDecorativeMotion(video);
  }
  applyLoungeTvMutedPlayback(video);
  return video.play();
}

/** Play a decorative motion loop — animation only, never audio-capable in app logic. */
export function playLoungeTvDecorativeMotion(video: HTMLVideoElement): Promise<void> {
  applyLoungeTvDecorativeMotionPlayback(video);
  disableEmbeddedAudioTracks(video);
  clearMediaSessionPlaybackState();
  return video.play().finally(() => {
    applyLoungeTvDecorativeMotionPlayback(video);
    disableEmbeddedAudioTracks(video);
    clearMediaSessionPlaybackState();
  });
}

export function pauseLoungeTvVideo(video: HTMLVideoElement | null | undefined): void {
  if (!video) return;
  video.pause();
  if (isLoungeTvDecorativeMotionVideo(video)) {
    applyLoungeTvDecorativeMotionPlayback(video);
  } else {
    applyLoungeTvMutedPlayback(video);
  }
}

/** Pause every in-TV `<video>` (glass shell, screen root, and rail descendants). */
export function pauseAllLoungeTvVideos(root: ParentNode = document): void {
  if (typeof document === 'undefined') return;
  const selectors = [
    '[data-lounge-tv-glass] video',
    '.lounge-tv-screen-root video',
    '[data-lounge-tv-rail] video',
  ].join(', ');
  root.querySelectorAll<HTMLVideoElement>(selectors).forEach((el) => {
    pauseLoungeTvVideo(el);
  });
}

/** Stop all in-TV browse previews (tab switch, overlay close, background). */
export function pauseLoungeTvBrowseMedia(): void {
  pauseAllLoungeTvVideos();
}
