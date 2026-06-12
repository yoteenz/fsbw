/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * Client photo bottom fade is server-composited after Fal.
 * Overall score %, match-rating stars, TOP MATCH specs, MATCH 02–04 row values,
 * every-detail-matters lines, and photos are generated in-image by Fal.
 */

import {
  bawStylingRefListBlock,
  stylingRefForLook,
  type HairstyleAnalysisStylingRef,
} from './hairstyleAnalysisBawStylingRefs.js';
import { TOP_SCORE_SLOT } from './hairstyleAnalysisLayoutSlots.js';
import { overallScoreFontSize } from './hairstyleAnalysisTextPaths.js';
import { clientFirstName, type MannequinRefIndex } from './hairstyleAnalysisMannequinRefs.js';
import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
  formatScorePercent,
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

const BRAND_RED = '#EB1C24';
const MATCH_SCORE_GRAY = '#808080';

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

function clientPreviewTabLine(firstName: string): string {
  return [
    `CLIENT PREVIEW TAB (white pill above main photo, rose icon on left):`,
    `REPLACE the words "CLIENT PREVIEW" inside that pill with "${firstName}" — same pill shape, rose icon, border, and position.`,
    `Do NOT add "${firstName}" as separate text below, above, or beside the pill.`,
    `First-name text: brand red ${BRAND_RED}, uppercase, bold sans-serif inside the pill only.`,
  ].join('\n');
}

function colorValueLine(look: FalAnalysisLook): string {
  return `COLOR: ${look.color}`;
}

/** Hair-edit guidance only — hex guides retint; never print hex on template value fields. */
function colorHairGuidanceLine(look: FalAnalysisLook): string {
  const hex = (look.hex || '#000000').toUpperCase();
  return `Repaint hair strands to catalog color ${look.color} (pigment target ${hex}) — full strand-level recolor with natural depth; do not print hex on the template.`;
}

function realisticHairRecolorBlock(): string {
  return [
    '=== HAIR COLOR — REALISTIC STRAND REPAINT (NOT AN OVERLAY) ===',
    'Recolor hair at the strand level with natural depth, shine, root-to-tip variation, and soft specular highlights.',
    'Match scene lighting from the selfie — believable shadows inside curls, depth at the part, and dimension at the hairline.',
    'FORBIDDEN: flat color wash, semi-transparent tint, color filter overlay on unchanged hair, posterized hair, sticker-like hair, or wig-cap color block.',
    'Hair must look fully installed and photographed — not a colored layer pasted on top of the original hair.',
  ].join('\n');
}

function styledHairLine(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  const style = displayStyle(look.styling, look.unit);
  if (style === 'NONE') {
    return refs.mannequinRefs.length > 0
      ? 'Finish hair in a polished salon-ready look matching the unit mannequin hair texture (hair region only).'
      : 'Finish hair in a polished salon-ready look matching the catalog unit texture.';
  }
  const stylingRef = stylingRefForLook(refs.stylingRefs, look.styling, look.part, look.unit);
  if (stylingRef) {
    const hex = (look.hex || '#000000').toUpperCase();
    return [
      `STYLE **${style}** — print exactly "${style}" in the STYLE value field (never substitute LAYERS unless STYLE is LAYERS or DEFINE).`,
      `Hairstyle shape: copy **only** from IMAGE ${stylingRef.imageIndex} (BAW ${style} reference, ${stylingRef.part} part).`,
      `Match the curl, crimp, straight, or defined-curl pattern from IMAGE ${stylingRef.imageIndex} exactly; retint strands to ${look.color} (${hex}) only.`,
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
    const refNote = ref ? `use IMAGE ${ref.imageIndex} for salon finish` : 'no styling IMAGE — use mannequin texture only';
    lines.push(
      `${label}: STYLE ${style}, PART ${displayPart(look.part)}, ${refNote} — do NOT use a different style or IMAGE.`
    );
  });

  return lines.join('\n');
}

