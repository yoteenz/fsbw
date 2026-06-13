/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * Overall score % and match-rating stars are server-composited at petite pixel sizes after Fal.
 * TOP MATCH specs, MATCH 02–04 row values, every-detail-matters lines, client preview photo are Fal in-image.
 */

import {
  bawColorApplicationRulesBlock,
  bawUnitCatalogBlock,
  lookHairAccuracyLines,
  requiresUniformRootToTipColor,
  unitTexturePromptLine,
} from './hairstyleAnalysisUnitCatalog.js';
import {
  bawStylingRefListBlock,
  stylingRefForLook,
  type HairstyleAnalysisStylingRef,
} from './hairstyleAnalysisBawStylingRefs.js';
import { TOP_SCORE_SLOT, RATING_SLOT } from './hairstyleAnalysisLayoutSlots.js';
import { matchRatingFalStarSize, overallScoreFalFontSize } from './hairstyleAnalysisTextPaths.js';
import { clientFullName, type MannequinRefIndex } from './hairstyleAnalysisMannequinRefs.js';
import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
  formatScorePercent,
  matchRatingFilledStarsFromScore,
  EVERY_DETAIL_MATTERS_MAX_CHARS,
} from './hairstyleAnalysisDisplay.js';

import {
  everyDetailMattersRowGuide,
  formatEveryDetailMattersForFal,
  type EveryDetailMattersFaceFeatures,
} from './hairstyleAnalysisEveryDetailMatters.js';

export type FalAnalysisLook = {
  rank: number;
  unit: string;
  color: string;
  hex: string;
  length: string;
  lace: string;
  density: string;
  hairline: string;
  part: string;
  styling: string;
  score: number;
  rating: number;
};

export type FalHairstyleAnalysis = {
  clientName: string;
  tier: 'free' | 'three_month' | 'six_month' | 'twelve_month' | 'black';
  topMatch: FalAnalysisLook;
  additionalLooks: FalAnalysisLook[];
  whyItWorks: string[];
  everyDetailFaceFeatures?: EveryDetailMattersFaceFeatures;
};

export type FalPromptImageRefs = {
  mannequinRefs: MannequinRefIndex[];
  stylingRefs: HairstyleAnalysisStylingRef[];
};

export type FalPromptBuildOptions = {
  /** @deprecated Fal always uses Covered By Your Grace for OVERALL SCORE — ignored. */
  overallScoreFontLabel?: string;
};

const BRAND_RED = '#EB1C24';
const MATCH_SCORE_GRAY = '#808080';
/** Permanent OVERALL SCORE typography — red handwritten script (site brand accent). */
const OVERALL_SCORE_CANONICAL_FONT = 'Covered By Your Grace';

/** Fal GPT Image 2 `prompt` field hard limit (422 if exceeded). */
export const HAIRSTYLE_ANALYSIS_FAL_PROMPT_MAX_CHARS = 32_000;

function normalizeTier(tier: FalHairstyleAnalysis['tier']): Exclude<FalHairstyleAnalysis['tier'], 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

function mannequinIndexForUnit(refs: { mannequinRefs: MannequinRefIndex[] }, unit: string): number | null {
  const u = unit.trim().toUpperCase();
  const hit = refs.mannequinRefs.find((r) => r.unit === u);
  return hit?.imageIndex ?? null;
}

function mannequinRefLine(unit: string, refs: { mannequinRefs: MannequinRefIndex[] }, stylingRaw: string): string {
  const idx = mannequinIndexForUnit(refs, unit);
  if (!idx) return '';
  const style = displayStyle(stylingRaw, unit);
  const shapeNote =
    style !== 'NONE'
      ? 'Mannequin = **hair-strand texture + hair-end drape direction only** (above the collarbone). Salon finish comes from the BAW styling reference IMAGE — not the mannequin default shape.'
      : 'Copy **hair** curl pattern, strand definition, volume, and one-shoulder drape from that mannequin — hair region only.';
  return [
    `Optional hair guide — IMAGE ${idx} (${unit} mannequin front):`,
    shapeNote,
    'NECK/BODY LOCK: do NOT copy mannequin neck, throat, collarbones, shoulders, chest, or skin — keep IMAGE 2 client anatomy exactly.',
    'HAIRLINE LOCK: do NOT copy mannequin baby hairs or black edge wisps — retint any edge strands to the look catalog color.',
  ].join(' ');
}

function neckAndBodyPreservationBlock(): string {
  return [
    '=== NECK + SHOULDERS — CLIENT ANATOMY LOCK (CRITICAL) ===',
    'IMAGE 2 (client selfie) is the **only** source for neck, throat, collarbones, shoulders, and visible skin below the hairline.',
    'Hair edits apply in the **hair region only** (strands from crown/hairline down to hair ends).',
    'FORBIDDEN: elongating, slimming, or repainting the neck; mannequin neck geometry; pasted mannequin throat; warped collarbone; plastic neck skin; hair covering the neck unnaturally to hide edits.',
    'If a mannequin reference IMAGE is attached: use it for **hair strand texture and hair-end drape direction only** — never replace the client neck or shoulders.',
  ].join('\n');
}

/** Front portrait drape — one-shoulder hair placement (prompt-led; mannequin IMAGE optional). */
function asymmetricOneShoulderDrapeBlock(scope: 'all_photos' | 'thumbnails_only', hasMannequinRefs: boolean): string {
  const scopeLine =
    scope === 'all_photos'
      ? 'Applies to the **main client preview** AND **every MATCH 02–04 thumbnail** — identical shoulder geometry on all photos.'
      : '**MATCH 02–04 thumbnails only:** use the **same** one-shoulder drape as the main client preview — never revert to both-shoulder hair on small squares.';

  const mannequinNote = hasMannequinRefs
    ? 'When a unit mannequin IMAGE is attached: borrow **hair-end drape direction** only — not neck or shoulder anatomy.'
    : 'Follow these drape rules from the prompt — no mannequin IMAGE is attached for body geometry.';

  return [
    '=== HAIR DRAPE — ONE SHOULDER ONLY (CRITICAL) ===',
    scopeLine,
    'Long hair uses **asymmetric one-shoulder drape** — heavy cascade on one shoulder only, other shoulder kept clear.',
    '**FORWARD DRAPE (only heavy cascade):** length falls **forward over the model\'s LEFT shoulder** — **right side of the image** (viewer\'s right). This is the **only** shoulder with thick hair down the chest.',
    '**BEHIND / CLEAR SHOULDER:** on the model\'s **RIGHT shoulder** — **left side of the image** (viewer\'s left) — sweep hair **behind** the shoulder or tuck it back so the shoulder cap, neck line, and jewelry stay **visible**. No thick forward hair on this shoulder.',
    '**FORBIDDEN:** symmetrical curtain on **both** shoulders, twin waterfalls, equal hair mass left and right, mirrored twin drape, or “balanced” split over both collarbones.',
    '**Self-check:** if MATCH thumbnails show thick hair forward on **both** shoulders while the hero shows one-shoulder drape → **failed**.',
    mannequinNote,
  ].join('\n');
}

