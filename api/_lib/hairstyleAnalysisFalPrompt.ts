/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * Overall score %, match-rating stars, TOP MATCH specs, MATCH 02–04 row values,
 * every-detail-matters lines, client preview photo (with symmetrical bottom fade), and photos are generated in-image by Fal.
 */

import {
  bawColorApplicationRulesBlock,
  bawUnitCatalogBlock,
  lookHairAccuracyLines,
  unitTexturePromptLine,
} from './hairstyleAnalysisUnitCatalog.js';
import {
  bawStylingRefListBlock,
  stylingRefForLook,
  type HairstyleAnalysisStylingRef,
} from './hairstyleAnalysisBawStylingRefs.js';
import { TOP_SCORE_SLOT, RATING_SLOT } from './hairstyleAnalysisLayoutSlots.js';
import { overallScoreFalFontSize } from './hairstyleAnalysisTextPaths.js';
import { clientFullName, type MannequinRefIndex } from './hairstyleAnalysisMannequinRefs.js';
import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
  formatScorePercent,
  EVERY_DETAIL_MATTERS_MAX_CHARS,
} from './hairstyleAnalysisDisplay.js';

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
      `Hairstyle shape: copy **only** from IMAGE ${stylingRef.imageIndex} (BAW ${style} reference, ${stylingRef.part} part).`,
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
    lines.push(`${label}: STYLE ${style}, PART ${displayPart(look.part)}, ${refNote}`);
  });

  return lines.join('\n');
}

function clientPhotoPanelRulesBlock(): string {
  return [
    '=== CLIENT PREVIEW PHOTO — HAIR EDITS ONLY (NO CUTOUT IN FAL) ===',
    'Edit HAIR ONLY in the left-panel photo window from IMAGE 2 — same person, face/skin lock, tight head/hair/neck/upper-chest portrait.',
    'Do NOT remove the background, do NOT paste a second portrait layer, do NOT add white/gray fill, and do NOT create a floating cutout card.',
    'Leave the photo window framing as IMAGE 1 — one in-place client photo with original backdrop; cutout/fade/placement is applied after generation.',
    'Thumbnails: tighter square face/neck crop; one-shoulder drape; no clothing invented below jaw.',
  ].join('\n');
}

function clientPreviewHairLine(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  return [
    '=== CLIENT PREVIEW (IMAGE 2) — TOP MATCH HAIR ===',
    `Hair only: ${look.unit}, ${look.color}, ${displayLength(look.length)}, STYLE ${displayStyle(look.styling, look.unit)}.`,
    lookHairAccuracyLines(look),
    realisticHairDensityBlock(displayDensity(look.density), false),
    colorHairGuidanceLine(look),
    styledHairLine(look, refs),
    mannequinRefLine(look.unit, refs, look.styling),
    'NO wig cap, NO lace visible, NO different person.',
  ]
    .filter(Boolean)
    .join('\n');
}

