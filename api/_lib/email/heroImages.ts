import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { resolveSiteOrigin } from './brandAssets.js';
import type { EmailTemplateType } from './types.js';

/** Supabase Storage path segment (upload via `npm run email:generate-heroes`). */
export function emailHeroStoragePath(templateType: EmailTemplateType): string {
  return `heroes/${templateType}.webp`;
}

function heroAssetVersion(): string {
  try {
    const manifestPath = join(process.cwd(), 'public/assets/email/heroes/manifest.json');
    if (!existsSync(manifestPath)) return '1';
    const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as { updatedAt?: string };
    return raw.updatedAt ? encodeURIComponent(raw.updatedAt) : '1';
  } catch {
    return '1';
  }
}

/** Public URL for Fal hero WebPs committed under `public/assets/email/heroes/`. */
export function emailHeroImageUrl(templateType: EmailTemplateType): string {
  const site = resolveSiteOrigin();
  const v = heroAssetVersion();
  return `${site}/assets/email/heroes/${templateType}.webp?v=${v}`;
}

/** Local repo path for generated heroes before Supabase upload. */
export function emailHeroLocalRelativePath(templateType: EmailTemplateType): string {
  return `public/assets/email/heroes/${templateType}.webp`;
}
