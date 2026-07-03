import heroData from './emailHeroPrompts.data.json' with { type: 'json' };
import type { EmailTemplateType } from './types.js';

/** Shared visual language for all Frontal Slayer transactional email hero scenes. */
export const EMAIL_HERO_BASE_STYLE = `Frontal Slayer luxury email hero graphic. Tall portrait 2:3 composition designed for HTML headline and CTA overlay on the upper third.
Photorealistic 3D on white marble with subtle gray veins. Upper 38%: soft clean marble gradient, gentle vignette, minimal detail — empty safe zone reserved for text overlay. Lower 62%: frosted glass cube or pedestal centered with product scene, soft white glow, thin luminous edges, crimson roses and clear-cut diamonds at the base.
High-end feminine luxury aesthetic, crimson accent #EB1C24, soft studio lighting, shallow depth of field.
NO text, NO logos, NO watermarks, NO UI chrome. Editorial email hero background only.`;

/** Fal model for email hero generation (edit with marble reference). */
export const EMAIL_HERO_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

/** Per-template hero scene prompts — match reference design boards (Rewards, Affiliate, Account, Orders, Shop). */
export const EMAIL_HERO_PROMPTS = heroData.prompts as Record<EmailTemplateType, string>;

export function emailHeroPromptFor(templateType: EmailTemplateType): string {
  return EMAIL_HERO_PROMPTS[templateType] || EMAIL_HERO_PROMPTS.welcome;
}
