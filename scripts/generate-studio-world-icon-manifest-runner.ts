#!/usr/bin/env npx tsx
/**
 * Generates public/studio-os/icon-system/icon-manifest.json from Studio World Icon Registry bridge.
 * Invoked by scripts/generate-studio-world-icon-manifest.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureStudioWorldIconSystemBridge } from '../src/features/studio-world/icons/studio-world-icon-system-bridge';
import { buildStudioWorldIconManifest } from '../src/studio-os-core/studio-world-icon-system/StudioWorldIconManifest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/studio-os/icon-system');
const outFile = join(outDir, 'icon-manifest.json');

function main() {
  ensureStudioWorldIconSystemBridge();
  const manifest = buildStudioWorldIconManifest();

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${outFile} (${manifest.iconCount} icons)`);
}

main();