function sharedClientPhotoRulesBlock(): string {
  return [
    '=== CLIENT PHOTOS — FACE LOCK + PANEL (ALL PREVIEW + THUMBNAILS) ===',
    faceIdentityLockBlock(),
    clientPhotoPanelRulesBlock(),
    realisticHairRecolorBlock(),
    'HAIR VOLUME: natural strand separation; FORBIDDEN helmet hair, bouffant crown, or shrinking the face.',
    hairlineRulesBlock(),
    neckAndBodyPreservationBlock(),
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
  const ref = stylingRefForLook(refs.stylingRefs, look.styling, look.part, look.unit);
  const refNote = ref ? `salon shape from IMAGE ${ref.imageIndex}` : 'mannequin hair texture only';
  return [
    `${label} THUMB: same client face as IMAGE 2; tight face/neck crop; ${look.unit}, ${look.color}, ${displayLength(look.length)}, STYLE ${style} (${refNote}); one-shoulder drape like hero; hair-only edits.`,
    lookHairAccuracyLines(look),
    realisticHairDensityBlock(displayDensity(look.density), true),
    mannequinRefLine(look.unit, refs, look.styling),
  ]
    .filter(Boolean)
    .join('\n');
}

function everyDetailMattersStructureBlock(lineCount: number): string {
  return [
    '=== EVERY DETAIL MATTERS PANEL — FIXED STRUCTURE (DO NOT CHANGE) ===',
    'The script header "every detail matters" and rose bullet icons are pre-rendered on IMAGE 1.',
    `Fill exactly ${lineCount} text rows below that header — **one short line per row** (single row only, no wrapping).`,
    `Each line ≤ ${EVERY_DETAIL_MATTERS_MAX_CHARS} characters — each row explains **one TOP MATCH spec** (texture, color, length, lace, density, part, hairline, or style).`,
    'Use punchy phrasing (e.g. "HD LACE FOR THE ULTRA REALISTIC FINISH" or "JET BLACK TO COMPLEMENT YOUR BLACK ALMOND EYES") — **no trailing period**.',
    'Print each EVERY DETAIL MATTERS LINE verbatim — character-for-character — as black uppercase Futura PT Medium beside its rose icon.',
    'FORBIDDEN: multi-clause essays, label:value rows, keyword lists, line wraps, or a different number of lines.',
    'This is NOT motivational copy — do not rewrite into empowerment fluff.',
    'Tone: flattering and respectful only — celebrate features; never call the face long, wide, narrow, or criticize forehead, chin, or proportions.',
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
  'long face',
  'wide face',
  'narrow chin',
  'high forehead',
  'big forehead',
].join(', ');

function everyDetailMattersRulesBlock(lineCount: number): string {
  return [
    everyDetailMattersStructureBlock(lineCount),
    '',
    '=== EVERY DETAIL MATTERS LINES (PRINT VERBATIM — ZERO REWRITES) ===',
    'Copy each line below exactly. Do not paraphrase, merge rows, wrap to a second line, or add words.',
    `Each line must fit **one text row** (max ${EVERY_DETAIL_MATTERS_MAX_CHARS} chars) — one TOP MATCH spec value + why it suits the client (no period at end).`,
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
    'Photo windows: edit the client portrait **in place** — hair/strand changes only. Do NOT background-remove, do NOT paste a second portrait on top, do NOT add white/gray backdrop fill.',
    'ONLY edit inside: (a) client hair in the photo window, (b) empty value text slots next to labels, (c) erasing the tier subtitle per rules below.',
    'If panel chrome or red glow degrades, the output is wrong — prioritize preserving IMAGE 1 panel art over aggressive photo edits.',
  ].join('\n');
}


function filledStarCount(rating: number): number {
  return Math.min(5, Math.max(0, Math.round(rating)));
}

/** Canonical MATCH RATING star glyph — embossed radial-gradient red (premium template + free tier). */
function matchRatingStarDesignBlock(): string {
  return [
    '=== MATCH RATING STARS — EXACT GLYPH DESIGN (ALL TIERS — PERMANENT) ===',
    'Use **only** this star style in the MATCH RATING panel — same on every generation:',
    '• **Shape:** classic symmetrical 5-point star, sharp tips, polished vector icon (not emoji, not hand-drawn).',
    '• **Earned (filled) stars:** **radial gradient** emboss/bevel — **pale pink-coral highlight at the center** (#FFC4C4 / #FFB8B8) fading to **vibrant brand red** (#EB1C24) at the outer points; subtle 3D puffy/embossed look.',
    '• **Outline:** every star (filled or empty) has a **fine crisp dark-red stroke** (#C41018) defining the edge.',
    '• **Empty (unearned) stars:** same shape + dark-red outline only — **no gradient fill**, interior stays white/transparent.',
    '• **Layout:** exactly 5 stars in **one horizontal centered row**, evenly spaced with padding inside the MATCH RATING value box — compact, never oversized.',
    'FORBIDDEN: flat solid-red fills with no gradient, yellow/gold stars, emoji ★, chunky clip-art, glow blobs, or a different star icon set.',
  ].join('\n');
}

function overallScoreFontDesignBlock(): string {
  return [
    '=== OVERALL SCORE % — EXACT FONT DESIGN (ALL TIERS — PERMANENT) ===',
    'Print the score value using **only** this typography in the red OVERALL SCORE panel:',
    `• **Font:** **${OVERALL_SCORE_CANONICAL_FONT}** — elegant **handwritten script / calligraphy** (not geometric sans-serif).`,
    '• **Style:** fluid slanted strokes, fine-tip-marker weight, personalized "signed" look — **digits and % suffix in the same script family**.',
    `• **Color:** vibrant brand red ${BRAND_RED}.`,
    '• **Layout:** centered inside the OVERALL SCORE value box with padding — compact, never oversized or touching borders.',
    'FORBIDDEN on OVERALL SCORE: Futura PT Demi/Medium/Book, blocky sans-serif digits, black/gray text, or MATCH ROW gray score styling.',
  ].join('\n');
}

function overallScoreFalLine(look: FalAnalysisLook): string {
  const targetPx = overallScoreFalFontSize(TOP_SCORE_SLOT);

  return [
    `OVERALL SCORE: print ${formatScorePercent(look.score)} in the OVERALL SCORE value area.`,
    `Use **${OVERALL_SCORE_CANONICAL_FONT}** handwriting script exactly — see OVERALL SCORE font design block above.`,
    `Brand red ${BRAND_RED}, ~${targetPx}px max total height, centered with generous padding inside the panel.`,
    'Entire value (digits + % suffix) in the same script — keep compact; must not touch panel edges or fill the whole box.',
  ].join(' ');
}

function overallScoreAndStarsSizeRules(tier: FalHairstyleAnalysis['tier']): string {
  const scorePx = overallScoreFalFontSize(TOP_SCORE_SLOT);
  const starPx = Math.max(22, Math.min(36, Math.round(RATING_SLOT.height * 0.24)));
  const tierKey = normalizeTier(tier);
  const freeStarNote =
    tierKey === 'free'
      ? `FREE: draw all 5 stars using the embossed gradient glyph spec (~${starPx}px each) — centered row with padding.`
      : 'PREMIUM: fill only inside the pre-rendered star outline glyphs at template size — apply the embossed gradient glyph spec to earned stars; never enlarge or replace outlines.';

  return [
    '=== OVERALL SCORE + MATCH RATING — SIZE (CRITICAL) ===',
    overallScoreFontDesignBlock(),
    matchRatingStarDesignBlock(),
    'These size rules apply **only** to the OVERALL SCORE panel and MATCH RATING stars — **not** MATCH 02–04 gray score % rows.',
    'Both panels have a small inner value area below the label. Score and stars must be **compact** — never dominate or touch borders.',
    `OVERALL SCORE %: max ~${scorePx}px tall, centered with padding on all sides.`,
    `MATCH RATING stars: ${freeStarNote} Gradient fill stays inside each outline only — no chunky oversized stars.`,
  ].join('\n');
}

function matchRatingStarsFalLine(look: FalAnalysisLook, tier: FalHairstyleAnalysis['tier']): string {
  const filled = filledStarCount(look.rating);
  const tierKey = normalizeTier(tier);
  const premiumNote =
    tierKey === 'free'
      ? [
          'FREE TEMPLATE: draw exactly 5 stars using the embossed gradient glyph spec above — fill earned stars with radial pink-coral center → brand red points.',
          'Empty stars = outline only. Do not substitute a different star icon set.',
        ].join(' ')
      : [
          'PREMIUM TEMPLATE: five star outline glyphs are pre-rendered — keep those exact shapes/positions.',
          'Fill earned stars with the embossed radial gradient (pink-coral center → #EB1C24 points) + dark-red stroke; leave unearned stars as outline-only.',
          'Do NOT redraw, move, resize, or replace the template star outlines.',
        ].join(' ');

  return [
    `MATCH RATING: fill exactly ${filled} of 5 stars with the **embossed gradient red** glyph (pink-coral center → brand red ${BRAND_RED} at points, dark-red outline).`,
    `Leave the remaining ${5 - filled} star(s) as **empty outlines** (dark-red stroke, no gradient fill).`,
    'Star glyphs must stay inside the MATCH RATING value area at template size — do not enlarge, overflow the panel, or paint oversized fills.',
    premiumNote,
    'FORBIDDEN: flat solid-red stars, yellow/gold stars, emoji stars, oversized stars, or new star shapes outside the MATCH RATING panel.',
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

function matchScoreFalLine(look: FalAnalysisLook): string {
  return [
    `TEXTURE: ${look.unit.trim().toUpperCase()}`,
    `COLOR: ${look.color.trim().toUpperCase()}`,
    `LENGTH: ${displayLength(look.length)}`,
    `MATCH SCORE: print ${formatScorePercent(look.score)} in gray ${MATCH_SCORE_GRAY} inside this row's MATCH SCORE value slot only (small Futura PT Medium — not the red OVERALL SCORE panel).`,
    'Print each value beside its pre-printed label on this MATCH row — TEXTURE, COLOR, LENGTH, then MATCH SCORE on separate labeled lines.',
    'TEXTURE, COLOR, LENGTH = black uppercase Futura PT Medium in their value slots.',
  ].join(' ');
}

function matchRowScoreIsolationBlock(): string {
  return [
    '=== MATCH 02–04 GRAY SCORE % — SEPARATE FROM OVERALL SCORE (CRITICAL) ===',
    `OVERALL SCORE (top-right red panel) and MATCH SCORE % (each MORE MATCHES row) are **different fields** — never swap, duplicate, or link them.`,
    `MATCH SCORE % only: gray ${MATCH_SCORE_GRAY}, small Futura PT Medium, in the MATCH SCORE value slot on that row (below LENGTH on the same MATCH block).`,
    'FORBIDDEN: red/script/large overall-score styling on MATCH SCORE %; printing match scores in the OVERALL SCORE panel; floating % away from the MATCH SCORE label.',
    'Server does **not** composite match-row text — print TEXTURE, COLOR, LENGTH, and gray MATCH SCORE % in-image in each row\'s value slots.',
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
    `TEXTURE, COLOR, LENGTH = black Futura PT Medium. MATCH SCORE % = gray ${MATCH_SCORE_GRAY} only.`,
  ];

  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    lines.push(
      `MATCH ${String(i + 2).padStart(2, '0')}: TEXTURE ${look.unit.trim().toUpperCase()}, COLOR ${look.color.trim().toUpperCase()}, LENGTH ${displayLength(look.length)}, MATCH SCORE ${formatScorePercent(look.score)} (${MATCH_SCORE_GRAY})`
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
    'ONLY fill: client preview photo, TOP MATCH spec column, OVERALL SCORE %, MATCH RATING stars, and EVERY DETAIL MATTERS text rows beside rose icons.',
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
    '=== MATCH THUMBNAILS — SAME CLIENT FACE ===',
    'Every thumbnail square must show the client from IMAGE 2 with different unit/color/length/styling applied.',
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

  const photoRules =
    tierKey === 'free'
      ? [
          '=== CLIENT PHOTO — HAIR IN PANEL CUTOUT ===',
          faceIdentityLockBlock(),
          clientPhotoPanelRulesBlock(),
          'Hair density changes affect hair strands only — never repaint or shrink the face.',
        ]
      : [sharedClientPhotoRulesBlock()];

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
      ? 'OUTPUT ONE COMPLETE FREE-TIER CARD AT 4:5 PORTRAIT — TOP MATCH + specs + every detail matters; overall score % + stars in-image.'
      : 'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — overall score % + stars + MATCH 02–04 row values (gray score %) + every detail matters in-image; TOP MATCH specs + thumbnails in-image.',
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
    `FORBIDDEN: leaving template placeholder NOIR/JET BLACK/LAYERS/24"/250% defaults; printing a different unit or STYLE than the manifest; copying MATCH 02 row values into the TOP MATCH column.`,
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
  analysis.whyItWorks.forEach((line, i) => {
    lines.push(`EVERY DETAIL MATTERS LINE ${i + 1}: ${line}`);
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
    'TOP MATCH specs + every detail matters filled; overall score % + match rating stars generated in-image.',
    'TOP MATCH spec column must match the MANIFEST exactly — not template placeholder NOIR/LAYERS defaults.',
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
    'FINAL CHECK: red pill = "TOP MATCH" only; black header above score panels = client first + last name **centered** in panel; TOP MATCH spec column = manifest values exactly (unit, color, length, lace, density, part, hairline, STYLE); every detail matters + overall score % + match rating stars in-image; thumbs = same client + assigned STYLE; MATCH 02–04 texture/color/length + gray score % printed on each row.'
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

