#!/usr/bin/env node
/**
 * CI / predeploy schema deployment readiness — blocks when code requires schema not in contract.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const MANIFEST = [
  {
    featureId: 'async-governed-generation-v1',
    migrationId: '20260712180000_studio_governed_generation_jobs',
    filename: '20260712180000_studio_governed_generation_jobs.sql',
    requiredTables: ['public.studio_governed_generation_jobs'],
  },
];

function checksum(content) {
  return createHash('sha256').update(content.trim()).digest('hex');
}

let failed = false;

for (const entry of MANIFEST) {
  const migrationPath = path.join(ROOT, 'supabase/migrations', entry.filename);
  if (!fs.existsSync(migrationPath)) {
    console.error(`FAIL: migration missing for ${entry.featureId}: ${entry.filename}`);
    failed = true;
    continue;
  }
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const cs = checksum(sql);
  for (const table of entry.requiredTables) {
    const short = table.split('.').pop();
    if (!sql.toLowerCase().includes(short)) {
      console.error(`FAIL: migration ${entry.filename} does not reference ${table}`);
      failed = true;
    }
  }
  console.log(`OK: ${entry.featureId} → ${entry.migrationId} (checksum ${cs.slice(0, 12)}…)`);
}

if (failed) {
  console.error('\nSchema deployment readiness: BLOCKED');
  process.exit(1);
}
console.log('\nSchema deployment readiness: PASS (repository contract)');
