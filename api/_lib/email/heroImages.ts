import { emailAssetUrl } from './brandAssets.js';
import type { EmailTemplateType } from './types.js';

/** Storage path segment for Fal-generated hero WebPs (upload via `npm run email:generate-heroes`). */
export function emailHeroStoragePath(templateType: EmailTemplateType): string {
  return `heroes/${templateType}.webp`;
}

export function emailHeroImageUrl(templateType: EmailTemplateType): string {
  return emailAssetUrl(emailHeroStoragePath(templateType));
}

/** Local repo path for generated heroes before Supabase upload. */
export function emailHeroLocalRelativePath(templateType: EmailTemplateType): string {
  return `public/assets/email/heroes/${templateType}.webp`;
}
