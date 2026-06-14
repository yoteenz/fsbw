import { hexForConsultHairColor } from './consultStyleAnalysisCatalog.js';
import {
  displayStyle,
  lengthBodyPlacementPromptLine,
  partPlacementPromptLine,
} from './hairstyleAnalysisDisplay.js';
import type { FalAnalysisLook } from './hairstyleAnalysisFalPrompt.js';
import { lookHairAccuracyLines } from './hairstyleAnalysisUnitCatalog.js';

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

/** Hair-only step for wig consult template cards — selfie + inspo → TOP MATCH hair before template pass. */
export function buildConsultClientPreviewHairOnlyPrompt(
  look: FalAnalysisLook,
  clientName: string
): string {
  const name = clientName.trim().toUpperCase() || 'CLIENT';
  const style = displayStyle(look.styling, look.unit);
  return [
    `Edit IMAGE 1 — client selfie for ${name}. IMAGE 2 = hair inspiration reference. Output ONE photo-realistic portrait.`,
    '',
    '=== FACE IDENTITY LOCK (HIGHEST PRIORITY) ===',
    'IMAGE 1 is the real client — copy face pixels exactly: same eyes, nose, lips, cheeks, brows, skin tone, bone structure, expression, and age.',
    'Hair edits apply ONLY in the hair region — never regenerate, repaint, beautify, or alter facial skin.',
    '',
    buildConsultInspoMatchPrompt(),
    '',
    '=== CATALOG MANIFEST (SUGGESTED BUILD SPECS — MATCH VISUALLY) ===',
    lookHairAccuracyLines(look),
    lengthBodyPlacementPromptLine(look.length),
    partPlacementPromptLine(look.part),
    `STYLE ${style} — match inspo salon finish when visible; otherwise natural ${look.unit.trim().toUpperCase()} texture.`,
    '',
    'OUTPUT: the **same person** as IMAGE 1 wearing the **exact inspo hairstyle** from IMAGE 2, tinted to manifest COLOR — portrait ready for hairstyle analysis template placement.',
  ].join('\n');
}

export function consultInspoTemplateLockBlock(): string {
  return [
    '=== WIG CONSULT — INSPO HAIRSTYLE LOCK (PREMIUM 4 PICK) ===',
    'TOP MATCH portrait = inspo hairstyle on the client (pre-edited upstream) at manifest COLOR.',
    'MATCH 02–04 thumbnails = **same client, same pose, same inspo hairstyle geometry** — change **COLOR only** per manifest.',
    'All four looks share the same cut, length, curl pattern, part, and styling — only catalog COLOR differs.',
    'FORBIDDEN: different lengths, units, or salon shapes across MATCH 02–04; color-swap thumbs that change the inspo silhouette.',
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
