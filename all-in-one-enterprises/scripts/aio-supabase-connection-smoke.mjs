#!/usr/bin/env node
/**
 * Smoke test: AIO Supabase client connection (publishable key only).
 * Reads all-in-one-enterprises/.env.local if present.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envLocal = join(root, '.env.local');

const AIO_REF = 'nnnljnhtmseagotvgxxt';
const FS_REF = 'hyycomvcaqxxvyrfupes';

function loadEnvLocal() {
  if (!existsSync(envLocal)) return;
  const text = readFileSync(envLocal, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url =
  process.env.VITE_AIO_SUPABASE_URL ??
  process.env.AIO_SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL;
const key =
  process.env.VITE_AIO_SUPABASE_ANON_KEY ??
  process.env.AIO_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('CONNECTION FAILED: missing VITE_AIO_SUPABASE_URL / VITE_AIO_SUPABASE_ANON_KEY (see .env.local)');
  process.exit(1);
}

if (url.includes(FS_REF)) {
  console.error(`CONNECTION FAILED: URL targets forbidden Frontal Slayer project ${FS_REF}`);
  process.exit(1);
}

if (!url.includes(AIO_REF)) {
  console.error(`CONNECTION FAILED: URL must contain AIO project ref ${AIO_REF}`);
  process.exit(1);
}

const client = createClient(url, key, { auth: { persistSession: false } });

const { error } = await client.from('aio_organizations').select('id').limit(1);

if (!error) {
  console.log('CONNECTION SUCCESSFUL — SCHEMA MIGRATED (aio_organizations readable)');
  process.exit(0);
}

const msg = error.message ?? String(error);
const code = error.code ?? '';

if (code === 'PGRST205' || /does not exist|Could not find the table|schema cache/i.test(msg)) {
  console.log('CONNECTION SUCCESSFUL — SCHEMA NOT MIGRATED');
  console.log(`PostgREST note: ${msg}`);
  process.exit(0);
}

if (/Invalid API key|JWT|apikey|401|403/i.test(msg)) {
  console.error('CONNECTION FAILED: auth rejected');
  console.error(msg);
  process.exit(1);
}

console.error('CONNECTION FAILED: unexpected error');
console.error(JSON.stringify({ code, message: msg }, null, 2));
process.exit(1);
