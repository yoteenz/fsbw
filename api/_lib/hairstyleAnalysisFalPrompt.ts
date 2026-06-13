/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * Overall score % and match-rating stars are Fal in-image at petite pixel sizes (prompted).
 * TOP MATCH specs, MATCH 02–04 row values, every-detail-matters lines, client preview photo are Fal in-image.
 */

import {
  bawColorApplicationRulesBlock,
  bawUnitCatalogBlock,
  lookHairAccuracyLines,
  requiresUniformRootToTipColor,
  unitTexturePromptLine,
  unitTextureAppearanceLock,
} from './hairstyleAnalysisUnitCatalog.js';
import {
  bawStylingRefListBlock,
  stylingRefForLook,
  type HairstyleAnalysisStylingRef,
} from './hairstyleAnalysisBawStylingRefs.js';
import {
  bawHairlineRefListBlock,
  hairlineRefForLook,
  hairlineRefPromptLine,
  type HairstyleAnalysisHairlineRef,
} from './hairstyleAnalysisBawHairlineRefs.js';
import { RATING_SLOT, TOP_SCORE_SLOT, type PixelRect } from './hairstyleAnalysisLayoutSlots.js';
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
  formatMatchRatingDecimal,
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
  hairlineRefs: HairstyleAnalysisHairlineRef[];
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
  const unitKey = unit.trim().toUpperCase();
  const textureLock = unitTextureAppearanceLock(unit);
  const noneStyleNote =
    unitKey === 'SOFT CURL'
      ? 'Copy **tight wave** strand pattern from that mannequin — elongated S-waves only, volume, and one-shoulder drape — **NOT** spiral curls or OCEAN CURL ringlets.'
      : unitKey === 'OCEAN CURL'
        ? 'Copy **tight curl** spiral pattern from that mannequin — springy ringlets, volume, and one-shoulder drape.'
        : 'Copy **hair** strand pattern, definition, volume, and one-shoulder drape from that mannequin — hair region only.';
  const shapeNote =
    style !== 'NONE'
      ? 'Mannequin = **hair-strand texture + hair-end drape direction only** (above the collarbone). Salon finish comes from the BAW styling reference IMAGE — not the mannequin default shape.'
      : noneStyleNote;
  return [
    `Optional hair guide — IMAGE ${idx} (${unit} mannequin front):`,
    shapeNote,
    textureLock ?? '',
    'NECK/BODY LOCK: do NOT copy mannequin neck, throat, collarbones, shoulders, chest, or skin — keep IMAGE 2 client anatomy exactly.',
    'HAIRLINE LOCK: do NOT copy mannequin baby hairs or black edge wisps — retint any edge strands to the look catalog color.',
  ]
    .filter(Boolean)
    .join(' ');
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
    `REPLACE that black "TOP MATCH" header with "${fullName}" — the client's **full first and last name**, uppercase.`,
    `PRINT **EVERY WORD** of "${fullName}" — **never first name only**, never truncate after the first word.`,
    'Erase the old header letters first — **single clean text layer** (no double-print, ghost offset, or stacked duplicates).',
    `Use **medium gray ${MATCH_SCORE_GRAY}** Futura PT Medium — same size, weight, and letter-spacing as the original header; **only** the color is gray (not black or red).`,
    '**Center the client name horizontally within the frosted header panel** above OVERALL SCORE and MATCH RATING — equal padding left and right; do NOT left-align.',
    'Do NOT leave "TOP MATCH" visible in that header slot. Do NOT duplicate the client name in the red pill (pill stays "TOP MATCH" only).',
  ].join('\n');
}

function templateTextIntegrityBlock(): string {
  return [
    '=== TEMPLATE TEXT — NO GHOST / DUPLICATE LAYERS ===',
    'When replacing template words (pill, header, value slots): paint over old text fully, then print **one** crisp layer.',
    'FORBIDDEN: offset duplicate text (red/black echo), shadow stacks, semi-transparent ghost copies, or printing the same label twice.',
    'Keep "FRONTAL SLAYER" title art from IMAGE 1 untouched — do not re-render or duplicate it.',
  ].join('\n');
}

