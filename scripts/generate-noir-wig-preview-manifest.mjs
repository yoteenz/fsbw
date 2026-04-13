#!/usr/bin/env node
/**
 * Writes a Phase-1 NOIR manifest JSON for offline batch generation.
 *
 * Full Cartesian product of all build-a-wig lists is huge (~100k+). This script defaults to a
 * **sanity preset** (edit arrays below for your real pre-launch batch). Set PRESET=full at your own risk.
 *
 * Usage:
 *   node scripts/generate-noir-wig-preview-manifest.mjs
 *   PRESET=full node scripts/generate-noir-wig-preview-manifest.mjs   # uses full option arrays (WARNING: very large)
 *
 * Output: scripts/wig-preview/manifests/noir-<preset>-<promptVersion>.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWigPreviewPrompt } from './wig-preview/promptTemplate.mjs';
import { wigPreviewSelectionStoragePath } from './wig-preview/selectionStoragePath.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LENGTH_OPTIONS = ['16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"', '32"', '34"', '36"', '40"'];
const DENSITY_OPTIONS = ['130%', '150%', '180%', '200%', '250%', '300%', '350%', '400%'];
const TEXTURE_OPTIONS = ['SILKY', 'KINKY', 'YAKI'];
const LACE_OPTIONS = ['2X6', '4X4', '5X5', '6X6', '9X6', '7X7', '13X4', '13X6', '360', 'FULL'];
const HAIRLINE_OPTIONS = ['NATURAL', 'PEAK', 'LAGOS', 'LAGOS, PEAK'];
const STYLING_OPTIONS = [
  'NONE',
  'BANGS',
  'CRIMPS',
  'FLAT IRON',
  'LAYERS',
  'BANGS, CRIMPS',
  'BANGS, FLAT IRON',
  'BANGS, LAYERS',
];
const COLOR_OPTIONS_NOIR = [
  'JET BLACK',
  'OFF BLACK',
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
const ADDON_COMBO_OPTIONS = [
  { label: 'NONE', value: [] },
  { label: 'BLEACH', value: ['BLEACH'] },
  { label: 'PLUCK', value: ['PLUCK'] },
  { label: 'BLUNT CUT', value: ['BLUNT CUT'] },
  { label: 'BLEACH + PLUCK', value: ['BLEACH', 'PLUCK'] },
  { label: 'BLEACH + BLUNT CUT', value: ['BLEACH', 'BLUNT CUT'] },
  { label: 'PLUCK + BLUNT CUT', value: ['PLUCK', 'BLUNT CUT'] },
  { label: 'BLEACH + PLUCK + BLUNT CUT', value: ['BLEACH', 'PLUCK', 'BLUNT CUT'] },
];

const PRESETS = {
  /** ~384 combos: good for pipeline smoke + first asset library slice */
  sanity: {
    length: ['24"'],
    density: ['200%'],
    lace: ['13X4', '13X6'],
    texture: ['SILKY', 'KINKY'],
    color: ['OFF BLACK', 'ESPRESSO', 'HONEY'],
    hairline: ['NATURAL', 'PEAK'],
    styling: ['NONE', 'BANGS'],
    addOnCombos: ADDON_COMBO_OPTIONS,
  },
  /** Wider but still bounded — trim further if needed */
  medium: {
    length: ['22"', '24"', '26"'],
    density: ['180%', '200%', '250%'],
    lace: ['13X4', '13X6', '360'],
    texture: TEXTURE_OPTIONS,
    color: ['OFF BLACK', 'ESPRESSO', 'HONEY', 'CHESTNUT'],
    hairline: ['NATURAL', 'PEAK'],
    styling: ['NONE', 'BANGS', 'LAYERS'],
    addOnCombos: ADDON_COMBO_OPTIONS,
  },
  full: {
    length: LENGTH_OPTIONS,
    density: DENSITY_OPTIONS,
    lace: LACE_OPTIONS,
    texture: TEXTURE_OPTIONS,
    color: COLOR_OPTIONS_NOIR,
    hairline: HAIRLINE_OPTIONS,
    styling: STYLING_OPTIONS,
    addOnCombos: ADDON_COMBO_OPTIONS,
  },
};

const PROMPT_VERSION = process.env.PROMPT_VERSION || 'v1';
const UNIT_KEY = 'NOIR';
const presetName = (process.env.PRESET || 'sanity').toLowerCase();
const preset = PRESETS[presetName];
if (!preset) {
  console.error(`Unknown PRESET="${presetName}". Use: sanity | medium | full`);
  process.exit(1);
}

if (presetName === 'full') {
  console.warn(
    '[WARN] PRESET=full will create a very large manifest (100k+ rows). Ensure you mean it before running batch.'
  );
}

function cartesianItems() {
  const items = [];
  for (const length of preset.length) {
    for (const density of preset.density) {
      for (const lace of preset.lace) {
        for (const texture of preset.texture) {
          for (const color of preset.color) {
            for (const hairline of preset.hairline) {
              for (const styling of preset.styling) {
                for (const combo of preset.addOnCombos) {
                  const selections = {
                    unitKey: UNIT_KEY,
                    length,
                    density,
                    lace,
                    texture,
                    color,
                    hairline,
                    styling,
                    addOns: combo.value.map((x) => String(x).toUpperCase()),
                  };
                  const { selectionHash: hash, storagePath } = wigPreviewSelectionStoragePath(
                    selections,
                    PROMPT_VERSION
                  );
                  items.push({
                    selectionHash: hash,
                    storagePath,
                    selections,
                    prompt: buildWigPreviewPrompt(selections),
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  return items;
}

const items = cartesianItems();
const outDir = join(__dirname, 'wig-preview', 'manifests');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `noir-${presetName}-${PROMPT_VERSION}.json`);
const manifest = {
  generatedAt: new Date().toISOString(),
  preset: presetName,
  promptVersion: PROMPT_VERSION,
  unitKey: UNIT_KEY,
  count: items.length,
  items,
};
writeFileSync(outPath, JSON.stringify(manifest, null, 0), 'utf8');
console.log(`Wrote ${items.length} rows → ${outPath}`);
