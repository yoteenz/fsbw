#!/usr/bin/env node
/**
 * Sync api/_lib/email/heroManifestReady.ts from public/assets/email/heroes/manifest.json.
 * Run after adding hero WebPs or when manifest.json changes without regenerating heroes.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST_PATH = join(ROOT, 'public/assets/email/heroes/manifest.json');
const TS_PATH = join(ROOT, 'api/_lib/email/heroManifestReady.ts');

if (!existsSync(MANIFEST_PATH)) {
  console.error('Missing manifest:', MANIFEST_PATH);
  process.exit(1);
}

const raw = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const ready = Array.isArray(raw.ready) ? [...raw.ready].sort() : [];

const tsBody =
  '/** Auto-updated by email hero generation scripts. Do not edit by hand. */\n' +
  `export const EMAIL_HERO_MANIFEST_READY: readonly string[] = ${JSON.stringify(ready, null, 2)};\n`;

writeFileSync(TS_PATH, tsBody);
console.log(`Synced ${ready.length} heroes → ${TS_PATH}`);
