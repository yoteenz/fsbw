/** Boot-critical loader media — same-origin, versioned, independent of ASSTS API. */

export const SITE00_LOADER_ASSET_VERSION = 'v1';

export const SITE00_LOADER_ASSET_BASE = `/site00/loader/${SITE00_LOADER_ASSET_VERSION}`;

export const SITE00_LOADER_BACKGROUND_FILE = 'assts-loader-background-v1.png';
export const SITE00_LOADER_GEOMETRY_WEBM_FILE = 'assts-loader-geometry-v1-alpha.webm';
export const SITE00_LOADER_GEOMETRY_APNG_FILE = 'assts-loader-geometry-v1-alpha.apng';

export function site00LoaderBackgroundUrl(): string {
  return `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_BACKGROUND_FILE}`;
}

export function site00LoaderGeometryWebmUrl(): string {
  return `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_GEOMETRY_WEBM_FILE}`;
}

export function site00LoaderGeometryApngUrl(): string {
  return `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_GEOMETRY_APNG_FILE}`;
}

/** iOS Safari — WebM alpha is unreliable; use transcoded APNG with true alpha. */
export function site00LoaderPrefersApngGeometry(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) return false;
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/i.test(ua);
}

export type Site00GeometryAnchor = {
  /** Normalized horizontal center (0–100). */
  xPercent: number;
  /** Platform center line from top of stage (0–100). */
  yPercent: number;
  /** Geometry width as % of stage width. */
  widthPercent: number;
  /** Bottom-align geometry foundation to platform center. */
  translateYPercent: number;
};

export const ASSTS_LOADER_GEOMETRY_ANCHOR: Site00GeometryAnchor = {
  xPercent: 50,
  yPercent: 58,
  widthPercent: 38,
  translateYPercent: 100,
};
