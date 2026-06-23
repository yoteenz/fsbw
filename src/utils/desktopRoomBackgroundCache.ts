let lastDisplayedSrc: string | null = null;
const loadedSrcs = new Set<string>();

export function getLastDesktopRoomBackground(): string | null {
  return lastDisplayedSrc;
}

export function setLastDesktopRoomBackground(src: string): void {
  lastDisplayedSrc = src;
  loadedSrcs.add(src);
}

export function isDesktopRoomBackgroundLoaded(src: string): boolean {
  return loadedSrcs.has(src);
}

export function preloadDesktopRoomBackground(
  src: string,
  fallbackSrc?: string,
): Promise<string> {
  if (loadedSrcs.has(src)) return Promise.resolve(src);
  if (typeof Image === 'undefined') return Promise.resolve(src);

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      loadedSrcs.add(src);
      resolve(src);
    };

    img.onerror = () => {
      if (fallbackSrc && fallbackSrc !== src) {
        void preloadDesktopRoomBackground(fallbackSrc).then(resolve);
        return;
      }
      resolve(src);
    };

    img.src = src;
  });
}