function clientPreviewTabLine(): string {
  return [
    'CLIENT PREVIEW TAB (white pill above main photo, rose icon on left):',
    'REPLACE the words "CLIENT PREVIEW" inside that pill with "TOP MATCH" — same pill shape, rose icon, border, and position.',
    'Paint over the old pill letters completely — **one crisp text layer only** (no offset duplicate, shadow echo, or red/black ghost copy).',
    'Do NOT add "TOP MATCH" as separate text below, above, beside, or floating over the portrait.',
    `Pill text: brand red ${BRAND_RED}, uppercase "TOP MATCH", bold sans-serif inside the pill only.`,
  ].join('\n');
}

function topMatchHeaderLine(fullName: string): string {
  return [
    '=== CLIENT NAME HEADER (ABOVE OVERALL SCORE PANEL) ===',
    'The template prints black uppercase "TOP MATCH" as a section header directly above the OVERALL SCORE / MATCH RATING panels on the right.',
    `REPLACE that black "TOP MATCH" header with "${fullName}" — the client's first and last name, uppercase.`,
    'Erase the old header letters first — **single clean text layer** (no double-print, ghost offset, or stacked duplicates).',
    'Use the same black Futura PT Medium style, size, weight, and letter-spacing as the original header — only swap the words.',
    '**Center the client name horizontally within the frosted header panel** above OVERALL SCORE and MATCH RATING — equal padding left and right; do NOT left-align.',
    'Do NOT leave "TOP MATCH" visible in that header slot. Do NOT duplicate the client name in the red pill (pill stays "TOP MATCH" only).',
  ].join('\n');
}

function templateTextIntegrityBlock(): string {
  return [
    '=== TEMPLATE TEXT — NO GHOST / DUPLICATE LAYERS ===',
    'When replacing template words (pill, header, value slots): paint over old text fully, then print **one** crisp layer.',
    'FORBIDDEN: offset duplicate text (red/black echo), shadow stacks, semi-transparent ghost copies, or printing the same label twice.',
    'Keep "FRONTAL SLAYER" and "hairstyle analysis" header art from IMAGE 1 untouched — do not re-render or duplicate them.',
  ].join('\n');
}

function colorValueLine(look: FalAnalysisLook): string {
  return `COLOR: ${look.color}`;
}

/** Hair-edit guidance only — hex guides retint; never print hex on template value fields. */
function colorHairGuidanceLine(look: FalAnalysisLook): string {
  return lookHairAccuracyLines(look).split('\n')[1] ?? '';
}

function realisticHairRecolorBlock(): string {
  return [
    '=== HAIR COLOR — REALISTIC STRAND REPAINT (NOT AN OVERLAY) ===',
    'Recolor at strand level with believable shine and lighting — **pigment stays one BAW catalog tone root to tip** (see color rules).',
    'Include **hairline baby hairs, edge wisps, and temple flyaways** in the recolor — they must match the assigned catalog color, not stay black from IMAGE 2 or mannequin refs.',
    'Match scene lighting from the selfie — believable shadows inside curls and dimension at the part.',
    'FORBIDDEN: flat color wash, semi-transparent tint, dark roots on fashion colors, black baby hairs on colored installs, ombré, color filter overlay, posterized hair, sticker-like hair, or wig-cap color block.',
    'Hair must look fully installed and photographed — not a colored layer pasted on top of the original hair.',
  ].join('\n');
}

function styledHairLine(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  const style = displayStyle(look.styling, look.unit);
  if (style === 'NONE') {
    return refs.mannequinRefs.length > 0
      ? `Finish hair matching ${unitTexturePromptLine(look.unit)} Use mannequin for strand direction only.`
      : unitTexturePromptLine(look.unit);
  }
  const stylingRef = stylingRefForLook(refs.stylingRefs, look.styling, look.part, look.unit);
  if (stylingRef) {
    const hex = (look.hex || '#000000').toUpperCase();
    return [
      `STYLE **${style}** — print exactly "${style}" in the STYLE value field (never substitute LAYERS unless STYLE is LAYERS or DEFINE).`,
      `Hairstyle shape: copy **hair strands only** from IMAGE ${stylingRef.imageIndex} (BAW ${style} reference, ${stylingRef.part} part) — **never** copy head pose, profile angle, or neck rotation from that IMAGE.`,
      `Match the curl, crimp, straight, or defined-curl pattern from IMAGE ${stylingRef.imageIndex} exactly; retint strands to uniform ${look.color} (${hex}) root to tip — no dark roots; hairline edge wisps same ${look.color}, not black.`,
      'The styling reference IMAGE overrides the unit mannequin default finish — do NOT apply layered waves when STYLE is FLAT IRON or CRIMPS/WAND CURLS.',
      'Do not invent a different salon finish.',
    ].join(' ');
  }
  return `Apply BAW salon styling **${style}** only — print STYLE as "${style}"; do not default to LAYERS or invent a new curl/crimp/straight pattern.`;
}

function salonStylingPriorityBlock(): string {
  return [
    '=== SALON STYLING — EACH MATCH HAS ITS OWN STYLE (CRITICAL) ===',
    'Every look has a distinct STYLE value (LAYERS, FLAT IRON, CRIMPS, WAND CURLS, DEFINE, or NONE).',
    'When STYLE is not NONE: the matching BAW styling reference IMAGE is the **authoritative** salon finish for that look.',
    'Styling reference IMAGE = **hair curl/crimp/straight/layer pattern only** — IMAGE 2 keeps the master head + body pose on every photo.',
    'Unit mannequin IMAGE (when attached) = hair-strand texture + hair-end drape only — **not** neck/shoulders and **not** the salon finish when a styling IMAGE is assigned.',
    'FORBIDDEN: rendering every match with the same layered/wavy finish; printing LAYERS in STYLE when the assigned style is FLAT IRON, CRIMPS, WAND CURLS, or DEFINE;',
    'using the TOP MATCH hairstyle on MATCH 02–04 thumbnails.',
    'Curly units (SOFT CURL, OCEAN CURL): STYLE **DEFINE** replaces LAYERS; **WAND CURLS** replaces CRIMPS — print and render those ids exactly.',
  ].join('\n');
}

