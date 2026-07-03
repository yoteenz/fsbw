#!/usr/bin/env node
/**
 * Download committed email hero WebPs from Supabase public storage into public/assets/email/heroes/.
 * Use after BATCH_MODE=production hero regen (Vercel uploads to email-assets bucket).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST = join(ROOT, 'public/assets/email/heroes/manifest.json');
const OUT_DIR = join(ROOT, 'public/assets/email/heroes');
const BUCKET = process.env.EMAIL_ASSETS_BUCKET?.trim() || 'email-assets';

function loadEnvFiles() {
  for (const name of ['.env.local', '.env.wig-preview', '.env.wig-preview.txt', '.env']) {
    const path = join(ROOT, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (process.env[key]) continue;
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

function publicObjectUrl(supabaseUrl, objectPath) {
  const base = supabaseUrl.replace(/\/$/, '');
  const encoded = objectPath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

async function main() {
  loadEnvFiles();
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() || 'https://hyycomvcaqxxvyrfupes.supabase.co';
  if (!existsSync(MANIFEST)) {
    console.error('Missing manifest:', MANIFEST);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const ready = Array.isArray(raw.ready) ? raw.ready : [];
  if (!ready.length) {
    console.error('No heroes in manifest ready list');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  let ok = 0;
  let fail = 0;
  for (const templateType of ready) {
    const remote = `heroes/${templateType}.webp`;
    const url = publicObjectUrl(supabaseUrl, remote);
    const localPath = join(OUT_DIR, `${templateType}.webp`);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(localPath, buf);
      console.log('OK', templateType, `(${buf.length} bytes)`);
      ok += 1;
    } catch (e) {
      console.error('FAIL', templateType, e instanceof Error ? e.message : e);
      fail += 1;
    }
  }
  console.log(`Downloaded ${ok}/${ready.length} heroes (${fail} failed)`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
