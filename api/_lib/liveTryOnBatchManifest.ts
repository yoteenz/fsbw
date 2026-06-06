import type { LiveTryOnBatchJob } from './liveTryOnBatchGenerate.js';

/** Default NOIR build used for live try-on batch rows (color varies per manifest entry). */
export const LIVE_TRY_ON_BATCH_NOIR_DEFAULTS = {
  unitKey: 'NOIR',
  length: '24"',
  density: '200%',
  lace: '13X6',
  texture: 'SILKY',
  hairline: 'NATURAL',
  styling: 'NONE',
  addOns: [] as string[],
};

/** Catalog colors to pre-generate for studio try-on (NOIR defaults above). */
export const LIVE_TRY_ON_BATCH_NOIR_COLORS: string[] = [
  'OFF BLACK',
  'JET BLACK',
  'ESPRESSO',
  'CHESTNUT',
  'HONEY',
  'AUBURN',
  'COPPER',
  'GINGER',
  'SANGRIA',
  'CHERRY',
  'RASPBERRY',
  'PLUM',
  'COBALT',
  'TEAL',
  'SLIME',
  'CITRINE',
];

export type LiveTryOnBatchManifestRow = {
  id: string;
  label: string;
  color: string;
  unitKey: string;
  length: string;
  density: string;
  lace: string;
  texture: string;
  hairline: string;
  styling: string;
  addOns: string[];
};

export function liveTryOnNoirBatchManifest(): LiveTryOnBatchManifestRow[] {
  return LIVE_TRY_ON_BATCH_NOIR_COLORS.map((color) => ({
    id: `NOIR-${color.replace(/\s+/g, '_')}`,
    label: `NOIR · ${color}`,
    color,
    ...LIVE_TRY_ON_BATCH_NOIR_DEFAULTS,
  }));
}

/**
 * Try-on Storage keys use **studio defaults** (same as admin batch rows), not the shopper's length/lace/etc.
 * Live try-on is color-first; batch pre-gen is per catalog color at default NOIR build.
 */
export function liveTryOnStorageLookupJob(input: {
  unitKey?: string;
  color: string;
}): LiveTryOnBatchJob {
  return {
    ...LIVE_TRY_ON_BATCH_NOIR_DEFAULTS,
    unitKey: String(input.unitKey || 'NOIR').toUpperCase(),
    color: String(input.color || 'OFF BLACK').trim(),
  };
}
