/** Lounge TV policy — previews, loops, and autoplay must never hijack the user's audio session. */
export function applyLoungeTvMutedPlayback(video: HTMLVideoElement): void {
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.setAttribute('muted', '');
}

/** Autoplay helper — always silent (browser-safe + does not duck external music when muted). */
export function playLoungeTvMuted(video: HTMLVideoElement): Promise<void> {
  applyLoungeTvMutedPlayback(video);
  return video.play();
}

export function pauseLoungeTvVideo(video: HTMLVideoElement | null | undefined): void {
  if (!video) return;
  video.pause();
  applyLoungeTvMutedPlayback(video);
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
