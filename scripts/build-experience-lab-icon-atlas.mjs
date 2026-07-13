#!/usr/bin/env node
/** @deprecated Use scripts/extract-experience-lab-icons.mjs */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

console.warn('[deprecated] build-experience-lab-icon-atlas.mjs → extract-experience-lab-icons.mjs');
const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'extract-experience-lab-icons.mjs');
const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
process.exit(result.status ?? 1);
