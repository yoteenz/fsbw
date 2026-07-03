#!/usr/bin/env node
/**
 * Full BCF video batch workflow:
 *   1. Scan catalog + detect missing assets → manifest
 *   2. Generate missing videos via Fal
 *   3. Sync manifest to public/ + generated TS
 *
 * Usage:
 *   npm run bcf:videos:batch
 *   DRY_RUN=1 npm run bcf:videos:batch
 *   LIMIT=3 npm run bcf:videos:batch
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function run(script, extraEnv = {}) {
  const env = { ...process.env, ...extraEnv };
  const r = spawnSync('node', [join(__dirname, script)], {
    cwd: ROOT,
    env,
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run('bcf/generate-bcf-video-manifest.mjs');
run('bcf/pregenerate-bcf-videos.mjs');
run('bcf/sync-bcf-video-manifest.mjs');