function matchStylingManifestBlock(analysis: FalHairstyleAnalysis, refs: FalPromptImageRefs): string {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return '';

  const lines: string[] = [
    '=== MATCH 02–04 — STYLE + STYLING IMAGE BINDING (MANDATORY) ===',
    'Each row below: print STYLE exactly as given; thumbnail hair must match that style via the listed IMAGE (if any).',
  ];

  const allLooks = [analysis.topMatch, ...analysis.additionalLooks.slice(0, 3)];
  allLooks.forEach((look, i) => {
    const label = i === 0 ? 'TOP MATCH / CLIENT PREVIEW' : `MATCH ${String(i + 1).padStart(2, '0')}`;
    const style = displayStyle(look.styling, look.unit);
    const ref = stylingRefForLook(refs.stylingRefs, look.styling, look.part, look.unit);
    const refNote = ref ? `IMAGE ${ref.imageIndex}` : 'mannequin texture only';
    lines.push(`${label}: STYLE ${style}, PART ${displayPart(look.part)} (one part only on thumb), COLOR ${look.color.trim().toUpperCase()} uniform root to tip if vivid/blonde, ${refNote}`);
  });

  return lines.join('\n');
}

function hairPartLockBlock(): string {
  return [
    '=== HAIR PART — ONE PART ONLY (CRITICAL — ALL PHOTOS) ===',
    'Each look has **exactly one** PART (MIDDLE, LEFT, or RIGHT) — render **only one** scalp part line for that look.',
    'Use the **assigned PART** from the manifest / MATCH row — erase IMAGE 2\'s original part if it differs.',
    'Styling reference IMAGE = salon **shape/finish** for that STYLE — parting on the client must still be **only** the assigned PART.',
    'When multiple styling IMAGEs are attached: use **only** the IMAGE whose STYLE + PART match **that specific look** — never borrow a part line from another IMAGE.',
    'FORBIDDEN: two part lines at once (middle + side), ghost/double part, T-part, zigzag dual part, or center part plus side-swept root on the same head.',
    'Self-check: count visible scalp part lines — must be **exactly one** per photo.',
  ].join('\n');
}

function uniformRootColorBlock(look: FalAnalysisLook, scope: 'preview' | 'thumbnail'): string {
  const color = look.color.trim().toUpperCase();
  const hex = (look.hex || '#000000').toUpperCase();
  if (!requiresUniformRootToTipColor(color) && color !== 'JET BLACK' && color !== 'OFF BLACK') {
    return `COLOR ${color}: strand-level recolor on ${scope} — natural depth within ${color} only.`;
  }
  if (color === 'JET BLACK' || color === 'OFF BLACK' || color === 'ESPRESSO') {
    return `COLOR ${color}: natural brunette/black depth on ${scope} — no fashion-color root band under a different body tone.`;
  }
  return [
    `COLOR ${color} on ${scope}: **uniform ${color} pigment root to tip** (${hex}) — full install one tone.`,
    `Repaint scalp, lace line, regrowth zone, and ends — **IMAGE 2 dark/black roots must not show through** on ${color}.`,
    `FORBIDDEN on ${scope}: dark roots, black roots, shadow root band, ombré, or two-tone regrowth under ${color}.`,
  ].join(' ');
}

function clientPhotoPanelRulesBlock(): string {
  return [
    '=== TOP MATCH CLIENT PHOTO — LEFT PANEL ===',
    'Place IMAGE 2 in the left-panel photo window on IMAGE 1:',
    '1) **Remove the background** — subject only; template marble shows through behind her.',
    '2) **9:16 portrait** — center the subject horizontally in the window.',
    '3) **Position near the bottom** of the panel — anchor the subject low in the frame.',
    '4) **Symmetrical even bottom fade** — soft transparent gradient on the lower edge (same width left and right); hair/body dissolves into marble; no hard cut line.',
    '5) **Mirror reflection below the fade** — fill the empty lower panel space (between the fade line and panel bottom) with a **vertical flip** of the lower hair/neck/choker area; **very low transparency** (~8–12% peak, fading to invisible at the panel bottom); soft glossy floor reflection — not a second portrait or duplicate face.',
    'Edit **hair only** for TOP MATCH — face, skin, neck, and clothing stay identical to IMAGE 2.',
    'FORBIDDEN: visible studio backdrop, white polaroid mat, inset smaller photo, duplicate portrait layer, opaque white bar, or harsh empty white void below the fade.',
    'MATCH thumbnails: same face and **same head/body pose** as IMAGE 2; tighter square crop; one-shoulder drape; bg removed.',
  ].join('\n');
}

function clientPreviewHairLine(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  const part = displayPart(look.part);
  return [
    '=== TOP MATCH HAIR (IMAGE 2) ===',
    `${look.unit}, ${look.color}, ${displayLength(look.length)}, STYLE ${displayStyle(look.styling, look.unit)}, PART ${part}, ${displayDensity(look.density)}.`,
    `PART ${part} only — one scalp part line; erase IMAGE 2 part if different.`,
    uniformRootColorBlock(look, 'preview'),
    lookHairAccuracyLines(look),
    styledHairLine(look, refs),
    mannequinRefLine(look.unit, refs, look.styling),
  ]
    .filter(Boolean)
    .join('\n');
}

function sharedClientPhotoRulesBlock(): string {
  return [
    faceIdentityLockBlock(),
    clientPoseLockBlock(),
    clientPhotoPanelRulesBlock(),
    'Recolor hair to catalog color/texture at strand level — face and skin untouched.',
    hairlineRulesBlock(),
  ].join('\n\n');
}

function hairlineRulesBlock(): string {
  return [
    'HAIRLINE: clean lace-front edge — do NOT copy black baby hairs or wispy edge fuzz from mannequin or styling reference IMAGEs.',
    'Any baby hairs, temple flyaways, or edge wisps already in IMAGE 2 or at the lace line must be **recolored to the assigned catalog hair color** (same pigment as the main install) — never left jet black when hair is CHERRY, PLATINUM, etc.',
    'Do not invent heavy new baby-hair clutter; do not leave original dark edge strands unpainted on fashion-color looks.',
  ].join('\n');
}

