export type PageLoadReadinessOptions = {
  container?: HTMLElement | null;
  imageUrls?: readonly string[];
  /** When true, wait for `<img>` elements inside `container` to finish (off by default — lobby/lounge has hundreds). */
  scanContainerImages?: boolean;
  /** Minimum time the loading screen stays visible (avoids flash). */
  minMs?: number;
  /** Hard cap — never block longer than this (keep below LoadingScreen DEFAULT_MAX_LOADING_MS). */
  maxMs?: number;
};

/** Marble background shared across Build-a-Wig pages (CSS background-image, not `<img>`). */
export const BAW_MARBLE_BACKGROUND_SRC = '/assets/marble-half.png';

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function preloadImage(url: string): Promise<void> {
  if (!url || typeof window === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
    img.src = url;
    if (img.complete) {
      if (img.decode) void img.decode().then(done).catch(done);
      else done();
    }
  });
}

export function preloadImages(urls: readonly string[]): Promise<void> {
  const unique = [...new Set(urls.filter(Boolean))];
  return Promise.all(unique.map(preloadImage)).then(() => undefined);
}

export async function waitForFontsReady(): Promise<void> {
  try {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready;
    }
  } catch {
    /* non-fatal */
  }
}

function getPendingImages(container: HTMLElement): HTMLImageElement[] {
  return Array.from(container.querySelectorAll<HTMLImageElement>('img[src]')).filter(
    (img) => !img.complete || img.naturalWidth === 0,
  );
}

function waitForImageElement(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) {
    return img.decode?.().catch(() => undefined) ?? Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => {
      void (img.decode?.().catch(() => undefined) ?? Promise.resolve()).then(() => resolve());
    };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });
}

/**
 * Wait until explicit assets, fonts, and in-DOM images are ready (or maxMs elapses).
 * Used by page-level loading GIF gates — not arbitrary fixed timeouts.
 */
export async function waitForPageLoadReadiness(options: PageLoadReadinessOptions = {}): Promise<void> {
  const {
    container,
    imageUrls = [],
    scanContainerImages = false,
    minMs = 600,
    maxMs = 10_000,
  } = options;
  const started = Date.now();
  const deadline = started + maxMs;
  const timeLeft = () => Math.max(0, deadline - Date.now());

  await Promise.race([
    Promise.all([preloadImages(imageUrls), waitForFontsReady()]),
    delay(timeLeft()),
  ]);

  const minRemaining = minMs - (Date.now() - started);
  if (minRemaining > 0) {
    await delay(Math.min(minRemaining, timeLeft()));
  }

  if (container && scanContainerImages) {
    let stablePasses = 0;
    while (Date.now() < deadline && stablePasses < 2) {
      const pending = getPendingImages(container);
      if (pending.length === 0) {
        stablePasses += 1;
        await delay(Math.min(80, timeLeft()));
        continue;
      }
      stablePasses = 0;
      await Promise.race([Promise.all(pending.map(waitForImageElement)), delay(timeLeft())]);
    }
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}
