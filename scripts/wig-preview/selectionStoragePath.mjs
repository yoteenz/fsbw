/**
 * Same path + hash rules as `generate-noir-wig-preview-manifest.mjs` / `pregenerate-wig-previews.mjs`.
 * Use this to upload **hand-generated** images so the batch script skips them (object already exists).
 */
import { createHash } from 'node:crypto';

function canonicalSelections(obj) {
  const keys = Object.keys(obj).sort();
  const ordered = {};
  for (const k of keys) ordered[k] = obj[k];
  return JSON.stringify(ordered);
}

function selectionHash(canonicalJson) {
  return createHash('sha256').update(canonicalJson).digest('hex').slice(0, 32);
}

/** Same as `canonicalWigPreviewColorForHash` in `api/_lib/bawCatalogHairColors.ts` — OFF BLACK and JET BLACK are distinct hash keys. */
export function canonicalWigPreviewColorForHash(color) {
  const u = String(color || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  const aliases = {
    'JET BLACK': 'JET_BLACK',
    'OFF BLACK': 'OFF_BLACK',
    'JET BLACK OFF BLACK': 'JET_BLACK',
    JET_BLACK: 'JET_BLACK',
    OFF_BLACK: 'OFF_BLACK',
    JET_BLACK_OFF_BLACK: 'JET_BLACK',
  };
  if (aliases[u]) return aliases[u];
  const underscored = u.replace(/\s+/g, '_');
  if (aliases[underscored]) return aliases[underscored];
  return underscored;
}

/**
 * @param {object} s
 * @param {string} s.unitKey - e.g. 'NOIR'
 * @param {string} s.length - e.g. '24"'
 * @param {string} s.density - e.g. '200%'
 * @param {string} s.lace - e.g. '13X6'
 * @param {string} s.texture - e.g. 'SILKY'
 * @param {string} s.color - e.g. 'HONEY' (must match manifest spelling)
 * @param {string} s.hairline - e.g. 'NATURAL'
 * @param {string} s.styling - e.g. 'NONE'
 * @param {string[]} [s.addOns] - e.g. [] or ['BLEACH','PLUCK']
 * @param {string} [promptVersion='v1']
 * @returns {{ selectionHash: string, storagePath: string, canonicalJson: string }}
 */
export function wigPreviewSelectionStoragePath(s, promptVersion = 'v1') {
  const unitKey = String(s.unitKey || 'NOIR').toUpperCase();
  const addOns = Array.isArray(s.addOns) ? s.addOns.map((x) => String(x).toUpperCase()) : [];
  const selections = {
    unitKey,
    length: s.length,
    density: s.density,
    lace: s.lace,
    texture: s.texture,
    color: s.color,
    hairline: s.hairline,
    styling: s.styling,
    addOns,
  };
  const canonicalJson = canonicalSelections({
    unitKey,
    length: selections.length,
    density: selections.density,
    lace: selections.lace,
    texture: selections.texture,
    color: canonicalWigPreviewColorForHash(selections.color),
    hairline: selections.hairline,
    styling: selections.styling,
    addOns: [...selections.addOns].sort().join(','),
  });
  const hash = selectionHash(canonicalJson);
  const storagePath = `wig-preview/${promptVersion}/${unitKey}/${hash}.webp`;
  return { selectionHash: hash, storagePath, canonicalJson };
}
