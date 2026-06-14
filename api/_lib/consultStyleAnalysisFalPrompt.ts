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
    'If IMAGE 2 has bangs/fringe/curtain bangs, recreate the bang length, split, density, and face-framing blend exactly. If IMAGE 2 has no bangs, do not add bangs.',
    'Copy hair **color family and saturation** from IMAGE 2 as closely as the BAW catalog color allows; colored units must stay vivid and uniform, not muted or shifted to brown/black.',
    'Copy the apparent length from IMAGE 2 — do **not** extend the hair longer than the reference photo or add extra waist/hip/thigh length.',
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
    `STYLE ${style} — this is the closest BAW label for the photographed inspo. The visual hairstyle must follow IMAGE 2 first; do not collapse unique inspo styling into generic LAYERS or NONE.`,
    '',
    'OUTPUT: the **same person** as IMAGE 1 wearing the **exact inspo hairstyle** from IMAGE 2, recolored only as needed to the manifest catalog COLOR — portrait ready for hairstyle analysis template placement.',
  ].join('\n');
}

export function consultInspoTemplateLockBlock(): string {
  return [
    '=== WIG CONSULT — INSPO HAIRSTYLE LOCK (1 PICK + 4 PICK) ===',
    'IMAGE 2 is the approved pre-edited consult portrait: client identity from selfie + exact inspo hairstyle already applied.',
    'TOP MATCH portrait must preserve IMAGE 2 hair geometry exactly while fitting the template: same length, cut, curl/wave/crimp pattern, volume, bangs/fringe if present, part, ends, and drape.',
    'Use manifest TEXTURE / STYLE / LENGTH as printed BAW specs and light guardrails only; they must not replace the photographed inspo silhouette with a generic catalog wig.',
    'BAW styling reference images are secondary in consult mode. If a styling reference conflicts with IMAGE 2, preserve IMAGE 2.',
    'If the card contains MATCH 02–04 thumbnails: use **same client, same pose, same inspo hairstyle geometry** — change **COLOR only** per manifest.',
    'All consult comparison looks share the same cut, length, curl pattern, bangs/fringe, part, and styling — only catalog COLOR differs.',
    'FORBIDDEN: different lengths, units, or salon shapes across MATCH 02–04; color-swap thumbs that change the inspo silhouette; adding bangs when IMAGE 2 has none; removing bangs when IMAGE 2 has them.',
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
