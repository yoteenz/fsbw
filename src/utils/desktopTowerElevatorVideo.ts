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

/** Resolve once the warmed elevator clip can play (blob or remote). */
export function waitForDesktopTowerElevatorVideoReady(
  timeoutMs = 3500,
): Promise<boolean> {
  if (typeof document === 'undefined') return Promise.resolve(false);

  warmDesktopTowerElevatorVideo();

  return new Promise((resolve) => {
    const el = warmVideoEl;
    if (!el) {
      resolve(false);
      return;
    }

    const finish = (ready: boolean) => {
      cleanup();
      resolve(ready);
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      el.removeEventListener('canplaythrough', onReady);
      el.removeEventListener('canplay', onReady);
    };

    const onReady = () => {
      if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        finish(true);
      }
    };

    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      finish(true);
      return;
    }

    el.addEventListener('canplaythrough', onReady);
    el.addEventListener('canplay', onReady);

    const timer = window.setTimeout(() => finish(false), timeoutMs);
  });
}

/** Always play forward — reverse playbackRate glitches/stutters in most browsers. */
function applyElevatorVideoDirection(video: HTMLVideoElement, direction: TowerTravelDirection): void {
  video.playbackRate = 1;
  video.classList.toggle('desktop-tower-elevator__shell-media--reverse-fallback', direction === 'down');
}

/** Attach listeners and attempt muted autoplay for the overlay video element. */
export function bindDesktopTowerElevatorVideoPlayback(
  video: HTMLVideoElement,
  direction: TowerTravelDirection,
  onPlaying: () => void,
  onFailed: () => void,
): () => void {
  let cancelled = false;
  let started = false;

  const tryPlay = () => {
    if (cancelled || started) return;
    applyElevatorVideoDirection(video, direction);

    const attempt = video.play();
    if (attempt && typeof attempt.then === 'function') {
      void attempt
        .then(() => {
          if (cancelled) return;
          started = true;
          onPlaying();
        })
        .catch(() => {
          if (!cancelled) onFailed();
        });
    } else if (!cancelled) {
      started = true;
      onPlaying();
    }
  };

  const onCanPlay = () => tryPlay();
  const onLoadedMetadata = () => {
    if (!started && video.currentTime > 0.05) {
      video.currentTime = 0;
    }
    applyElevatorVideoDirection(video, direction);
  };
  const onPlayingEvent = () => {
    if (!started) {
      started = true;
      onPlaying();
    }
  };

  video.addEventListener('canplay', onCanPlay);
  video.addEventListener('loadedmetadata', onLoadedMetadata);
  video.addEventListener('playing', onPlayingEvent);

  const targetSrc = resolvePlayableSrc();
  if (video.src !== targetSrc) {
    video.src = targetSrc;
    video.load();
  } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    tryPlay();
  }

  return () => {
    cancelled = true;
    video.removeEventListener('canplay', onCanPlay);
    video.removeEventListener('loadedmetadata', onLoadedMetadata);
    video.removeEventListener('playing', onPlayingEvent);
    video.pause();
    video.playbackRate = 1;
    video.loop = false;
    video.classList.remove('desktop-tower-elevator__shell-media--reverse-fallback');
  };
}
