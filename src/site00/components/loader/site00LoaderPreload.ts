type PreloadState = {
  background?: Promise<void>;
  animation?: Promise<void>;
};

const cache: PreloadState = {};

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

export function preloadSite00LoaderBackground(url: string): Promise<void> {
  if (!cache.background) cache.background = preloadImage(url);
  return cache.background;
}

export function preloadSite00LoaderAnimation(url: string): Promise<void> {
  if (!cache.animation) cache.animation = preloadVideo(url);
  return cache.animation;
}

export function preloadSite00LoaderAssets(backgroundUrl: string, animationUrl: string): Promise<void> {
  return Promise.all([
    preloadSite00LoaderBackground(backgroundUrl),
    preloadSite00LoaderAnimation(animationUrl),
  ]).then(() => undefined);
}
