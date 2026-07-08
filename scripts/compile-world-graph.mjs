#!/usr/bin/env node
/**
 * Compiles Studio World Graph™ → public/studio-os/world-graph/graph.json
 * CI gate: validates graph integrity before build continues.
 *
 * Canonical builder: src/studio-os-core/world-graph/builder.ts (via tsx runner)
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const RUNNER = path.join(ROOT, 'scripts/compile-world-graph-runner.ts');

const result = spawnSync('npx', ['tsx', RUNNER], {
  cwd: ROOT,
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