/** Script subtitle directly under FRONTAL SLAYER — recolor to brand red (not the client name header). */
function cardHeaderHairstyleAnalysisSubtitleBlock(): string {
  return [
    '=== CARD TOP — "hairstyle analysis" SUBTITLE (BELOW FRONTAL SLAYER) ===',
    'Directly under the "FRONTAL SLAYER" title, IMAGE 1 shows script text **"hairstyle analysis"** (often gray or black).',
    `REPAINT **only** that script phrase to **brand red ${BRAND_RED}** — keep the same script font, size, curve, and position; change color only.`,
    'Do NOT alter the "FRONTAL SLAYER" title. Do NOT duplicate the subtitle. This is NOT the client name above the overall score panel.',
  ].join('\n');
}

function colorValueLine(look: FalAnalysisLook): string {
  return `COLOR: ${look.color}`;
}

/** Hair-edit guidance only — hex guides retint; never print hex on template value fields. */
function colorHairGuidanceLine(look: FalAnalysisLook): string {
  return lookHairAccuracyLines(look).split('\n')[1] ?? '';
}

function styledHairLine(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  const style = displayStyle(look.styling, look.unit);
  if (style === 'NONE') {
    return refs.mannequinRefs.length > 0
      ? `Finish hair matching ${unitTexturePromptLine(look.unit)} Use mannequin for strand direction only.`
      : unitTexturePromptLine(look.unit);
  }
  const stylingRef = stylingRefForLook(refs.stylingRefs, look.styling, look.part, look.unit);
  const textureLock = unitTextureAppearanceLock(look.unit);
  if (stylingRef) {
    const hex = (look.hex || '#000000').toUpperCase();
    return [
      `STYLE **${style}** — print exactly "${style}" in the STYLE value field (never substitute LAYERS unless STYLE is LAYERS or DEFINE).`,
      textureLock ?? unitTexturePromptLine(look.unit),
      `Hairstyle shape: copy **hair strands only** from IMAGE ${stylingRef.imageIndex} (BAW ${style} reference, ${stylingRef.part} part) — **never** copy head pose, profile angle, or neck rotation from that IMAGE.`,
      `Salon ref adjusts finish within the unit texture tier — never upgrade SOFT CURL to OCEAN CURL spirals or add waves to NOIR/BLANCO.`,
      `Match the salon finish pattern from IMAGE ${stylingRef.imageIndex}; retint strands to uniform ${look.color} (${hex}) root to tip — no dark roots; hairline edge wisps same ${look.color}, not black.`,
      'The styling reference IMAGE overrides the unit mannequin default finish — do NOT apply layered waves when STYLE is FLAT IRON or CRIMPS/WAND CURLS.',
      'Do not invent a different salon finish.',
    ].join(' ');
  }
  return `Apply BAW salon styling **${style}** only — print STYLE as "${style}"; do not default to LAYERS or invent a new curl/crimp/straight pattern.`;
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
    const hl = displayHairline(look.hairline);
    const hlRef = hairlineRefForLook(refs.hairlineRefs, look.hairline);
    const hlNote = hlRef ? `HAIRLINE ${hl} via IMAGE ${hlRef.imageIndex}` : `HAIRLINE ${hl}`;
    lines.push(
      `${label}: STYLE ${style}, PART ${displayPart(look.part)} (one part only on thumb), ${hlNote}, COLOR ${look.color.trim().toUpperCase()} uniform root to tip if vivid/blonde, ${refNote}`
    );
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
    hairlineRefPromptLine(look.hairline, look.color, refs.hairlineRefs),
    mannequinRefLine(look.unit, refs, look.styling),
  ]
    .filter(Boolean)
    .join('\n');
}

function sharedClientPhotoRulesBlock(refs: FalPromptImageRefs): string {
  return [
    faceIdentityLockBlock(),
    clientPoseLockBlock(),
    clientPhotoPanelRulesBlock(),
    'Recolor hair to catalog color/texture at strand level — face and skin untouched.',
    hairlineRulesBlock(refs),
  ].join('\n\n');
}

