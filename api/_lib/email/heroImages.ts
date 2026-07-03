import { resolveSiteOrigin } from './brandAssets.js';
import type { EmailTemplateType } from './types.js';

/** Supabase Storage path segment (upload via `npm run email:generate-heroes`). */
export function emailHeroStoragePath(templateType: EmailTemplateType): string {
  return `heroes/${templateType}.webp`;
}

/** Public URL for Fal hero WebPs committed under `public/assets/email/heroes/`. */
export function emailHeroImageUrl(templateType: EmailTemplateType): string {
  const site = resolveSiteOrigin();
  return `${site}/assets/email/heroes/${templateType}.webp`;
}

/** Local repo path for generated heroes before Supabase upload. */
export function emailHeroLocalRelativePath(templateType: EmailTemplateType): string {
  return `public/assets/email/heroes/${templateType}.webp`;
}
