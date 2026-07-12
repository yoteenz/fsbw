#!/usr/bin/env node
/**
 * Pre-bundle canonical src/studio-os-core modules into api/_lib for Vercel serverless tracing.
 * Repair: api/ → src/ cross-root imports are omitted from @vercel/nft output at cold start.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const entry = path.join(ROOT, 'api/_lib/creativeProduction/studio-os-server-entry.ts');
const outfile = path.join(ROOT, 'api/_lib/creativeProduction/studio-os-server.bundle.js');

if (!fs.existsSync(entry)) {
  console.error('Missing bundle entry:', entry);
  process.exit(1);
}

const cmd = [
  'npx',
  'esbuild',
  entry,
  '--bundle',
  '--platform=node',
  '--format=esm',
  `--outfile=${outfile}`,
  '--log-level=warning',
].join(' ');

execSync(cmd, { cwd: ROOT, stdio: 'inherit' });

const bytes = fs.statSync(outfile).size;
const text = fs.readFileSync(outfile, 'utf8');
for (const forbidden of ['window.', 'document.', 'localStorage', 'navigator.']) {
  if (text.includes(forbidden)) {
    console.error(`Bundle contains forbidden browser global: ${forbidden}`);
    process.exit(1);
  }
}

console.log(`studio-os-server.bundle.js OK (${bytes} bytes)`);
