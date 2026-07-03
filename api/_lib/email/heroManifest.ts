import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { EmailTemplateType } from './types.js';

let cachedReady: Set<string> | null = null;

function manifestPath(): string {
  return join(process.cwd(), 'public/assets/email/heroes/manifest.json');
}

/** Template types with uploaded Fal hero WebPs (see `npm run email:generate-heroes`). */
export function loadReadyEmailHeroes(): Set<string> {
  if (cachedReady) return cachedReady;
  const path = manifestPath();
  if (!existsSync(path)) {
    cachedReady = new Set();
    return cachedReady;
  }
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as { ready?: string[] };
    cachedReady = new Set(Array.isArray(raw.ready) ? raw.ready : []);
  } catch {
    cachedReady = new Set();
  }
  return cachedReady;
}

export function isEmailHeroReady(templateType: EmailTemplateType): boolean {
  if (process.env.EMAIL_HERO_FORCE_HTML === '1') return false;
  if (process.env.EMAIL_HERO_FORCE_FAL === '1') return true;
  return loadReadyEmailHeroes().has(templateType);
}

export function clearEmailHeroManifestCache(): void {
  cachedReady = null;
}