function faceIdentityLockBlock(): string {
  return [
    '=== FACE IDENTITY LOCK (CRITICAL — ALL CLIENT PHOTOS) ===',
    'COPY the client\'s EXACT face from IMAGE 2 — same eyes, nose, lips, cheeks, brows, skin tone, bone structure, expression, and age.',
    'Facial skin pixels must match IMAGE 2 — do NOT regenerate, repaint, beautify, smooth, slim, or alter the face in any way.',
    'Hair edits apply ONLY inside the hair region (strands above the forehead/temples and below the crown) — never on facial skin.',
    'FORBIDDEN: face swap, different person, AI beauty filter, plastic skin, changed ethnicity, new makeup, or shrinking the face to reduce hair volume.',
  ].join('\n');
}

function clientPoseLockBlock(): string {
  return [
    '=== HEAD + BODY POSE LOCK — IMAGE 2 IS MASTER (ALL PHOTOS) ===',
    'IMAGE 2 (client selfie) is the **only** source for head angle, neck rotation, shoulder line, gaze direction, and facial orientation.',
    'Applies to **TOP MATCH client preview** AND **every MATCH 02–04 thumbnail** — all must show the **same pose** as IMAGE 2.',
    'BAW styling reference IMAGEs and unit mannequin IMAGEs are **hair strand finish only** — never copy their head yaw, profile angle, 3/4 turn, or body rotation onto the client.',
    'FORBIDDEN: profile or side-view thumbnails when IMAGE 2 is frontal; turning the client to match a styling ref; different head angles across MATCH 02 vs MATCH 03 vs MATCH 04.',
    'Self-check: every MORE MATCHES square must look like the **same client in the same pose** as IMAGE 2 — only hair color, texture, and style change.',
  ].join('\n');
}

function realisticHairDensityBlock(densityLabel: string, isThumbnail = false): string {
  const thumbNote = isThumbnail
    ? 'Thumbnail: hair strand bulk may be slightly lighter than the main preview — adjust HAIR STRANDS ONLY, never the face.'
    : 'Main preview: natural installed fullness from catalog density — not wig-cap helmet volume.';
  return [
    '=== HAIR DENSITY — HAIR STRANDS ONLY (FACE UNTOUCHED) ===',
    `Target catalog density: ${densityLabel}. ${thumbNote}`,
    'Visible strand separation and believable weight at the ends — in the hair region only.',
    'FORBIDDEN: helmet hair, uniform plastic volume, bouffant crown, or repainting the face/cheeks/jaw to fake lower hair volume.',
  ].join('\n');
}

function matchThumbnailBlock(label: string, look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  const style = displayStyle(look.styling, look.unit);
  const part = displayPart(look.part);
  const ref = stylingRefForLook(refs.stylingRefs, look.styling, look.part, look.unit);
  const refNote = ref ? `salon shape from IMAGE ${ref.imageIndex}` : 'mannequin hair texture only';
  return [
    `${label} THUMB: same client face **and same head/body pose** as IMAGE 2; tight face/neck crop; ${look.unit}, ${look.color}, ${displayLength(look.length)}, STYLE ${style}, PART ${part} (${refNote}); one-shoulder drape; hair-only edits.`,
    'Keep IMAGE 2 head angle, gaze, and shoulder line — **never** turn the client profile or 3/4 to match a styling/mannequin IMAGE.',
    `PART ${part} **only** on this thumb — one scalp line; erase any other part from IMAGE 2 or other refs.`,
    uniformRootColorBlock(look, 'thumbnail'),
    lookHairAccuracyLines(look),
    realisticHairDensityBlock(displayDensity(look.density), true),
    mannequinRefLine(look.unit, refs, look.styling),
  ]
    .filter(Boolean)
    .join('\n');
}

function everyDetailMattersStructureBlock(lineCount: number): string {
  const rowGuide = everyDetailMattersRowGuide(lineCount).join('; ');
  return [
    '=== EVERY DETAIL MATTERS PANEL — SPEC ROWS ONLY (NOT WHY IT WORKS) ===',
    'The script header "every detail matters" and rose bullet icons are pre-rendered on IMAGE 1.',
    `Fill exactly ${lineCount} text rows — **one short line per rose row** (single row, no wrap).`,
    `Row map: ${rowGuide}.`,
    '**FORMAT:** each line = **TOP MATCH catalog spec value** + **one concrete fit note** (eyes, jaw, face shape, or install benefit).',
    '**GOOD:** MELTED LACE, NATURAL HAIRLINE | PLATINUM TO COMPLEMENT YOUR BLACK ALMOND EYES | SOFT WAVE TO FRAME YOUR HEART SHAPED FACE | FLAT IRON TO ENHANCE YOUR JAWLINE | 24 INCHES AT MID CHEST LENGTH',
    'Lace rose row = **MELTED LACE, {HAIRLINE} HAIRLINE** — adjective before noun; never "LACE MELTED" or "HAIRLINE NATURAL".',
    '**BAD (FORBIDDEN):** empowerment slogans, you deserve, embrace your beauty, confidence, queen energy, generic inspiration — NOT why-it-works essays.',
    `Each line ≤ ${EVERY_DETAIL_MATTERS_MAX_CHARS} chars — **no trailing period**, **no dashes or hyphens**.`,
    'Print each EVERY DETAIL MATTERS LINE below **verbatim** — black uppercase Futura PT Medium beside its rose icon.',
    'Do **not** invent new bullets — use **only** the numbered lines in this prompt.',
  ].join('\n');
}

const EVERY_DETAIL_MATTERS_FORBIDDEN_PHRASES = [
  'every detail matters',
  'you deserve',
  'embrace your',
  'own your',
  'slay',
  'queen',
  'goddess',
  'confidence',
  'unique beauty',
  'powerful',
  'unstoppable',
  'shine',
  'flawless',
  'beautiful',
  'gorgeous',
  'stunning',
  'elevate',
  'transform',
  'empower',
  'long face',
  'wide face',
  'narrow chin',
  'high forehead',
  'big forehead',
  'lace melted',
  'hairline natural',
].join(', ');

