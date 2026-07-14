#!/usr/bin/env node
/**
 * Generates public/studio-os/icon-system/icon-manifest.json from Studio World Icon Registry bridge.
 * Canonical builder: src/studio-os-core/studio-world-icon-system/StudioWorldIconManifest.ts (via tsx runner)
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const RUNNER = path.join(ROOT, 'scripts/generate-studio-world-icon-manifest-runner.ts');

const result = spawnSync('npx', ['tsx', RUNNER], {
  cwd: ROOT,
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
