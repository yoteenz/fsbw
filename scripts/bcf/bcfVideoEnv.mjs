import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..', '..');

export function loadEnvFiles() {
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

export function slugifyColorId(colorId) {
  return String(colorId || 'DEFAULT')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildProductKey(category, texture, colorId = 'DEFAULT') {
  const colorSlug = slugifyColorId(colorId);
  if (colorSlug === 'default') return `${category}-${texture}-default`;
  return `${category}-${texture}-${colorSlug}`;
}

export function publicStorageUrl(supabaseUrl, bucket, storagePath) {
  const base = supabaseUrl.replace(/\/$/, '');
  const encoded = storagePath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Reject if `promise` does not settle within `ms` (unblocks batch on hung Fal jobs). */
export function withTimeout(promise, ms, label = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}
