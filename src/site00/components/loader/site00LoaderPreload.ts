type PreloadState = {
  backgrounds: Map<string, Promise<void>>;
  animations: Map<string, Promise<void>>;
};

const cache: PreloadState = {
  backgrounds: new Map(),
  animations: new Map(),
};

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function preloadVideo(url: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.volume = 0;
    video.playsInline = true;
    const done = () => resolve();
    video.addEventListener('canplaythrough', done, { once: true });
    video.addEventListener('error', done, { once: true });
    video.src = url;
    video.load();
  });
}

function preloadApng(url: string): Promise<void> {
  return preloadImage(url);
}

export function preloadSite00LoaderBackground(url: string): Promise<void> {
  let pending = cache.backgrounds.get(url);
  if (!pending) {
    pending = preloadImage(url);
    cache.backgrounds.set(url, pending);
  }
  return pending;
}

export function preloadSite00LoaderAnimation(url: string): Promise<void> {
  let pending = cache.animations.get(url);
  if (!pending) {
    pending = url.endsWith('.apng') ? preloadApng(url) : preloadVideo(url);
    cache.animations.set(url, pending);
  }
  return pending;
}

export function preloadSite00LoaderAssets(backgroundUrl: string, animationUrl: string): Promise<void> {
  return Promise.all([
    preloadSite00LoaderBackground(backgroundUrl),
    preloadSite00LoaderAnimation(animationUrl),
  ]).then(() => undefined);
}