function hairlineRulesBlock(refs: FalPromptImageRefs): string {
  const hasHairlineRefs = refs.hairlineRefs.length > 0;
  return [
    hasHairlineRefs
      ? 'HAIRLINE: when manifest HAIRLINE is PEAK, LAGOS, or LAGOS + PEAK — copy **forehead lace-edge shape only** from the matching BAW hairline reference IMAGE; retint edge/baby hairs to the assigned catalog color.'
      : 'HAIRLINE: clean lace-front edge — natural hairline finish.',
    'Any baby hairs, temple flyaways, or edge wisps must match the assigned catalog hair color — never left jet black when hair is CHERRY, PLATINUM, etc.',
    'Do not copy black baby hairs or wispy edge fuzz from **unit mannequin** or **styling** IMAGEs — BAW hairline IMAGEs are the only source for PEAK/LAGOS edge geometry.',
    'Do not invent heavy new baby-hair clutter.',
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
    `PART ${part} **only** — one scalp line.`,
    uniformRootColorBlock(look, 'thumbnail'),
    realisticHairDensityBlock(displayDensity(look.density), true),
    hairlineRefPromptLine(look.hairline, look.color, refs.hairlineRefs),
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
    '**FORMAT:** each line = **TOP MATCH catalog spec value** + **one concrete fit note** (eyes, jaw, face shape, or install benefit). Wording varies per line — print the numbered EDM lines below **verbatim**.',
    'Lace rose row must name the manifest hairline — adjective before noun; never "LACE MELTED" or "HAIRLINE NATURAL".',
    '**BAD (FORBIDDEN):** empowerment slogans, you deserve, embrace your beauty, confidence, queen energy, generic inspiration — NOT why-it-works essays.',
    `Each line ≤ ${EVERY_DETAIL_MATTERS_MAX_CHARS} chars — **no trailing period**, **no dashes or hyphens**.`,
    'Print each EVERY DETAIL MATTERS LINE below **verbatim** — black uppercase Futura PT Medium beside its rose icon.',
    'Do **not** invent new bullets — use **only** the numbered lines in this prompt.',
  ].join('\n');
}

