import heroData from './emailHeroPrompts.data.json' with { type: 'json' };
import type { EmailTemplateType } from './types.js';

/** Official Frontal Slayer logo PNG — always attach as Fal edit reference (`public/assets/email/slayer-logo.png`). */
export const EMAIL_HERO_LOGO_REF_RELATIVE = 'public/assets/email/slayer-logo.png';

/** Shared visual language for all Frontal Slayer transactional email hero scenes. */
export const EMAIL_HERO_BASE_STYLE = `Frontal Slayer luxury email hero graphic. Tall portrait 2:3 composition designed for HTML headline and CTA overlay on the upper third.
Photorealistic 3D on white marble with subtle gray veins. Upper 38%: soft clean marble gradient, gentle vignette, minimal detail — empty safe zone reserved for text overlay. Lower 62%: frosted glass cube or pedestal centered with product scene, soft white glow, thin luminous edges, crimson roses and clear-cut diamonds at the base.
High-end feminine luxury aesthetic, crimson accent #EB1C24, soft studio lighting, shallow depth of field.
NO invented logos, fake monograms, or alternate brand marks. NO watermarks or UI chrome. NO marketing headline text in the image (HTML overlays headline separately). Editorial email hero background only.`;

/** Appended to every hero prompt — logo reference image is always attached at generation time. */
export const EMAIL_HERO_LOGO_AUTHENTICITY_PROMPT = `Logo authenticity (critical): A Frontal Slayer logo reference image is attached. If any brand mark, seal, wax stamp, shopping bag logo, monogram, or embossed mark appears in the scene, reproduce ONLY that exact logo — crimson red stylized FS monogram with FRONTAL SLAYER text fully legible. Do NOT invent, redraw, substitute, abbreviate, or stylize a different logo. No other logos or brand marks anywhere in the scene.`;

/** Fal model for email hero generation (edit with marble + logo references). */
export const EMAIL_HERO_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

/** Per-template hero scene prompts — match reference design boards (Rewards, Affiliate, Account, Orders, Shop). */
export const EMAIL_HERO_PROMPTS = heroData.prompts as Record<EmailTemplateType, string>;

export function emailHeroPromptFor(templateType: EmailTemplateType): string {
  const scene = EMAIL_HERO_PROMPTS[templateType] || EMAIL_HERO_PROMPTS.welcome;
  return `${scene}\n\n${EMAIL_HERO_LOGO_AUTHENTICITY_PROMPT}`;
}
