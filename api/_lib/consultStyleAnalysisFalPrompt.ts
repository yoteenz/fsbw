import { hexForConsultHairColor } from './consultStyleAnalysisCatalog.js';

export function buildConsultInspoMatchPrompt(): string {
  return [
    '=== WIG CONSULT STYLE ANALYSIS — INSPO MATCH (NOT PSA / NOT TEMPLATE CARD) ===',
    'IMAGE 1 = client selfie — **face identity lock** (eyes, nose, lips, skin tone, bone structure, expression, age).',
    'IMAGE 2 = hair inspiration reference — **hairstyle geometry lock** (length, cut, curl/wave pattern, volume, layers, parting, silhouette, drape).',
    '',
    'OUTPUT: ONE photorealistic front portrait of the **same person** as IMAGE 1 wearing the **exact hairstyle** from IMAGE 2.',
    'Copy from IMAGE 2: length, texture, curl/wave pattern, layering, part, volume, ends, and overall silhouette — not a generic catalog wig guess.',
    'Copy hair **color** from IMAGE 2 as closely as possible.',
    'FACE/BODY: IMAGE 1 only — never swap identity, never copy a model from IMAGE 2.',
    'Edit **hair strands only** — keep neck, shoulders, clothing, and pose from IMAGE 1.',
    'Soft neutral studio background. No visible wig cap, lace grid, or text overlays.',
    'No beauty filter. No second person.',
  ].join('\n');
}

export function buildConsultColorVariantPrompt(color: string): string {
  const hex = hexForConsultHairColor(color);
  const label = color.trim().toUpperCase();
  return [
    '=== WIG CONSULT STYLE ANALYSIS — COLOR VARIANT (HAIRSTYLE LOCKED) ===',
    'IMAGE 1 = approved inspo-match portrait — client face + exact inspo hairstyle already applied.',
    '',
    `Recolor **only** the hair strands uniformly to **${label}** (${hex}) root to tip.`,
    'DO NOT change length, cut, curl pattern, layering, part, volume, drape, face, skin, or pose.',
    'Same person, same pose, same hairstyle geometry — **catalog color swap only**.',
    'No visible wig cap. No text overlays.',
  ].join('\n');
}
