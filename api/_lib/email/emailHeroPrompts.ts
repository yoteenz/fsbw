import heroData from './emailHeroPrompts.data.json' with { type: 'json' };
import type { EmailTemplateType } from './types.js';

/** Shared visual language for all Frontal Slayer transactional email hero scenes. */
export const EMAIL_HERO_BASE_STYLE = `Frontal Slayer luxury email hero scene. Photorealistic 3D render on white marble with subtle gray veins.
Frosted glassmorphism display cube or glass pedestal at center with soft white glow and thin luminous edges.
Realistic crimson red roses and sparkling clear-cut diamonds scattered around the base.
High-end feminine luxury aesthetic, crimson accent color #EB1C24, soft studio lighting, shallow depth of field.
NO text, NO logos, NO watermarks, NO UI chrome. Clean isolated hero illustration for email header.`;

/** Fal model for email hero generation (edit with marble reference). */
export const EMAIL_HERO_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

/** Per-template hero scene prompts — match reference design boards (Rewards, Affiliate, Account, Orders, Shop). */
export const EMAIL_HERO_PROMPTS = heroData.prompts as Record<EmailTemplateType, string>;

/** Fal model for email hero generation (edit with marble reference). */
export const EMAIL_HERO_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

/** Per-template hero scene prompts — match reference design boards (Rewards, Affiliate, Account, Orders, Shop). */
export const EMAIL_HERO_PROMPTS = heroData.prompts as Record<EmailTemplateType, string>;

export function emailHeroPromptFor(templateType: EmailTemplateType): string {
  return EMAIL_HERO_PROMPTS[templateType] || EMAIL_HERO_PROMPTS.welcome;
}
