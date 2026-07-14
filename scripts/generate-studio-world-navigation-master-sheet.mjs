#!/usr/bin/env node
/**
 * Generate Studio World Navigation master icon sheet — Sprint 02 Phase 1.
 * Procedural premium chrome outline icons on pure black 10240×10240 canvas.
 *
 * Output: src/assets/studio-world/navigation/icons/source/studio-world-navigation-master-sheet.png
 *
 * Usage: node scripts/generate-studio-world-navigation-master-sheet.mjs
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { CHROME_NAV_ICON_PATHS, chromeNavIconSvg } from './lib/studio-world-chrome-nav-icon-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SHEET_SIZE = 10240;
const GRID_ROWS = 10;
const GRID_COLS = 10;
const CELL_SIZE = SHEET_SIZE / GRID_COLS;
const ICON_SCALE = 0.58;
const ICON_RENDER_SIZE = Math.round(CELL_SIZE * ICON_SCALE);

const OUTPUT_REL =
  'src/assets/studio-world/navigation/icons/source/studio-world-navigation-master-sheet.png';
const REGISTRY_REL =
  'src/features/studio-world/icons/navigation-master/navigation-master-icon-registry.ts';
const PLACEHOLDERS_REL =
  'src/features/studio-world/icons/navigation-master/navigation-master-icon-draft-placeholders.generated.json';
const SUMMARY_REL =
  'src/assets/studio-world/navigation/icons/source/_navigation-master-generation-summary.json';

function parseRegistry() {
  const text = fs.readFileSync(path.join(ROOT, REGISTRY_REL), 'utf8');
  const entries = [];
  const blockRe = /(\w+):\s*\{[^}]*sourceLabel:\s*'([^']+)'[^}]*row:\s*(\d+)[^}]*column:\s*(\d+)/gs;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    entries.push({ key: m[1], sourceLabel: m[2], row: Number(m[3]), column: Number(m[4]) });
  }
  return entries;
}

function iconKeyToFilename(key) {
  return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`;
}

function buildDraftPlaceholders(entries) {
  const now = new Date().toISOString();
  return {
    schemaVersion: 'studio-world-navigation-draft-placeholders.v1',
    generatedAt: now,
    category: 'navigation',
    certification: 'draft',
    version: 'v1',
    designFamily: 'studio-world-navigation-chrome-v1',
    iconCount: entries.length,
    stateSupport: 'pending',
    themeSupport: 'pending',
    icons: entries.map((e) => ({
      id: `navigation.${e.key}`,
      category: 'navigation',
      displayName: e.sourceLabel
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      aliases: [e.sourceLabel, e.key, `navigation-${e.key}`],
      keywords: [e.key, 'navigation', 'sprint-02'],
      certification: 'draft',
      version: 'v1',
      status: 'draft',
      row: e.row,
      column: e.column,
      pngPath: null,
      masterSheetPath: OUTPUT_REL,
      stateSupport: 'pending',
      themeSupport: 'pending',
    })),
  };
}

async function renderIconPng(key) {
  const paths = CHROME_NAV_ICON_PATHS[key];
  if (!paths) {
    throw new Error(`Missing chrome path for icon: ${key}`);
  }
  const svg = chromeNavIconSvg(paths, ICON_RENDER_SIZE);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function main() {
  const entries = parseRegistry();
  if (entries.length !== 93) {
    throw new Error(`Expected 93 registry entries, got ${entries.length}`);
  }

  const outPath = path.join(ROOT, OUTPUT_REL);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const composites = [];
  for (const entry of entries) {
    const png = await renderIconPng(entry.key);
    const left = Math.round(entry.column * CELL_SIZE + (CELL_SIZE - ICON_RENDER_SIZE) / 2);
    const top = Math.round(entry.row * CELL_SIZE + (CELL_SIZE - ICON_RENDER_SIZE) / 2);
    composites.push({ input: png, left, top });
  }

  const sheet = await sharp({
    create: {
      width: SHEET_SIZE,
      height: SHEET_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 6 })
    .toBuffer();

  fs.writeFileSync(outPath, sheet);
  const sha256 = crypto.createHash('sha256').update(sheet).digest('hex');

  const placeholders = buildDraftPlaceholders(entries);
  fs.mkdirSync(path.dirname(path.join(ROOT, PLACEHOLDERS_REL)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, PLACEHOLDERS_REL), JSON.stringify(placeholders, null, 2));

  const summary = {
    version: 'studio-world-navigation-master-sheet-v1',
    generatedAt: new Date().toISOString(),
    sheetSize: SHEET_SIZE,
    grid: `${GRID_ROWS}x${GRID_COLS}`,
    cellSize: CELL_SIZE,
    iconRenderSize: ICON_RENDER_SIZE,
    iconCount: entries.length,
    blankCells: 7,
    outputPath: OUTPUT_REL,
    sha256,
    designLanguage: 'premium-chrome-outline',
    labels: false,
    note: 'Master artwork for calibration — not a runtime sprite',
  };
  fs.writeFileSync(path.join(ROOT, SUMMARY_REL), JSON.stringify(summary, null, 2));

  console.log(`Wrote ${OUTPUT_REL} (${SHEET_SIZE}×${SHEET_SIZE}, ${entries.length} icons)`);
  console.log(`SHA256: ${sha256}`);
  console.log(`Draft placeholders: ${PLACEHOLDERS_REL}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
