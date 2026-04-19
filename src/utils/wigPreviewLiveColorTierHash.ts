/**
 * Client-side mirror of `wigPreviewManifestHashLiveColorTier` in `api/_lib/wigPreviewSelectionHash.ts`
 * — must stay in sync when hashing changes.
 */
import type { BuildWigLivePreviewSelections } from './buildWigLivePreviewSelections';

/** Keep in sync with `api/_lib/bawCatalogHairColors.ts` `canonicalWigPreviewColorForHash`. */
export function canonicalWigPreviewColorForHash(color: string): string {
  const u = String(color || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  const aliases: Record<string, string> = {
    'OFF BLACK': 'OFF_BLACK',
    OFF_BLACK: 'OFF_BLACK',
    'JET BLACK': 'JET_BLACK_OFF_BLACK',
    'JET BLACK OFF BLACK': 'JET_BLACK_OFF_BLACK',
    JET_BLACK: 'JET_BLACK_OFF_BLACK',
    JET_BLACK_OFF_BLACK: 'JET_BLACK_OFF_BLACK',
  };
  if (aliases[u]) return aliases[u];
  const underscored = u.replace(/\s+/g, '_');
  if (aliases[underscored]) return aliases[underscored];
  return underscored;
}

function canonicalSelections(obj: Record<string, string>): string {
  const keys = Object.keys(obj).sort();
  const ordered: Record<string, string> = {};
  for (const k of keys) ordered[k] = obj[k];
  return JSON.stringify(ordered);
}

async function sha256Hex32(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export type WigPreviewSelectionsForHash = BuildWigLivePreviewSelections & {
  unitKey?: string;
  color: string;
}

/** Same as server `wigPreviewManifestHashLiveColorTier` (styling forced NONE). */
export async function wigPreviewManifestHashLiveColorTier(sel: WigPreviewSelectionsForHash): Promise<string> {
  const unitKey = String(sel.unitKey || 'NOIR').toUpperCase();
  const addOns = Array.isArray(sel.addOns) ? sel.addOns.map((x) => String(x).toUpperCase()) : [];
  const colorNorm = String(sel.color || '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
  const canonicalJson = canonicalSelections({
    unitKey,
    length: String(sel.length),
    density: String(sel.density),
    lace: String(sel.lace),
    texture: String(sel.texture),
    color: canonicalWigPreviewColorForHash(colorNorm),
    hairline: String(sel.hairline),
    styling: 'NONE',
    addOns: [...addOns].sort().join(','),
  });
  return sha256Hex32(canonicalJson);
}
