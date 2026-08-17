/** Loader composition helpers — debug flags only (geometry map lives in loader-composition-map.ts). */

export function isLoaderDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('loaderDebug') === '1';
}

export function isLoaderRefMapEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('loaderRefMap') === '1';
}
