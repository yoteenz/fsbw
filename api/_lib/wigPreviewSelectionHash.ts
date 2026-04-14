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

/** After-color styling (e.g. middle + layers → black); keyed by same **color-tier** hash as `wigPreviewLiveAnglePaths`. */
export function wigPreviewLiveAfterColorStylingPaths(
  promptVersion: string,
  unitKey: string,
  colorTierHash: string,
  stylingKey: string
): { front: string; left: string; right: string } {
  const u = unitKey.toUpperCase();
  const sk = stylingKey.replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'middle-layers';
  const base = `wig-preview-live/${promptVersion}/${u}/${colorTierHash}/after-color/${sk}`;
  return {
    front: `${base}/front.webp`,
    left: `${base}/left.webp`,
    right: `${base}/right.webp`,
  };
}