function clientPhotoFramingBlock(panelLabel: string): string {
  return [
    `=== ${panelLabel} — TIGHT FACE PORTRAIT CROP (CRITICAL — SAME ON EVERY TIER) ===`,
    'FRAMING: tight beauty portrait — head, hair, neck, and upper chest ONLY. Face is the hero; center the face horizontally and vertically in the photo cutout.',
    'CROP IN by zooming on the face — show from just above the hairline down to upper chest / collarbone. Cut off at shoulders or higher.',
    'Use cover-style placement inside the panel cutout: scale IMAGE 2 so the face fills the frame; crop away sides and bottom — do NOT stretch or extend the image downward.',
    'BOTTOM EDGE: hard crop only — let the lower body fall outside the frame. Do NOT paint white clouds, mist, fog, gradients, fades, or acrylic fill at the bottom.',
    'Server applies a fixed symmetrical bottom fade after generation — never invent a soft edge, cloudy overlay, or panel fill.',
    'FORBIDDEN: repainting the bottom half of the photo, hallucinated clothing, invented outfits, extended torso, new neckline, new accessories, or outpainting below what exists in IMAGE 2.',
    'PRESERVE only clothing/jewelry already visible in IMAGE 2 at the crop boundary — do not redesign, recolor, or extend garments. Change HAIR ONLY.',
    'KEEP the exact face, skin tone, age, expression, and camera angle from IMAGE 2 — same person, same likeness.',
    'This tight face-focused crop is mandatory for free, 3-month, 6-month, and 12-month cards — identical framing standard every generation.',
  ].join('\n');
}

function matchThumbnailFramingBlock(): string {
  return [
    'THUMBNAIL FRAMING: even tighter than main preview — face + neck + hair only; crop at shoulders or above.',
    'Square crop centered on the face. Do NOT invent clothing, neckline, or body below the chin/jaw.',
    'Use only pixels from IMAGE 2 — zoom/crop inward; never outpainting or repainting the lower half.',
  ].join('\n');
}

function clientPreviewHairLine(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  return [
    '=== CLIENT PREVIEW (IMAGE 2) — TOP MATCH HAIR ===',
    clientPhotoFramingBlock('CLIENT PREVIEW PANEL'),
    `Hair only: ${look.unit}, ${look.color}, ${displayLength(look.length)}, STYLE ${displayStyle(look.styling, look.unit)}.`,
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
    '=== CLIENT PHOTOS — FACE LOCK + CROP (ALL PREVIEW + THUMBNAILS) ===',
    faceIdentityLockBlock(),
    'Tight face-centered crop from IMAGE 2 — zoom in; crop out torso and lower body. Never repaint clothing or paint clouds/mist/fades at the bottom (server masks the edge).',
    realisticHairRecolorBlock(),
    'HAIR VOLUME: reduce crown/temple bulk — natural strand separation; FORBIDDEN helmet hair, bouffant crown, plastic uniform volume, or shrinking the face to hide extra hair.',
    hairlineRulesBlock(),
    neckAndBodyPreservationBlock(),
  ].join('\n\n');
}