function everyDetailMattersRulesBlock(lineCount: number): string {
  return [
    everyDetailMattersStructureBlock(lineCount),
    '',
    '=== EVERY DETAIL MATTERS LINES (PRINT VERBATIM — ZERO REWRITES) ===',
    'Copy each numbered line below **character-for-character**. Do not paraphrase, wrap, or rewrite into empowerment / inspirational copy.',
    'These lines are **spec fit notes** tied to TOP MATCH manifest values — not a separate "why it works" essay.',
    `Each line must fit **one text row** (max ${EVERY_DETAIL_MATTERS_MAX_CHARS} chars) — one TOP MATCH spec value + why it suits the client (no period, dash, or hyphen).`,
    `FORBIDDEN PHRASES / TONE: ${EVERY_DETAIL_MATTERS_FORBIDDEN_PHRASES}.`,
    'Do not invent marketing copy. Do not treat this section as inspirational "why it works" fluff.',
  ].join('\n');
}

function panelChromePreservationBlock(): string {
  return [
    '=== PANEL CHROME — PIXEL-PERFECT PRESERVATION (HIGHEST PRIORITY) ===',
    `IMAGE 1 includes frosted acrylic / glass panels with brand-red outer glow (${BRAND_RED}) on panel edges, inner glass highlights, borders, drop shadows, and marble backdrop.`,
    'PRESERVE the red glow halo around every panel — same intensity, softness, spread, and position as IMAGE 1. Never remove, dim, or repaint the glow.',
    'PRESERVE acrylic detailing: frosted translucency, glass edge highlight, inner frost blur, and panel depth — never flatten to matte white or gray boxes.',
    'PRESERVE marble texture behind and between panels — sharp, visible stone veining; do not blur, smear, or replace with flat color.',
    'DO NOT replace glossy translucent panels with flat white boxes, plain gray rectangles, or simplified UI.',
    'Photo window: cutout subject on marble — **background removed**, **9:16**, **bottom-anchored**, **symmetrical bottom fade**, **subtle mirror reflection** in the empty lower panel — not a full studio backdrop photo.',
    'ONLY edit inside: (a) client hair in the photo window, (b) empty value text slots next to labels, (c) erasing the tier subtitle per rules below.',
    'If panel chrome or red glow degrades, the output is wrong — prioritize preserving IMAGE 1 panel art over aggressive photo edits.',
  ].join('\n');
}


function filledStarCountFromOverallScore(score: number): number {
  return matchRatingFilledStarsFromScore(score);
}

/** Canonical MATCH RATING star glyph — Noir site assets composited server-side at petite size. */
function matchRatingStarDesignBlock(): string {
  return [
    '=== MATCH RATING STARS — SERVER-COMPOSITED (DO NOT DRAW IN FAL) ===',
    'Leave the MATCH RATING value area **completely blank** after erasing template star outlines / placeholder art.',
    'Server overlays five **small** Noir stars (filled-star / star-symbol) centered in the value box — embossed red gradient on earned stars, outline-only on unearned.',
    'FORBIDDEN in Fal output: drawing stars, filling large template star outlines, emoji ★, yellow/gold stars, or chunky panel-filling star rows.',
  ].join('\n');
}

function overallScoreFontDesignBlock(): string {
  return [
    '=== OVERALL SCORE % — SERVER-COMPOSITED (DO NOT DRAW IN FAL) ===',
    'Leave the OVERALL SCORE value area **completely blank** after erasing any template placeholder percentage.',
    `Server overlays the score % in **${OVERALL_SCORE_CANONICAL_FONT}** red script (${BRAND_RED}) at **petite** size (~${overallScoreFalFontSize(TOP_SCORE_SLOT)}px max height) with wide padding inside the panel.`,
    'FORBIDDEN in Fal output: printing the overall score %, oversized/billboard digits, Futura sans-serif score text, or gray MATCH ROW score styling in this panel.',
  ].join('\n');
}

function overallScoreFalLine(look: FalAnalysisLook): string {
  const targetPx = overallScoreFalFontSize(TOP_SCORE_SLOT);

  return [
    'OVERALL SCORE value area: **leave completely BLANK** — erase template placeholder % text; server overlays the red percentage after generation.',
    `(Server reference only — do not print: ${formatScorePercent(look.score)} at ~${targetPx}px ${OVERALL_SCORE_CANONICAL_FONT} script, brand red ${BRAND_RED}.)`,
  ].join(' ');
}

function overallScoreAndStarsSizeRules(_tier: FalHairstyleAnalysis['tier']): string {
  const scorePx = overallScoreFalFontSize(TOP_SCORE_SLOT);
  const starPx = matchRatingFalStarSize(RATING_SLOT);

  return [
    '=== OVERALL SCORE + MATCH RATING — BLANK FOR SERVER OVERLAY (CRITICAL) ===',
    overallScoreFontDesignBlock(),
    matchRatingStarDesignBlock(),
    'Fal must **erase** template placeholder score % and star outline art, then leave both value areas **empty** — server composites petite typography afterward.',
    '**ERASE large template star outline glyphs** (~118px) completely — do not fill or redraw them in Fal; server replaces with petite Noir stars.',
    `Server target sizes (reference only — do not draw in Fal): overall score ~${scorePx}px max height; each star ~${starPx}px max height in a centered row with wide padding.`,
    'FORBIDDEN: Fal-printed overall score %, Fal-drawn stars, or copying large template star outline size into the output.',
  ].join('\n');
}

function matchRatingStarsFalLine(look: FalAnalysisLook, tier: FalHairstyleAnalysis['tier']): string {
  const scorePct = Math.round(look.score);
  const filled = filledStarCountFromOverallScore(look.score);
  const starPx = matchRatingFalStarSize(RATING_SLOT);
  const fillRule =
    filled === 5
      ? `Earned stars (server): ${scorePct}% (≥95%) → 5 filled left to right.`
      : `Earned stars (server): ${scorePct}% (<95%) → 4 filled; rightmost empty outline only.`;

  return [
    'MATCH RATING value area: **leave completely BLANK** — erase all template star outline glyphs; server overlays petite Noir stars after generation.',
    `${fillRule} (Server reference — ~${starPx}px tall per star, max.)`,
    'FORBIDDEN: drawing stars in Fal, filling large template outlines, emoji stars, or oversized star rows.',
  ].join(' ');
}

function overallScoreAndRatingRules(
  look: FalAnalysisLook,
  tier: FalHairstyleAnalysis['tier']
): string {
  return [
    overallScoreAndStarsSizeRules(tier),
    '',
    '=== OVERALL SCORE + MATCH RATING — CONTENT ===',
    overallScoreFalLine(look),
    matchRatingStarsFalLine(look, tier),
  ].join('\n');
}

