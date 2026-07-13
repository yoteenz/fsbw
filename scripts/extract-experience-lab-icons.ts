/**
 * Sprint entrypoint alias — implementation lives in extract-experience-lab-icons.mjs
 * (Node ESM; no tsx required in prebuild).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'extract-experience-lab-icons.mjs');
const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
process.exit(result.status ?? 1);
