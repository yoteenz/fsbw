/** Client copy — keep in sync with `api/_lib/liveTryOnBatchManifest.ts`. */
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

export const LIVE_TRY_ON_BATCH_NOIR_COLORS = [
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
] as const;

export type LiveTryOnBatchJob = {
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

export type LiveTryOnBatchManifestRow = LiveTryOnBatchJob & {
  id: string;
  label: string;
};

export function liveTryOnNoirBatchManifestRows(): LiveTryOnBatchManifestRow[] {
  return LIVE_TRY_ON_BATCH_NOIR_COLORS.map((color) => ({
    id: `NOIR-${color.replace(/\s+/g, '_')}`,
    label: `NOIR · ${color}`,
    color,
    ...LIVE_TRY_ON_BATCH_NOIR_DEFAULTS,
  }));
}
