/**
 * Matches `scripts/wig-preview/selectionStoragePath.mjs` — keep in sync when changing manifest hashing.
 */
import { createHash } from 'node:crypto';

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
    color: String(s.color),
    hairline: String(s.hairline),
    styling: String(s.styling),
    addOns: [...addOns].sort().join(','),
  });
  return selectionHash(canonicalJson);
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
