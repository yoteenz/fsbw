/** Geometry compositing strategy — screen (original OpenArt) vs true-alpha derivative. */

export type LoaderGeometryMode = 'screen' | 'alpha';

export function resolveLoaderGeometryMode(): LoaderGeometryMode {
  if (typeof window === 'undefined') return 'screen';
  const forced = new URLSearchParams(window.location.search).get('loaderGeometry');
  if (forced === 'alpha' || forced === 'screen') return forced;
  return 'screen';
}
