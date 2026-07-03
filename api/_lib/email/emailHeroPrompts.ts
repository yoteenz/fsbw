import heroData from './emailHeroPrompts.data.json' with { type: 'json' };
import meta from './emailHeroPromptMeta.json' with { type: 'json' };
import type { EmailTemplateType } from './types.js';

/** Official Frontal Slayer SLAYER wordmark PNG — composited onto heroes in post (`public/assets/email/slayer-logo.png`). */
export const EMAIL_HERO_LOGO_REF_RELATIVE = 'public/assets/email/slayer-logo.png';

/** @deprecated Use emailHeroPromptMeta.json — kept for docs/scripts that grep this export. */
export const EMAIL_HERO_BASE_STYLE = meta.composition;

/** @deprecated Use emailHeroPromptMeta.json */
export const EMAIL_HERO_LOGO_AUTHENTICITY_PROMPT = meta.logoAuthenticity;

/** Fal model for email hero generation (edit with marble + logo references). */
export const EMAIL_HERO_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

/** Per-template purpose-specific hero scenes (3D subject tied to email intent). */
export const EMAIL_HERO_PURPOSE_SCENES = heroData.purposeScenes as Record<EmailTemplateType, string>;

/** @deprecated Prefer EMAIL_HERO_PURPOSE_SCENES */
export const EMAIL_HERO_PROMPTS = EMAIL_HERO_PURPOSE_SCENES;

export function buildEmailHeroPrompt(templateType: EmailTemplateType): string {
  const scene =
    EMAIL_HERO_PURPOSE_SCENES[templateType] || EMAIL_HERO_PURPOSE_SCENES.welcome;
  return [
    meta.composition,
    meta.quality,
    meta.brandRules,
    `Email purpose & hero subject: ${scene}`,
    meta.logoAuthenticity,
  ].join('\n\n');
}

export function emailHeroPromptFor(templateType: EmailTemplateType): string {
  return buildEmailHeroPrompt(templateType);
}
