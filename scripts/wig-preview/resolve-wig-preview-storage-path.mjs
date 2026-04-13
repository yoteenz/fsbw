#!/usr/bin/env node
/**
 * Print Supabase Storage path for a build-a-wig preview row (same hash as manifest / batch script).
 * Upload your hand-made WebP to that path so `pregenerate-wig-previews.mjs` **skips** it (no fal charge).
 *
 * Usage:
 *   node scripts/wig-preview/resolve-wig-preview-storage-path.mjs '{"unitKey":"NOIR","length":"24\"","density":"200%","lace":"13X6","texture":"SILKY","color":"HONEY","hairline":"NATURAL","styling":"NONE","addOns":[]}'
 *
 * Env:
 *   PROMPT_VERSION=v1   (must match manifest when you run batch)
 */
import { wigPreviewSelectionStoragePath } from './selectionStoragePath.mjs';

const promptVersion = process.env.PROMPT_VERSION || 'v1';
const raw = process.argv[2];
if (!raw) {
  console.error(
    'Usage: node scripts/wig-preview/resolve-wig-preview-storage-path.mjs \'<JSON selections>\'\n' +
      'Example: {"unitKey":"NOIR","length":"24\\"","density":"200%","lace":"13X6","texture":"SILKY","color":"HONEY","hairline":"NATURAL","styling":"NONE","addOns":[]}'
  );
  process.exit(1);
}

let s;
try {
  s = JSON.parse(raw);
} catch (e) {
  console.error('Invalid JSON:', e.message);
  process.exit(1);
}

const { selectionHash, storagePath, canonicalJson } = wigPreviewSelectionStoragePath(s, promptVersion);
console.log('PROMPT_VERSION=', promptVersion);
console.log('selectionHash=', selectionHash);
console.log('storagePath=', storagePath);
console.log('canonical=', canonicalJson);
