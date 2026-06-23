import {
  DESKTOP_TOWER_ELEVATOR_VIDEO_URL,
} from '../constants/desktopTowerEnv';
import type { TowerTravelDirection } from '../constants/desktopTowerMotion';

/**
 * Optional pre-reversed MP4 (same source clip, reversed at build time).
 * When reverse scrubbing is choppy, playback falls back to this asset played forward.
 */
export const DESKTOP_TOWER_ELEVATOR_VIDEO_REVERSE_URL: string | null = null;

let warmVideoEl: HTMLVideoElement | null = null;
let cachedBlobUrl: string | null = null;
let blobFetchPromise: Promise<string> | null = null;
let cachedDurationSec: number | null = null;

let activePlaybackCancel: (() => void) | null = null;

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => void,
  ) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

function resolvePlayableSrc(): string {
  return cachedBlobUrl ?? DESKTOP_TOWER_ELEVATOR_VIDEO_URL;
}

function rememberDuration(video: HTMLVideoElement): void {
  if (Number.isFinite(video.duration) && video.duration > 0) {
    cachedDurationSec = video.duration;
  }
}

function scheduleFrame(video: HTMLVideoElement, callback: (now: number) => void): number {
  const videoWithRvfc = video as VideoWithFrameCallback;
  if (typeof videoWithRvfc.requestVideoFrameCallback === 'function') {
    return videoWithRvfc.requestVideoFrameCallback((now) => callback(now));
  }
  return requestAnimationFrame(callback);
}

function cancelFrame(video: HTMLVideoElement, handle: number): void {
  const videoWithRvfc = video as VideoWithFrameCallback;
  if (typeof videoWithRvfc.cancelVideoFrameCallback === 'function') {
    videoWithRvfc.cancelVideoFrameCallback(handle);
    return;
  }
  cancelAnimationFrame(handle);
}

function waitForVideoEvent(video: HTMLVideoElement, event: keyof HTMLMediaElementEventMap): Promise<void> {
  return new Promise((resolve) => {
    if (event === 'loadedmetadata' && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      resolve();
      return;
    }
    if (event === 'canplaythrough' && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve();
      return;
    }
    const onEvent = () => {
      video.removeEventListener(event, onEvent);
      resolve();
    };
    video.addEventListener(event, onEvent, { once: true });
  });
}

function ensureVideoSrc(video: HTMLVideoElement, src: string): Promise<void> {
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('webkit-playsinline', 'true');
  video.preload = 'auto';
  video.loop = false;
  video.playbackRate = 1;

  if (video.getAttribute('src') === src && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    rememberDuration(video);
    return Promise.resolve();
  }

  video.src = src;
  video.load();
  return waitForVideoEvent(video, 'loadedmetadata').then(() => {
    rememberDuration(video);
  });
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

  warmVideoEl.addEventListener(
    'loadedmetadata',
    () => {
      if (warmVideoEl) rememberDuration(warmVideoEl);
    },
    { once: true },
  );

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

export function getDesktopTowerElevatorVideoDurationSec(): number | null {
  if (cachedDurationSec && cachedDurationSec > 0) return cachedDurationSec;
  if (warmVideoEl && Number.isFinite(warmVideoEl.duration) && warmVideoEl.duration > 0) {
    cachedDurationSec = warmVideoEl.duration;
    return cachedDurationSec;
  }
  return null;
}

/** Resolve once the warmed elevator clip is decoded enough to play. */
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
      if (ready) rememberDuration(el);
      resolve(ready);
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      el.removeEventListener('canplaythrough', onReady);
      el.removeEventListener('loadedmetadata', onReady);
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
    el.addEventListener('loadedmetadata', onReady);

    const timer = window.setTimeout(() => finish(false), timeoutMs);
  });
}

export function cancelElevatorVideoTransition(video?: HTMLVideoElement | null): void {
  activePlaybackCancel?.();
  activePlaybackCancel = null;
  if (video) {
    video.pause();
    video.playbackRate = 1;
    video.loop = false;
  }
}

function playElevatorVideoForward(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    let frameHandle = 0;
    let cancelled = false;

    const cleanup = () => {
      cancelled = true;
      video.removeEventListener('ended', onEnded);
      if (frameHandle) cancelFrame(video, frameHandle);
      activePlaybackCancel = null;
    };

    const finish = () => {
      cleanup();
      video.pause();
      resolve();
    };

    const onEnded = () => finish();

    activePlaybackCancel = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    video.pause();
    video.playbackRate = 1;
    video.loop = false;
    video.currentTime = 0;

    const start = () => {
      if (cancelled) return;
      void video
        .play()
        .then(() => {
          if (cancelled) return;
          if (video.ended) {
            finish();
            return;
          }
          video.addEventListener('ended', onEnded);
        })
        .catch(reject);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      start();
      return;
    }

    frameHandle = scheduleFrame(video, () => {
      frameHandle = 0;
      start();
    });
  });
}

function playElevatorVideoReverseScrub(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      reject(new Error('elevator video duration unavailable'));
      return;
    }

    let frameHandle = 0;
    let cancelled = false;
    let lastSeek = Number.POSITIVE_INFINITY;
    const playbackMs = duration * 1000;
    const startAt = performance.now();

    const cleanup = () => {
      cancelled = true;
      if (frameHandle) cancelFrame(video, frameHandle);
      activePlaybackCancel = null;
    };

    const finish = () => {
      cleanup();
      video.pause();
      video.currentTime = 0;
      resolve();
    };

    activePlaybackCancel = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    video.pause();
    video.playbackRate = 1;
    video.loop = false;
    video.currentTime = Math.max(0, duration - 1 / 30);

    const tick = (now: number) => {
      if (cancelled) return;

      const elapsed = now - startAt;
      const progress = Math.min(1, elapsed / playbackMs);
      const targetTime = duration * (1 - progress);

      if (Math.abs(targetTime - lastSeek) >= 1 / 60) {
        try {
          video.currentTime = Math.max(0, targetTime);
          lastSeek = targetTime;
        } catch {
          /* seek while decoding — retry next frame */
        }
      }

      if (progress >= 1) {
        finish();
        return;
      }

      frameHandle = scheduleFrame(video, tick);
    };

    frameHandle = scheduleFrame(video, tick);
  });
}

async function playElevatorVideoForwardFromSrc(
  video: HTMLVideoElement,
  src: string,
): Promise<void> {
  await ensureVideoSrc(video, src);
  await playElevatorVideoForward(video);
}

/** Run one full elevator clip — forward (up) or reverse scrub (down). */
export async function runElevatorVideoTransition(
  video: HTMLVideoElement,
  direction: TowerTravelDirection,
  lockedSrc?: string,
): Promise<void> {
  cancelElevatorVideoTransition(video);

  const src = lockedSrc ?? resolvePlayableSrc();
  await ensureVideoSrc(video, src);
  await waitForVideoEvent(video, 'canplaythrough').catch(() => undefined);

  if (direction === 'up') {
    await playElevatorVideoForward(video);
    return;
  }

  try {
    await playElevatorVideoReverseScrub(video);
  } catch (error) {
    if (DESKTOP_TOWER_ELEVATOR_VIDEO_REVERSE_URL) {
      await playElevatorVideoForwardFromSrc(video, DESKTOP_TOWER_ELEVATOR_VIDEO_REVERSE_URL);
      return;
    }
    throw error;
  }
}
