import { EMAIL_HERO_MANIFEST_READY } from './heroManifestReady.js';
import type { EmailTemplateType } from './types.js';

let cachedReady: Set<string> | null = null;

/** Template types with uploaded Fal hero WebPs (see `npm run email:generate-heroes`). */
export function loadReadyEmailHeroes(): Set<string> {
  if (cachedReady) return cachedReady;
  cachedReady = new Set(EMAIL_HERO_MANIFEST_READY);
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
