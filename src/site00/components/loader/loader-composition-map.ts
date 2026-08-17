/**
 * SITE 00 Asset Vault immersive loader — approved overlay geometry (711×1536).
 * compositionId: assts-loader-mobile-v1
 *
 * Pixel bounds are the validation baseline; runtime scales uniformly from width/711
 * (with optional height-fit cap via min(width/711, height/1536)).
 */

export const ASSTS_LOADER_COMPOSITION_ID = 'assts-loader-mobile-v1' as const;

export const ASSTS_LOADER_REFERENCE_CANVAS = {
  width: 711,
  height: 1536,
} as const;

/** Master center axis (reference px). */
export const ASSTS_LOADER_CENTER_X = 356;

export type LoaderRegionRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

export type LoaderRegionId =
  | 'background'
  | 'pedestal'
  | 'geometry'
  | 'copy.eyebrow'
  | 'copy.title'
  | 'copy.subtitle'
  | 'copy.status'
  | 'copy.progress'
  | 'copy.tagline'
  | 'copy.signature';

function rect(x: number, y: number, w: number, h: number): LoaderRegionRect {
  const { width, height } = ASSTS_LOADER_REFERENCE_CANVAS;
  return {
    x,
    y,
    w,
    h,
    nx: x / width,
    ny: y / height,
    nw: w / width,
    nh: h / height,
  };
}

/** Authoritative region map — approved Asset Vault loader v1. */
export const ASSTS_LOADER_REGIONS: Record<LoaderRegionId, LoaderRegionRect> = {
  background: rect(0, 0, 711, 1536),
  pedestal: rect(122, 687, 468, 121),
  geometry: rect(238, 209, 220, 535),
  'copy.eyebrow': rect(319, 877, 74, 20),
  'copy.title': rect(75, 914, 561, 43),
  'copy.subtitle': rect(179, 982, 354, 25),
  'copy.status': rect(289, 1095, 135, 22),
  'copy.progress': rect(76, 1138, 572, 23),
  'copy.tagline': rect(76, 1216, 572, 22),
  'copy.signature': rect(317, 1300, 78, 91),
};

/** Visible geometry bounds (may differ from encoded video padding). */
export const ASSTS_LOADER_GEOMETRY_VISIBLE = {
  top: 210,
  bottom: 744,
  left: 238,
  right: 458,
  centerX: ASSTS_LOADER_CENTER_X,
  anchorXNormalized: ASSTS_LOADER_CENTER_X / ASSTS_LOADER_REFERENCE_CANVAS.width,
  visibleBottomNormalized: 744 / ASSTS_LOADER_REFERENCE_CANVAS.height,
} as const;

/** Master vertical landmarks (reference px) for debug guides. */
export const ASSTS_LOADER_Y_LANDMARKS: { label: string; y: number }[] = [
  { label: 'GEOMETRY TOP', y: 210 },
  { label: 'PEDESTAL TOP', y: 690 },
  { label: 'GEOMETRY BOTTOM', y: 744 },
  { label: 'PEDESTAL BOTTOM', y: 805 },
  { label: 'SITE 00 EYEBROW', y: 877 },
  { label: 'TITLE', y: 914 },
  { label: 'SUBTITLE', y: 982 },
  { label: 'STATUS', y: 1095 },
  { label: 'PROGRESS', y: 1142 },
  { label: 'TAGLINE', y: 1216 },
  { label: '00 SIGNATURE', y: 1300 },
  { label: 'SITE 00 SIGNATURE LABEL', y: 1370 },
];

/** Regions measured during validation (primary tolerance targets). */
export const ASSTS_LOADER_PRIMARY_REGIONS: LoaderRegionId[] = [
  'geometry',
  'pedestal',
  'copy.eyebrow',
  'copy.title',
  'copy.subtitle',
  'copy.status',
  'copy.progress',
  'copy.tagline',
  'copy.signature',
];

export function scaleLoaderRect(r: LoaderRegionRect, scale: number) {
  return {
    x: r.x * scale,
    y: r.y * scale,
    w: r.w * scale,
    h: r.h * scale,
  };
}

export function loaderRegionStyleVars(id: LoaderRegionId): Record<string, string> {
  const r = ASSTS_LOADER_REGIONS[id];
  return {
    '--loader-x': String(r.x),
    '--loader-y': String(r.y),
    '--loader-w': String(r.w),
    '--loader-h': String(r.h),
  };
}

export function getLoaderRegion(id: LoaderRegionId): LoaderRegionRect {
  return ASSTS_LOADER_REGIONS[id];
}

/** Progress track + percentage sub-rects within copy.progress group. */
export const ASSTS_LOADER_PROGRESS_TRACK = rect(76, 1142, 508, 7);
export const ASSTS_LOADER_PROGRESS_PCT = rect(612, 1137, 36, 22);