function matchRowScoreColorBlock(): string {
  return [
    '=== MATCH SCORE % COLOR — GRAY #808080 ONLY (CRITICAL — NEVER BLACK) ===',
    `MATCH 02, MATCH 03, and MATCH 04 each have a separate MATCH SCORE % value slot — paint **only** that percentage in medium gray **${MATCH_SCORE_GRAY}**.`,
    'TEXTURE, COLOR, and LENGTH on the same row stay **black** Futura PT Medium — **only** the MATCH SCORE % digits + % suffix are gray.',
    `FORBIDDEN on MATCH SCORE %: black (#000000 / #1a1a1a), red (${BRAND_RED}), Covered By Your Grace script, large digits, or copying OVERALL SCORE panel styling.`,
    'Do not paint all four row values black — the MATCH SCORE line is the **one gray exception** on every additional-match row.',
    'If placeholder or prior text in the MATCH SCORE slot is black, erase and repaint **gray ${MATCH_SCORE_GRAY}**.',
  ].join('\n');
}

function matchScoreFalLine(look: FalAnalysisLook): string {
  const scorePct = formatScorePercent(look.score);
  return [
    `TEXTURE: ${look.unit.trim().toUpperCase()} (black Futura PT Medium)`,
    `COLOR: ${look.color.trim().toUpperCase()} (black Futura PT Medium)`,
    `LENGTH: ${displayLength(look.length)} (black Futura PT Medium)`,
    `MATCH SCORE: ${scorePct} — **gray ${MATCH_SCORE_GRAY} only** in this row's MATCH SCORE value slot (small Futura PT Medium — never black, never red OVERALL SCORE styling).`,
    'Print each value beside its pre-printed label on separate labeled lines — TEXTURE, COLOR, LENGTH, then MATCH SCORE.',
  ].join(' ');
}

function matchRowScoreIsolationBlock(): string {
  return [
    '=== MATCH 02–04 GRAY SCORE % — SEPARATE FROM OVERALL SCORE (CRITICAL) ===',
    `OVERALL SCORE (top-right red panel) and MATCH SCORE % (each MORE MATCHES row) are **different fields** — never swap, duplicate, or link them.`,
    `MATCH SCORE % only: gray ${MATCH_SCORE_GRAY}, small Futura PT Medium, in the MATCH SCORE value slot on that row (below LENGTH on the same MATCH block).`,
    'FORBIDDEN: red/script/large overall-score styling on MATCH SCORE %; printing match scores in the OVERALL SCORE panel; floating % away from the MATCH SCORE label.',
    'Server does **not** composite match-row text — print TEXTURE, COLOR, LENGTH, and gray MATCH SCORE % in-image in each row\'s value slots.',
    '',
    matchRowScoreColorBlock(),
  ].join('\n');
}

function matchRowValuesFalRules(): string {
  return [
    matchRowScoreIsolationBlock(),
    '',
    '=== MATCH 02–04 VALUE SLOTS — PRINT IN TEMPLATE (FAL IN-IMAGE) ===',
    'For MATCH 02, MATCH 03, and MATCH 04: print TEXTURE, COLOR, and LENGTH in black uppercase Futura PT Medium in each value area beside the pre-printed labels.',
    `MATCH SCORE value slot: gray percentage only (${MATCH_SCORE_GRAY}) — digits + % suffix, small Futura PT Medium on the MATCH SCORE labeled line for that row.`,
    'Labels (TEXTURE:, COLOR:, LENGTH:, MATCH SCORE:) are pre-printed on the template — do not duplicate labels; fill only the empty value slots.',
    'Keep each value aligned with its own label on the same horizontal line — do not stack all four values on one line or move scores to another panel.',
  ].join('\n');
}

function matchScoreManifestBlock(analysis: FalHairstyleAnalysis): string {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return '';

  const lines: string[] = [
    '=== MATCH 02–04 ROW VALUES — PRINT EXACTLY IN VALUE SLOTS ===',
    matchRowScoreColorBlock(),
    `TEXTURE, COLOR, LENGTH = black Futura PT Medium. MATCH SCORE % = gray ${MATCH_SCORE_GRAY} only — never black.`,
  ];

  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    const label = `MATCH ${String(i + 2).padStart(2, '0')}`;
    lines.push(
      `${label}: TEXTURE ${look.unit.trim().toUpperCase()}, COLOR ${look.color.trim().toUpperCase()}, LENGTH ${displayLength(look.length)} (all black).`,
      `${label} MATCH SCORE: ${formatScorePercent(look.score)} — paint gray ${MATCH_SCORE_GRAY} (NOT black).`
    );
  });

  return lines.join('\n');
}

function freeTierOnlyBlock(): string {
  return [
    '=== FREE TIER — TOP MATCH ONLY (CRITICAL) ===',
    'This card is the FREE hairstyle analysis template — exactly ONE look (TOP MATCH).',
    'DO NOT create MATCH 02, MATCH 03, MATCH 04, or any additional-match rows.',
    'DO NOT add portfolio thumbnails, horizontal thumbnail strips, alternative grids, or extra gray match-score percentages.',
    'DO NOT populate "MORE MATCHES" or any comparison section — the free card has no additional matches.',
    'ONLY fill: client preview photo, TOP MATCH spec column, and EVERY DETAIL MATTERS text rows beside rose icons.',
    'Leave OVERALL SCORE % and MATCH RATING stars **blank** (server overlays petite score + stars after generation).',
    'Leave all other template areas unchanged — marble/panel chrome only; never invent extra hairstyle comparisons.',
  ].join('\n');
}

function additionalMatchTemplateRules(hasMannequinRefs: boolean): string[] {
  const mannequinLine = hasMannequinRefs
    ? 'When mannequin IMAGEs are attached: use them for hair-strand texture + hair-end drape only — never neck/shoulder anatomy. Salon finish still comes from the BAW styling reference IMAGE when STYLE is not NONE.'
    : 'One-shoulder drape comes from prompt rules only — preserve IMAGE 2 neck and shoulders exactly.';

  return [
    '=== ADDITIONAL MATCHES — VARIED STYLING ===',
    'Each additional match uses a **different catalog unit** and **different STYLE** from the manifest — never duplicate NOIR + FLAT IRON on every row.',
    'Each additional match uses its own STYLE value — salon finish must differ across matches for variety.',
    'Apply the assigned BAW styling reference on every additional-match thumbnail.',
    '',
    '=== MATCH THUMBNAILS — SAME CLIENT FACE + SAME POSE ===',
    'Every thumbnail square must show the client from IMAGE 2 with different unit/color/length/styling applied.',
    '**All MATCH 02–04 thumbnails share one pose** — identical head angle, gaze, and shoulders as IMAGE 2 and as each other.',
    'Each thumb: **one PART only** + **uniform catalog color root to tip** on blonde/vivid installs — no dark roots from IMAGE 2.',
    'Thumbnails use an even tighter face/neck crop than the main preview — no invented clothing below the jaw.',
    mannequinLine,
    'NEVER use back-of-head stock photos, different people, hair-only swatches, repainted lower-body clothing, or symmetric both-shoulder hair.',
    '',
    'TOP MATCH spec values, every-detail-matters lines, and MATCH 02–04 row values: black uppercase Futura PT Medium except MATCH SCORE % (gray #808080).',
  ];
}

