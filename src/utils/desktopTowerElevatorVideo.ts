import { DESKTOP_TOWER_ELEVATOR_VIDEO_URL } from '../constants/desktopTowerEnv';
import type { TowerTravelDirection } from '../constants/desktopTowerMotion';

let warmVideoEl: HTMLVideoElement | null = null;
let cachedBlobUrl: string | null = null;
let blobFetchPromise: Promise<string> | null = null;

function resolvePlayableSrc(): string {
  return cachedBlobUrl ?? DESKTOP_TOWER_ELEVATOR_VIDEO_URL;
}

/** Begin buffering the elevator MP4 as soon as the desktop tower is active. */
export function warmDesktopTowerElevatorVideo(): void {
  if (typeof document === 'undefined') return;

  if (!warmVideoEl) {
    warmVideoEl = document.createElement('video');
    warmVideoEl.muted = true;
    warmVideoEl.playsInline = true;
    warmVideoEl.preload = 'auto';
    warmVideoEl.setAttribute('webkit-playsinline', 'true');
    warmVideoEl.style.position = 'fixed';
    warmVideoEl.style.width = '0';
    warmVideoEl.style.height = '0';
    warmVideoEl.style.opacity = '0';
    warmVideoEl.style.pointerEvents = 'none';
    warmVideoEl.style.left = '-9999px';
    document.body.appendChild(warmVideoEl);
  }

  const src = resolvePlayableSrc();
  if (warmVideoEl.getAttribute('src') !== src) {
    warmVideoEl.setAttribute('src', src);
    warmVideoEl.load();
  }

  if (!blobFetchPromise) {
    blobFetchPromise = fetch(DESKTOP_TOWER_ELEVATOR_VIDEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`elevator video fetch ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cachedBlobUrl) URL.revokeObjectURL(cachedBlobUrl);
        cachedBlobUrl = URL.createObjectURL(blob);
        if (warmVideoEl) {
          warmVideoEl.setAttribute('src', cachedBlobUrl);
          warmVideoEl.load();
        }
        return cachedBlobUrl;
      })
      .catch(() => DESKTOP_TOWER_ELEVATOR_VIDEO_URL);
  }
}

export function getDesktopTowerElevatorVideoSrc(): string {
  return resolvePlayableSrc();
}

function supportsReversePlayback(video: HTMLVideoElement): boolean {
  const previousRate = video.playbackRate;
  video.playbackRate = -1;
  const supported = video.playbackRate === -1;
  video.playbackRate = previousRate;
  return supported;
}

function applyElevatorVideoDirection(video: HTMLVideoElement, direction: TowerTravelDirection): void {
  video.classList.remove('desktop-tower-elevator__shell-media--reverse-fallback');
  video.style.transform = '';

  if (direction === 'down' && supportsReversePlayback(video)) {
    video.playbackRate = -1;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Math.max(0, video.duration - 0.05);
    }
    return;
  }

  video.playbackRate = 1;
  video.currentTime = 0;

  if (direction === 'down') {
    video.classList.add('desktop-tower-elevator__shell-media--reverse-fallback');
  }
}

/** Attach listeners and attempt muted autoplay for the overlay video element. */
export function bindDesktopTowerElevatorVideoPlayback(
  video: HTMLVideoElement,
  direction: TowerTravelDirection,
  onPlaying: () => void,
  onFailed: () => void,
): () => void {
  let cancelled = false;

  const tryPlay = () => {
    if (cancelled) return;
    applyElevatorVideoDirection(video, direction);

    const attempt = video.play();
    if (attempt && typeof attempt.then === 'function') {
      void attempt
        .then(() => {
          if (!cancelled) onPlaying();
        })
        .catch(() => {
          if (!cancelled) onFailed();
        });
    }
  };

  const onCanPlay = () => tryPlay();
  const onLoadedMetadata = () => {
    if (direction === 'down') {
      applyElevatorVideoDirection(video, direction);
    }
  };
  const onPlayingEvent = () => onPlaying();

  video.addEventListener('canplay', onCanPlay);
  video.addEventListener('loadedmetadata', onLoadedMetadata);
  video.addEventListener('playing', onPlayingEvent);

  const targetSrc = resolvePlayableSrc();
  video.src = targetSrc;
  video.load();

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    tryPlay();
  }

  return () => {
    cancelled = true;
    video.removeEventListener('canplay', onCanPlay);
    video.removeEventListener('loadedmetadata', onLoadedMetadata);
    video.removeEventListener('playing', onPlayingEvent);
    video.pause();
    video.playbackRate = 1;
    video.classList.remove('desktop-tower-elevator__shell-media--reverse-fallback');
    video.style.transform = '';
  };
}