function everyDetailMattersRulesBlock(lineCount: number): string {
  return [
    everyDetailMattersStructureBlock(lineCount),
    '',
    '=== EVERY DETAIL MATTERS — PRINT VERBATIM ===',
    `Copy each EDM line below exactly — one row per rose icon (max ${EVERY_DETAIL_MATTERS_MAX_CHARS} chars, no period/dash).`,
    'Spec fit notes tied to TOP MATCH manifest — not empowerment fluff.',
    `FORBIDDEN TONE: you deserve, embrace, queen, confidence, flawless, lace melted, hairline natural.`,
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

/** Compact score + star rules — keep under Fal 32k prompt limit. */
function overallScoreAndRatingRules(
  look: FalAnalysisLook,
  tier: FalHairstyleAnalysis['tier']
): string {
  const scorePx = overallScoreFalFontSize(TOP_SCORE_SLOT);
  const starPx = matchRatingFalStarSize(RATING_SLOT);
  const filled = filledStarCountFromOverallScore(look.score);
  const scorePct = formatScorePercent(look.score);
  const ratingLabel = formatMatchRatingDecimal(look.rating);
  const tierKey = normalizeTier(tier);
  const starErase =
    tierKey === 'free'
      ? `Draw 5 petite embossed-gradient red stars (~${starPx}px max each) in the **lower half** of the MATCH RATING value box, below the ${ratingLabel} number.`
      : `Erase large template star glyphs; draw 5 new petite stars (~${starPx}px max each) in the **lower half** of the MATCH RATING value box, below the ${ratingLabel} number.`;
  const fillRule =
    filled === 5 ? 'Fill all 5 stars left → right.' : 'Fill left 4 only; star 5 empty outline.';

  return [
    '=== OVERALL SCORE + MATCH RATING (PETITE IN-IMAGE) ===',
    `OVERALL SCORE: erase placeholder %; print ${scorePct} in ${OVERALL_SCORE_CANONICAL_FONT} red ${BRAND_RED} script (~${scorePx}px max height, centered, wide padding). Digits + % same script.`,
    `MATCH RATING: erase placeholder; print **${ratingLabel}** in the **upper third** of the MATCH RATING value box — ${OVERALL_SCORE_CANONICAL_FONT} red ${BRAND_RED} script, **same font family and visual weight as OVERALL SCORE %** (~${scorePx}px max height, centered).`,
    `MATCH RATING STARS (below ${ratingLabel}): ${fillRule} ${starErase} Embossed radial pink-coral → ${BRAND_RED} fill; dark-red stroke; empty = outline only.`,
    'FORBIDDEN: billboard score/rating numbers, chunky/emoji stars, gray or sans-serif overall score or match-rating text.',
  ].join('\n');
}

function matchRowScoreIsolationBlock(): string {
  return [
    '=== MATCH 02–04 GRAY SCORE % — SEPARATE FROM OVERALL SCORE ===',
    `MATCH SCORE % only: gray ${MATCH_SCORE_GRAY}, small Futura PT Medium — never black or red overall-score styling.`,
    'Print TEXTURE, COLOR, LENGTH black + gray MATCH SCORE % in each row value slot.',
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
    'ONLY fill: client preview photo, TOP MATCH spec column, EVERY DETAIL MATTERS text rows, OVERALL SCORE %, MATCH RATING decimal + stars.',
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
    'Each thumb: **one PART only** + **manifest HAIRLINE edge shape** (PEAK/LAGOS/NATURAL per look) + **uniform catalog color root to tip** on blonde/vivid installs — no dark roots from IMAGE 2.',
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

  const photoRules = [sharedClientPhotoRulesBlock(refs)];

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
    cardHeaderHairstyleAnalysisSubtitleBlock(),
    '',
    '=== REMOVE TIER / SUBSCRIPTION LABEL (CRITICAL) ===',
    'The template may include a subtitle such as "FREE HAIRSTYLE ANALYSIS", "3 MONTH HAIRSTYLE ANALYSIS",',
    '"6 MONTH HAIRSTYLE ANALYSIS", or "12 MONTH HAIRSTYLE ANALYSIS" below the main header.',
    'ERASE that tier/subscription subtitle completely — paint over with clean marble background matching the template.',
    `The client must NOT see any tier name, month count, or analysis type. Keep "FRONTAL SLAYER" title + script "hairstyle analysis" (repainted red ${BRAND_RED}) only.`,
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
    bawHairlineRefListBlock(refs.hairlineRefs),
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
        ]
      : []),
    '',
    tierKey === 'free'
      ? 'OUTPUT ONE COMPLETE FREE-TIER CARD AT 4:5 PORTRAIT — TOP MATCH + specs + every detail matters; overall score % + stars printed in-image at petite sizes.'
      : 'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — MATCH 02–04 row values (gray score %) + every detail matters in-image; TOP MATCH specs + thumbnails in-image; overall score % + stars printed in-image at petite sizes.',
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
    `FORBIDDEN: leaving template placeholder NOIR/JET BLACK/LAYERS/24"/13X6 HD/250%/MIDDLE defaults; printing a different unit or STYLE than the manifest; copying MATCH 02 row values into the TOP MATCH column.`,
    'LACE, DENSITY, and PART value slots must print the manifest exactly — never reuse baked template placeholder 13X6 HD / 250% / MIDDLE when manifest differs.',
    'The manifest below is the **only** source of truth for TOP MATCH specs — never reuse template placeholder text.',
    `STYLE value must print exactly "${style}" — never default to LAYERS when manifest STYLE is FLAT IRON, CRIMPS, DEFINE, or WAND CURLS.`,
  ].join('\n');
}

function altRowBlock(label: string, look: FalAnalysisLook): string {
  const style = displayStyle(look.styling, look.unit);
  return `${label}: row values in MATCH 02–04 manifest below; thumb STYLE ${style} only.`;
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
  formatEveryDetailMattersForFal(analysis.whyItWorks).forEach((line) => {
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
    'HEADER: client first + last name replaces "TOP MATCH" above overall score panel — **centered**, **gray #808080** Futura PT Medium (not red).',
    `CARD TOP: script "hairstyle analysis" below FRONTAL SLAYER repainted **brand red ${BRAND_RED}**.`,
    'TOP MATCH specs + every detail matters filled; OVERALL SCORE % + MATCH RATING decimal (e.g. 5.0 / 4.7) + stars printed in-image at petite sizes (erase large template placeholders first).',
    'TOP MATCH spec column must match the MANIFEST exactly — not template placeholder NOIR/LAYERS defaults.',
    'Every-detail-matters bullets must match the same manifest values as the spec column — print numbered lines verbatim, not empowerment fluff.',
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
    `FINAL CHECK: gray centered client name; "hairstyle analysis" script below FRONTAL SLAYER = red ${BRAND_RED}; specs + EDM lines verbatim; petite score/stars in-image; each thumb = IMAGE 2 pose + manifest HAIRLINE + STYLE; MATCH SCORE % gray ${MATCH_SCORE_GRAY} only.`
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

