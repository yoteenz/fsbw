/**
 * Matches `scripts/wig-preview/selectionStoragePath.mjs` — keep in sync when changing manifest hashing.
 */
import { createHash } from 'node:crypto';
import { canonicalWigPreviewColorForHash } from './bawCatalogHairColors.js';

export type WigPreviewSelections = {
  unitKey: string;
  length: string;
  density: string;
  lace: string;
  texture: string;
  color: string;
  hairline: string;
  styling: string;
  addOns: string[];
};

function canonicalSelections(obj: Record<string, string>): string {
  const keys = Object.keys(obj).sort();
  const ordered: Record<string, string> = {};
  for (const k of keys) ordered[k] = obj[k];
  return JSON.stringify(ordered);
}

function selectionHash(canonicalJson: string): string {
  return createHash('sha256').update(canonicalJson).digest('hex').slice(0, 32);
}

/** Same hash as manifest `wig-preview/{v}/{UNIT}/{hash}.webp` */
export function wigPreviewManifestHash(s: WigPreviewSelections): string {
  const unitKey = String(s.unitKey || 'NOIR').toUpperCase();
  const addOns = Array.isArray(s.addOns) ? s.addOns.map((x) => String(x).toUpperCase()) : [];
  const canonicalJson = canonicalSelections({
    unitKey,
    length: String(s.length),
    density: String(s.density),
    lace: String(s.lace),
    texture: String(s.texture),
    color: canonicalWigPreviewColorForHash(String(s.color)),
    hairline: String(s.hairline),
    styling: String(s.styling),
    addOns: [...addOns].sort().join(','),
  });
  return selectionHash(canonicalJson);
}

/**
 * Hash for **live color** WebPs only: `styling` forced to `NONE` so salon styling (LAYERS, part, etc.)
 * does not change the storage folder for the three color angles. After-color styling reads these paths
 * then writes under `wigPreviewLiveAfterColorStylingPaths`.
 */
export function wigPreviewManifestHashLiveColorTier(s: WigPreviewSelections): string {
  return wigPreviewManifestHash({ ...s, styling: 'NONE' });
}

/** Live 3-angle assets (does not collide with batch `wig-preview/.../{hash}.webp`). */
export function wigPreviewLiveAnglePaths(
  promptVersion: string,
  unitKey: string,
  manifestHash: string
): { front: string; left: string; right: string } {
  const u = unitKey.toUpperCase();
  const base = `wig-preview-live/${promptVersion}/${u}/${manifestHash}`;
  return {
    front: `${base}/front.webp`,
    left: `${base}/left.webp`,
    right: `${base}/right.webp`,
  };
}

/** Folder under `after-color/` for LAYERS live styling — separate cache per part (MIDDLE | LEFT | RIGHT). */
export function wigPreviewLiveLayersPartFolder(partSelection: string): string {
  const p = String(partSelection || 'MIDDLE').toUpperCase();
  if (p === 'LEFT') return 'layers-left-part';
  if (p === 'RIGHT') return 'layers-right-part';
  return 'layers-middle-part';
}

/** Folder under `after-color/` for CRIMPS live styling — same part split as LAYERS, separate WebP cache. */
export function wigPreviewLiveCrimpsPartFolder(partSelection: string): string {
  const p = String(partSelection || 'MIDDLE').toUpperCase();
  if (p === 'LEFT') return 'crimps-left-part';
  if (p === 'RIGHT') return 'crimps-right-part';
  return 'crimps-middle-part';
}

/** LAYERS + curtain bangs — distinct cache from LAYERS-only and bangs-only. */
export function wigPreviewLiveLayersWithBangsPartFolder(partSelection: string): string {
  const p = String(partSelection || 'MIDDLE').toUpperCase();
  if (p === 'LEFT') return 'layers-with-bangs-left-part';
  if (p === 'RIGHT') return 'layers-with-bangs-right-part';
  return 'layers-with-bangs-middle-part';
}

/** CRIMPS + curtain bangs — distinct cache from CRIMPS-only. */
export function wigPreviewLiveCrimpsWithBangsPartFolder(partSelection: string): string {
  const p = String(partSelection || 'MIDDLE').toUpperCase();
  if (p === 'LEFT') return 'crimps-with-bangs-left-part';
  if (p === 'RIGHT') return 'crimps-with-bangs-right-part';
  return 'crimps-with-bangs-middle-part';
}

/** FLAT IRON — same color WebP input; **only** part direction + sleek straight hair changes per folder. */
export function wigPreviewLiveFlatIronPartFolder(partSelection: string): string {
  const p = String(partSelection || 'MIDDLE').toUpperCase();
  if (p === 'LEFT') return 'flat-iron-left-part';
  if (p === 'RIGHT') return 'flat-iron-right-part';
  return 'flat-iron-middle-part';
}

export function wigPreviewLiveFlatIronWithBangsPartFolder(partSelection: string): string {
  const p = String(partSelection || 'MIDDLE').toUpperCase();
  if (p === 'LEFT') return 'flat-iron-with-bangs-left-part';
  if (p === 'RIGHT') return 'flat-iron-with-bangs-right-part';
  return 'flat-iron-with-bangs-middle-part';
}

/** After-color styling (LAYERS + part); keyed by same **color-tier** hash as `wigPreviewLiveAnglePaths`. */
export function wigPreviewLiveAfterColorStylingPaths(
  promptVersion: string,
  unitKey: string,
  colorTierHash: string,
  stylingKey: string
): { front: string; left: string; right: string } {
  const u = unitKey.toUpperCase();
  const sk = stylingKey.replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'layers-middle-part';
  const base = `wig-preview-live/${promptVersion}/${u}/${colorTierHash}/after-color/${sk}`;
  return {
    front: `${base}/front.webp`,
    left: `${base}/left.webp`,
    right: `${base}/right.webp`,
  };
}
