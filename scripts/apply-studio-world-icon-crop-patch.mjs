#!/usr/bin/env node
/**
 * Merge founder/composer crop patch JSON into studio-world-icon-crop-overrides.json
 * then regenerate studio-world-icon-crop-manifest.ts via propose script.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OVERRIDES = path.join(ROOT, 'scripts/config/studio-world-icon-crop-overrides.json');

const patchPath = process.argv[2];
if (!patchPath) {
  console.error('Usage: node scripts/apply-studio-world-icon-crop-patch.mjs patch.json');
  process.exit(1);
}

const patch = JSON.parse(fs.readFileSync(path.resolve(patchPath), 'utf8'));
const current = fs.existsSync(OVERRIDES) ? JSON.parse(fs.readFileSync(OVERRIDES, 'utf8')) : {};
const merged = { ...current, ...patch };
fs.writeFileSync(OVERRIDES, JSON.stringify(merged, null, 2));

spawnSync('node', ['scripts/propose-studio-world-icon-crops.mjs'], { cwd: ROOT, stdio: 'inherit' });
spawnSync('node', ['scripts/generate-studio-world-icons-from-crops.mjs'], { cwd: ROOT, stdio: 'inherit' });
console.log('OK: crop patch merged and v3 assets regenerated.');