function buildTemplateRules(
  refs: FalPromptImageRefs,
  analysis: FalHairstyleAnalysis,
  promptOptions?: FalPromptBuildOptions
): string {
  const tierKey = normalizeTier(analysis.tier);
  const hasMannequinRefs = refs.mannequinRefs.length > 0;
  const mannequinList = hasMannequinRefs
    ? refs.mannequinRefs
        .map(
          (r) =>
            `IMAGE ${r.imageIndex} = ${r.unit} mannequin front (**hair strands + hair-end drape only** — never copy neck/shoulders)`
        )
        .join('\n')
    : '';

  const photoRules = [sharedClientPhotoRulesBlock()];

  return [
    '=== TEMPLATE (IMAGE 1) — DO NOT ALTER LAYOUT ===',
    'USE THE FIRST UPLOADED IMAGE AS THE EXACT STATIC TEMPLATE BACKGROUND.',
    'DO NOT REDESIGN THE CARD, MOVE PANELS, CROP, OR ALTER THE MARBLE BACKGROUND.',
    'ALL SECTION TITLES, BORDERS, FOOTER ICONS, AND LABELS (TEXTURE:, COLOR:, etc.) ARE ALREADY ON THE TEMPLATE — LEAVE THEM UNTOUCHED.',
    'ONLY FILL EMPTY VALUE AREAS NEXT TO EXISTING LABELS. DO NOT DUPLICATE LABELS OR ICONS.',
    'COLOR value fields: color name only (e.g. JET BLACK) — never print hex codes, # symbols, or parenthetical color notes.',
    '',
    panelChromePreservationBlock(),
    '',
    templateTextIntegrityBlock(),
    '',
    '=== REMOVE TIER / SUBSCRIPTION LABEL (CRITICAL) ===',
    'The template may include a subtitle such as "FREE HAIRSTYLE ANALYSIS", "3 MONTH HAIRSTYLE ANALYSIS",',
    '"6 MONTH HAIRSTYLE ANALYSIS", or "12 MONTH HAIRSTYLE ANALYSIS" below the main header.',
    'ERASE that tier/subscription subtitle completely — paint over with clean marble background matching the template.',
    'The client must NOT see any tier name, month count, or analysis type. Keep "FRONTAL SLAYER" and "hairstyle analysis" header art only.',
    ...(tierKey === 'free'
      ? [
          '',
          '=== HAIRLINE — EDGE STRANDS MATCH HAIR COLOR ===',
          'Do not copy black baby hairs from mannequin/styling refs. Any hairline wisps or flyaways must match the assigned catalog color — never black on fashion/vivid installs.',
          'Hairline stays clean lace-front edge — no heavy invented fuzz.',
        ]
      : []),
    bawUnitCatalogBlock(),
    '',
    bawColorApplicationRulesBlock(),
    '',
    hairPartLockBlock(),
    '',
    ...(tierKey === 'free' ? [neckAndBodyPreservationBlock(), ''] : []),
    asymmetricOneShoulderDrapeBlock('all_photos', hasMannequinRefs),
    '',
    '=== ROSE ICONS — PIXEL-PERFECT PRESERVATION (CRITICAL) ===',
    'EVERY RED ROSE ICON ON THE TEMPLATE IS PRE-RENDERED ART — DO NOT REDRAW, REGENERATE, STRETCH, BLUR, OR REPLACE ANY ROSE.',
    'DO NOT ADD NEW ROSE ICONS. DO NOT CHANGE ROSE SHAPE, SIZE, POSITION, OR COLOR.',
    '',
    overallScoreAndRatingRules(analysis.topMatch, analysis.tier),
    '',
    mannequinList,
    '',
    bawStylingRefListBlock(refs.stylingRefs),
    '',
    '=== SALON STYLING — BAW REFERENCES ONLY (NO INVENTED STYLES) ===',
    'When STYLE is LAYERS, CRIMPS, FLAT IRON, DEFINE, or WAND CURLS: copy hairstyle shape from the matching BAW styling reference IMAGE.',
    'Retint hair to the look catalog color (hex in hair-edit instructions) — do not create new curl, crimp, or straight patterns.',
    '',
    ...(tierKey === 'free' ? [freeTierOnlyBlock(), ''] : [matchRowValuesFalRules(), '', ...additionalMatchTemplateRules(hasMannequinRefs)]),
    topMatchSpecManifestBlock(analysis.topMatch),
    '',
    ...photoRules,
    '',
    ...(tierKey === 'free'
      ? [
          'TOP MATCH spec values and every-detail-matters lines: black uppercase Futura PT Medium.',
          'FREE TIER: no match-row scores, no additional-match thumbnails, no portfolio strip.',
          overallScoreFalLine(analysis.topMatch),
          matchRatingStarsFalLine(analysis.topMatch, analysis.tier),
        ]
      : []),
    '',
    tierKey === 'free'
      ? 'OUTPUT ONE COMPLETE FREE-TIER CARD AT 4:5 PORTRAIT — TOP MATCH + specs + every detail matters; overall score % + stars server-composited after Fal.'
      : 'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — MATCH 02–04 row values (gray score %) + every detail matters in-image; TOP MATCH specs + thumbnails in-image; overall score % + stars server-composited after Fal.',
  ]
    .filter(Boolean)
    .join('\n');
}

