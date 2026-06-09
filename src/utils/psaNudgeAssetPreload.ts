import { PSA_NUDGE_BUBBLE_SRC } from '../constants/psaConfig';

let bubblePreload: Promise<void> | null = null;

/** Decode PSA thought-bubble art before showing proactive nudge copy (avoids broken layout on SPA nav). */
export function preloadPsaNudgeBubble(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!bubblePreload) {
    bubblePreload = new Promise((resolve) => {
      const img = new Image();
      const done = () => resolve();
      img.onload = done;
      img.onerror = done;
      img.src = PSA_NUDGE_BUBBLE_SRC;
      if (img.decode) {
        void img.decode().then(done).catch(done);
      } else if (img.complete) {
        done();
      }
    });
  }
  return bubblePreload;
}

let fontsPreload: Promise<void> | null = null;

/** Bohemy headline on nudge chip — preload so SPA routes match post-refresh typography. */
export function preloadPsaNudgeFonts(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!fontsPreload) {
    fontsPreload = (async () => {
      try {
        if (document.fonts?.load) {
          await Promise.all([
            document.fonts.load('16px Bohemy'),
            document.fonts.load('16px "Futura PT Demi"'),
            document.fonts.load('11px Bohemy'),
            document.fonts.load('5px "Futura PT Demi"'),
          ]);
          await document.fonts.ready;
        }
      } catch {
        /* non-fatal */
      }
    })();
  }
  return fontsPreload;
}

export function preloadPsaNudgeAssets(): Promise<void> {
  return Promise.all([preloadPsaNudgeBubble(), preloadPsaNudgeFonts()]).then(() => undefined);
}