function hairlineRulesBlock(): string {
  return [
    'HAIRLINE: clean lace-front edge only — do NOT add baby hairs, wispy flyaways, edge fuzz, or soft feathering along the forehead/temples.',
    'Do NOT blur or add extra strands at the hairline beyond what is natural in IMAGE 2.',
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
    `Fill exactly ${lineCount} text rows below that header — one complete sentence per row.`,
    'Each row is a stylist fit note: ONE client facial feature (cheekbones, forehead, jawline, chin, eyes, face shape, or undertone) + ONE catalog spec (unit, color, length, styling, part, or density) in the same sentence.',
    'Print each EVERY DETAIL MATTERS LINE verbatim — character-for-character — as black uppercase Futura PT Medium text beside its rose icon.',
    'FORBIDDEN: label:value rows (e.g. "FACE SHAPE: OVAL"), keyword lists, invented slogans, or a different number of lines.',
    'This is NOT a motivational "why it works" essay — do not rewrite into empowerment copy.',
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
].join(', ');

function everyDetailMattersRulesBlock(lineCount: number): string {
  return [
    everyDetailMattersStructureBlock(lineCount),
    '',
    '=== EVERY DETAIL MATTERS LINES (PRINT VERBATIM — ZERO REWRITES) ===',
    'Copy each line below exactly. Do not paraphrase, merge rows, or add new sentences.',
    'Each line must name a specific facial feature AND a specific unit spec — e.g. cheekbones + layers, forehead + middle part, jawline + length.',
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
    'Photo windows are cutouts INSIDE the acrylic panels — place client selfie and thumbnails in the cutout only, behind the glass layer.',
    'ONLY edit inside: (a) photo cutout areas, (b) empty value text slots next to labels, (c) erasing the tier subtitle per rules below.',
    'If panel chrome or red glow degrades, the output is wrong — prioritize preserving IMAGE 1 panel art over aggressive photo edits.',
  ].join('\n');
}


function filledStarCount(rating: number): number {
  return Math.min(5, Math.max(0, Math.round(rating)));
}

function overallScoreFalLine(look: FalAnalysisLook): string {
  const targetPx = overallScoreFontSize(TOP_SCORE_SLOT);
  return [
    `OVERALL SCORE: print ${formatScorePercent(look.score)} in the OVERALL SCORE value area.`,
    `Use Covered By Your Grace–style red script (~${targetPx}px) for digits + Futura % suffix, brand red ${BRAND_RED}.`,
  ].join(' ');
}

function matchRatingStarsFalLine(look: FalAnalysisLook, tier: FalHairstyleAnalysis['tier']): string {
  const filled = filledStarCount(look.rating);
  const tierKey = normalizeTier(tier);
  const premiumNote =
    tierKey === 'free'
      ? [
          'FREE TEMPLATE: draw exactly 5 star outlines matching premium template shape, then fill earned stars.',
          'Do not use a different star icon set.',
        ].join(' ')
      : [
          'PREMIUM TEMPLATE: five star outline glyphs are pre-rendered — use those exact shapes only.',
          'Do NOT redraw, move, resize, or replace the template star outlines.',
        ].join(' ');

  return [
    `MATCH RATING: fill exactly ${filled} of 5 stars with solid brand red ${BRAND_RED} (same red as panel border glow).`,
    `Leave the remaining ${5 - filled} star(s) as empty outlines — do not fill them.`,
    premiumNote,
    'FORBIDDEN: yellow/gold stars, emoji stars, or new star shapes outside the MATCH RATING panel.',
  ].join(' ');
}

function overallScoreAndRatingRules(look: FalAnalysisLook, tier: FalHairstyleAnalysis['tier']): string {
  return [
    '=== OVERALL SCORE + MATCH RATING ===',
    overallScoreFalLine(look),
    matchRatingStarsFalLine(look, tier),
  ].join('\n');
}

function matchScoreFalLine(look: FalAnalysisLook): string {
  return [
    `TEXTURE: ${look.unit.trim().toUpperCase()}`,
    `COLOR: ${look.color.trim().toUpperCase()}`,
    `LENGTH: ${displayLength(look.length)}`,
    `MATCH SCORE: print ${formatScorePercent(look.score)} in gray ${MATCH_SCORE_GRAY} (Futura PT Medium, uppercase %).`,
    'Print all four values in their template value slots on this MATCH row — same horizontal band as the thumbnail.',
    'TEXTURE, COLOR, LENGTH = black uppercase Futura PT Medium beside pre-printed labels.',
  ].join(' ');
}

function matchRowValuesFalRules(): string {
  return [
    '=== MATCH 02–04 VALUE SLOTS — PRINT IN TEMPLATE (FAL IN-IMAGE) ===',
    'For MATCH 02, MATCH 03, and MATCH 04: print TEXTURE, COLOR, and LENGTH in black uppercase Futura PT Medium in each value area beside the pre-printed labels.',
    `MATCH SCORE value area: print the gray percentage only (${MATCH_SCORE_GRAY}) — digits + % suffix, Futura PT Medium on the same row as texture/color/length.`,
    'Labels (TEXTURE:, COLOR:, LENGTH:, MATCH SCORE:) are pre-printed on the template — do not duplicate labels; fill only the empty value slots.',
    'Each row\'s texture, color, length, and score % must sit on the same MATCH row as its thumbnail — never float onto another row.',
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
  analysis: FalHairstyleAnalysis
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
          '=== CLIENT PHOTO — TIGHT FACE CROP + EXACT FACE FROM IMAGE 2 (CRITICAL) ===',
          faceIdentityLockBlock(),
          'Main client preview only — tight face-centered portrait crop from IMAGE 2.',
          'Zoom IN on the face — crop OUT torso, waist, and lower body. Never repaint or invent clothing to fill the panel bottom.',
          'Hair density/volume changes affect hair strands only — never repaint or shrink the face.',
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
    '=== REMOVE TIER / SUBSCRIPTION LABEL (CRITICAL) ===',
    'The template may include a subtitle such as "FREE HAIRSTYLE ANALYSIS", "3 MONTH HAIRSTYLE ANALYSIS",',
    '"6 MONTH HAIRSTYLE ANALYSIS", or "12 MONTH HAIRSTYLE ANALYSIS" below the main header.',
    'ERASE that tier/subscription subtitle completely — paint over with clean marble background matching the template.',
    'The client must NOT see any tier name, month count, or analysis type. Keep "FRONTAL SLAYER" and "hairstyle analysis" header art only.',
    '',
    '=== HAIRLINE — NO BABY HAIRS (ALL HAIR EDITS) ===',
    'Never add baby hairs, wispy flyaways, edge fuzz, or soft feathering along the forehead, temples, or hairline.',
    'Hairline stays clean and defined — lace-front edge only. Do not add extra strands at the hairline.',
    '',
    neckAndBodyPreservationBlock(),
    '',
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

function topMatchBlock(look: FalAnalysisLook): string[] {
  return [
    `TEXTURE: ${look.unit}`,
    colorValueLine(look),
    `LENGTH: ${displayLength(look.length)}`,
    `LACE: ${displayLace(look.lace)}`,
    `DENSITY: ${displayDensity(look.density)}`,
    `PART: ${displayPart(look.part)}`,
    `HAIRLINE: ${displayHairline(look.hairline)}`,
    `STYLE: ${displayStyle(look.styling, look.unit)}`,
  ];
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

function freePromptFooter(analysis: FalHairstyleAnalysis): string {
  return [
    '',
    '=== FINAL CHECK ===',
    'PILL: first name replaces "CLIENT PREVIEW" inside the tab only.',
    'TOP MATCH specs + every detail matters filled; overall score % + match rating stars generated in-image.',
    overallScoreFalLine(analysis.topMatch),
    matchRatingStarsFalLine(analysis.topMatch, analysis.tier),
  ].join('\n');
}

function freePrompt(analysis: FalHairstyleAnalysis, refs: FalPromptImageRefs): string {
  const top = analysis.topMatch;
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs, analysis),
    '',
    freeTierOnlyBlock(),
    '',
    clientPreviewTabLine(firstName),
    clientPreviewHairLine(top, refs),
    '',
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
  ];
  appendEveryDetailMattersLines(lines, analysis);
  lines.push(freePromptFooter(analysis));
  return lines.join('\n');
}

function threeMonthPrompt(analysis: FalHairstyleAnalysis, refs: FalPromptImageRefs): string {
  const top = analysis.topMatch;
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs, analysis),
    '',
    clientPreviewTabLine(firstName),
    clientPreviewHairLine(top, refs),
    '',
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
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
    'FINAL CHECK: pill first name only; TOP MATCH specs + every detail matters + overall score % + match rating stars in-image; thumbs = same client + assigned STYLE; MATCH 02–04 texture/color/length + gray score % printed on each row.'
  );
  return lines.join('\n');
}

export function buildHairstyleAnalysisFalPrompt(
  analysis: FalHairstyleAnalysis,
  refs: FalPromptImageRefs
): string {
  const tier = normalizeTier(analysis.tier);
  const prompt = tier === 'free' ? freePrompt(analysis, refs) : threeMonthPrompt(analysis, refs);
  if (prompt.length > HAIRSTYLE_ANALYSIS_FAL_PROMPT_MAX_CHARS) {
    throw new Error(
      `Hairstyle analysis prompt too long (${prompt.length} characters; Fal limit is ${HAIRSTYLE_ANALYSIS_FAL_PROMPT_MAX_CHARS}).`
    );
  }
  return prompt;
}