function topMatchSpecManifestBlock(look: FalAnalysisLook): string {
  const style = displayStyle(look.styling, look.unit);
  return [
    '=== TOP MATCH SPEC COLUMN — PRINT EXACTLY IN VALUE SLOTS (RIGHT PANEL) ===',
    'The template may show placeholder catalog text (e.g. NOIR, JET BLACK, LAYERS) — ERASE every placeholder and REPLACE with the manifest below.',
    'Print each value in black uppercase Futura PT Medium in the empty slot beside its pre-printed label only — do not duplicate labels.',
    `MANIFEST — TEXTURE: ${look.unit.trim().toUpperCase()}`,
    `MANIFEST — COLOR: ${look.color.trim().toUpperCase()}`,
    `MANIFEST — LENGTH: ${displayLength(look.length)}`,
    `MANIFEST — LACE: ${displayLace(look.lace)}`,
    `MANIFEST — DENSITY: ${displayDensity(look.density)}`,
    `MANIFEST — PART: ${displayPart(look.part)}`,
    `MANIFEST — HAIRLINE: ${displayHairline(look.hairline)}`,
    `MANIFEST — STYLE: ${style}`,
    lookHairAccuracyLines(look),
    `FORBIDDEN: leaving template placeholder NOIR/JET BLACK/LAYERS/24"/13X6 HD/250%/MIDDLE defaults; printing a different unit or STYLE than the manifest; copying MATCH 02 row values into the TOP MATCH column.`,
    'LACE, DENSITY, and PART value slots must print the manifest exactly — never reuse baked template placeholder 13X6 HD / 250% / MIDDLE when manifest differs.',
    'The manifest below is the **only** source of truth for TOP MATCH specs — never reuse template placeholder text.',
    `STYLE value must print exactly "${style}" — never default to LAYERS when manifest STYLE is FLAT IRON, CRIMPS, DEFINE, or WAND CURLS.`,
  ].join('\n');
}

function altRowBlock(label: string, look: FalAnalysisLook): string {
  return [
    label,
    matchScoreFalLine(look),
    `Thumbnail only — apply STYLE ${displayStyle(look.styling, look.unit)} on the square photo; do not print STYLE in the match row.`,
  ].join('\n');
}

function appendEveryDetailMattersLines(
  lines: string[],
  analysis: FalHairstyleAnalysis
): void {
  if (analysis.whyItWorks.length === 0) return;
  lines.push('');
  lines.push(everyDetailMattersRulesBlock(analysis.whyItWorks.length));
  lines.push(
    'TOP MATCH spec column and every-detail-matters bullets must stay **in sync** — if manifest says SOFT WAVE + CHERRY, bullets must say SOFT WAVE + CHERRY, not NOIR + JET BLACK.'
  );
  formatEveryDetailMattersForFal(analysis.topMatch, analysis.whyItWorks).forEach((line) => {
    lines.push(line);
  });
}

function freePromptFooter(
  analysis: FalHairstyleAnalysis,
  promptOptions?: FalPromptBuildOptions
): string {
  return [
    '',
    '=== FINAL CHECK ===',
    'PILL: red uppercase "TOP MATCH" replaces "CLIENT PREVIEW" inside the tab only.',
    'HEADER: client first + last name replaces black "TOP MATCH" above overall score panel — **centered** in the header panel.',
    'TOP MATCH specs + every detail matters filled; overall score % + match rating stars are **server-composited** (leave those slots blank in Fal).',
    'TOP MATCH spec column must match the MANIFEST exactly — not template placeholder NOIR/LAYERS defaults.',
    'Every-detail-matters bullets must match the same manifest values as the spec column — print numbered lines verbatim, not empowerment fluff.',
    overallScoreFalLine(analysis.topMatch),
    matchRatingStarsFalLine(analysis.topMatch, analysis.tier),
  ].join('\n');
}

function freePrompt(
  analysis: FalHairstyleAnalysis,
  refs: FalPromptImageRefs,
  promptOptions?: FalPromptBuildOptions
): string {
  const top = analysis.topMatch;
  const fullName = clientFullName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs, analysis, promptOptions),
    '',
    freeTierOnlyBlock(),
    '',
    clientPreviewTabLine(),
    topMatchHeaderLine(fullName),
    clientPreviewHairLine(top, refs),
  ];
  appendEveryDetailMattersLines(lines, analysis);
  lines.push(freePromptFooter(analysis, promptOptions));
  return lines.join('\n');
}

function threeMonthPrompt(
  analysis: FalHairstyleAnalysis,
  refs: FalPromptImageRefs,
  promptOptions?: FalPromptBuildOptions
): string {
  const top = analysis.topMatch;
  const fullName = clientFullName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs, analysis, promptOptions),
    '',
    clientPreviewTabLine(),
    topMatchHeaderLine(fullName),
    clientPreviewHairLine(top, refs),
  ];
  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    const label = `MATCH ${String(i + 2).padStart(2, '0')}`;
    lines.push('');
    lines.push(altRowBlock(label, look));
    lines.push(matchThumbnailBlock(label, look, refs));
  });
  appendEveryDetailMattersLines(lines, analysis);
  lines.push('');
  lines.push(matchStylingManifestBlock(analysis, refs));
  lines.push('');
  lines.push(matchScoreManifestBlock(analysis));
  lines.push('');
  lines.push(
    `FINAL CHECK: red pill = "TOP MATCH" only; black header above score panels = client first + last name **centered** in panel; TOP MATCH spec column = manifest values exactly (unit, color, length, lace, density, part, hairline, STYLE); OVERALL SCORE + MATCH RATING value areas **blank** (server overlays petite score + stars); thumbs = same client + **same pose as IMAGE 2 on every row** + assigned STYLE + **one PART only** + **uniform color root to tip on blonde/vivid** (no dark roots); MATCH 02–04 texture/color/length = black; MATCH SCORE % on each row = **gray ${MATCH_SCORE_GRAY} only** — if any match score looks black, repaint it gray before finishing.`
  );
  return lines.join('\n');
}

export function buildHairstyleAnalysisFalPrompt(
  analysis: FalHairstyleAnalysis,
  refs: FalPromptImageRefs,
  promptOptions?: FalPromptBuildOptions
): string {
  const tier = normalizeTier(analysis.tier);
  const prompt =
    tier === 'free'
      ? freePrompt(analysis, refs, promptOptions)
      : threeMonthPrompt(analysis, refs, promptOptions);
  if (prompt.length > HAIRSTYLE_ANALYSIS_FAL_PROMPT_MAX_CHARS) {
    throw new Error(
      `Hairstyle analysis prompt too long (${prompt.length} characters; Fal limit is ${HAIRSTYLE_ANALYSIS_FAL_PROMPT_MAX_CHARS}).`
    );
  }
  return prompt;
}

