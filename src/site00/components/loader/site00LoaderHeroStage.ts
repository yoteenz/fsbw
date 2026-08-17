/** Loader composition helpers — debug flags only (geometry map lives in loader-composition-map.ts). */

function loaderSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function isLoaderDebugEnabled(): boolean {
  return loaderSearchParams().get('loaderDebug') === '1';
}

export function isLoaderRefMapEnabled(): boolean {
  const params = loaderSearchParams();
  return params.get('loaderRefMap') === '1' || params.get('loaderDebug') === '1';
}

/** Dev-only — overlay approved reference artwork at ~50% opacity on the artboard. */
export function isLoaderRefOverlayEnabled(): boolean {
  const params = loaderSearchParams();
  return params.get('loaderRefOverlay') === '1' || params.get('loaderDebug') === '1';
}
