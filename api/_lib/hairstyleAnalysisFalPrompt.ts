/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * All text and stars (overall score %, match rating, match rows) are generated in-image by Fal.
 */

import {
  bawStylingRefListBlock,
  stylingRefForLook,
  type HairstyleAnalysisStylingRef,
} from './hairstyleAnalysisBawStylingRefs.js';
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

function normalizeTier(tier: FalHairstyleAnalysis['tier']): Exclude<FalHairstyleAnalysis['tier'], 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

function mannequinIndexForUnit(refs: { mannequinRefs: MannequinRefIndex[] }, unit: string): number | null {
  const u = unit.trim().toUpperCase();
  const hit = refs.mannequinRefs.find((r) => r.unit === u);
  return hit?.imageIndex ?? null;
}

function mannequinRefLine(unit: string, refs: { mannequinRefs: MannequinRefIndex[] }): string {
  const idx = mannequinIndexForUnit(refs, unit);
  if (!idx) return '';
  return [
    `Use IMAGE ${idx} as the authoritative ${unit} mannequin front reference.`,
    'Copy curl pattern, strand definition, volume, silhouette, AND **one-shoulder drape geometry** from that mannequin — not symmetric hair on both shoulders.',
  ].join(' ');
}

/** Front portrait drape — match 2D/3D mannequin + TOP MATCH hero (not twin-shoulder curtain). */
function asymmetricOneShoulderDrapeBlock(scope: 'all_photos' | 'thumbnails_only'): string {
  const scopeLine =
    scope === 'all_photos'
      ? 'Applies to the **main client preview** AND **every MATCH 02–04 thumbnail** — identical shoulder geometry on all photos.'
      : '**MATCH 02–04 thumbnails only:** use the **same** one-shoulder drape as the main client preview — never revert to both-shoulder hair on small squares.';

  return [
    '=== HAIR DRAPE — ONE SHOULDER ONLY (MATCH MANNEQUIN + TOP MATCH HERO — CRITICAL) ===',
    scopeLine,
    'Long hair uses **asymmetric one-shoulder drape** exactly like catalog mannequin front assets and the TOP MATCH hero portrait.',
    '**FORWARD DRAPE (only heavy cascade):** length falls **forward over the model\'s LEFT shoulder** — **right side of the image** (viewer\'s right). This is the **only** shoulder with thick hair down the chest.',
    '**BEHIND / CLEAR SHOULDER:** on the model\'s **RIGHT shoulder** — **left side of the image** (viewer\'s left) — sweep hair **behind** the shoulder or tuck it back so the shoulder cap, neck line, and jewelry stay **visible**. No thick forward hair on this shoulder.',
    '**FORBIDDEN:** symmetrical curtain on **both** shoulders, twin waterfalls, equal hair mass left and right, mirrored twin drape, or “balanced” split over both collarbones.',
    '**Self-check:** if MATCH thumbnails show thick hair forward on **both** shoulders while the hero shows one-shoulder drape → **failed**. Regenerate thumbnails to match hero + mannequin geometry.',
    'When a unit mannequin IMAGE is attached: copy its **silhouette and shoulder sweep** — not only curl texture. Salon style (LAYERS, CRIMPS, FLAT IRON) changes texture but **keeps** this same asymmetric shoulder placement.',
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
  const style = displayStyle(look.styling);
  if (style === 'NONE') {
    return 'Finish hair in a polished salon-ready look matching the unit texture reference.';
  }
  const stylingRef = stylingRefForLook(refs.stylingRefs, look.styling, look.part);
  if (stylingRef) {
    const hex = (look.hex || '#000000').toUpperCase();
    return (
      `Copy hairstyle shape from IMAGE ${stylingRef.imageIndex} (BAW ${stylingRef.salonMode.toUpperCase()} reference, ${stylingRef.part} part) — ` +
      `match the curl, crimp, or straight pattern exactly; change ONLY hair pigment to ${look.color} (${hex}). ` +
      `Do not invent a different salon finish.`
    );
  }
  return `Apply BAW salon styling ${style} only — do not invent a new curl, crimp, or straight pattern.`;
}

function clientPhotoFramingBlock(panelLabel: string): string {
  return [
    `=== ${panelLabel} — TIGHT FACE PORTRAIT CROP (CRITICAL — SAME ON EVERY TIER) ===`,
    'FRAMING: tight beauty portrait — head, hair, neck, and upper chest ONLY. Face is the hero; center the face horizontally and vertically in the photo cutout.',
    'CROP IN by zooming on the face — show from just above the hairline down to upper chest / collarbone. Cut off at shoulders or higher.',
    'Use cover-style placement inside the panel cutout: scale IMAGE 2 so the face fills the frame; crop away sides and bottom — do NOT stretch or extend the image downward.',
    'BOTTOM EDGE: if the crop does not reach the panel bottom, let the lower area fade softly into the panel (white/acrylic) — NEVER paint, invent, or extend new body, torso, dress, top, straps, sequins, or jewelry to fill empty space.',
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
    '=== CLIENT PREVIEW PHOTO (IMAGE 2) — TIGHT FACE PORTRAIT + STYLED TOP MATCH ===',
    clientPhotoFramingBlock('CLIENT PREVIEW PANEL'),
    faceIdentityLockBlock(),
    `Change ONLY the hair to match TOP MATCH: ${look.unit}, ${look.color}, ${displayLength(look.length)}.`,
    realisticHairRecolorBlock(),
    realisticHairDensityBlock(displayDensity(look.density), false),
    colorHairGuidanceLine(look),
    styledHairLine(look, refs),
    mannequinRefLine(look.unit, refs),
    asymmetricOneShoulderDrapeBlock('all_photos'),
    'NO wig cap, NO lace visible, NO different person.',
    hairlineRulesBlock(),
  ]
    .filter(Boolean)
    .join('\n');
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
  return [
    `${label} THUMBNAIL (small square on template):`,
    '- REQUIRED: front-facing portrait of the SAME CLIENT from IMAGE 2 — identical face, skin tone, and expression.',
    matchThumbnailFramingBlock(),
    faceIdentityLockBlock(),
    `- TEXTURE: ${look.unit}`,
    realisticHairRecolorBlock(),
    colorHairGuidanceLine(look),
    `- LENGTH: ${displayLength(look.length)}`,
    `- DENSITY: ${displayDensity(look.density)} — hair strands only; face unchanged from IMAGE 2.`,
    styledHairLine(look, refs),
    mannequinRefLine(look.unit, refs),
    realisticHairDensityBlock(displayDensity(look.density), true),
    asymmetricOneShoulderDrapeBlock('thumbnails_only'),
    '- Composite client selfie + unit mannequin silhouette for maximum accuracy — strand-level recolor on hair only, not a color overlay on skin.',
    '- FORBIDDEN: repainting the face, back-of-head shots, stock photos, wig-only swatches, silhouettes, helmet hair, symmetric both-shoulder drape, or any different person.',
    '- NO baby hairs or wispy hairline flyaways on thumbnails.',
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
  const scoreText = formatScorePercent(look.score);
  return [
    `OVERALL SCORE value: print "${scoreText}" in the OVERALL SCORE value area.`,
    `Typography: elegant casual brush script / handwritten style visually similar to Covered By Your Grace — flowing curves, not a plain sans-serif or Futura.`,
    `Color: brand red ${BRAND_RED} only. Do NOT print the words "COVERED BY YOUR GRACE" or any font name.`,
    'Center the percentage inside the frosted value panel beside the OVERALL SCORE label.',
  ].join(' ');
}

function matchRatingStarsFalLine(look: FalAnalysisLook, tier: FalHairstyleAnalysis['tier']): string {
  const filled = filledStarCount(look.rating);
  const tierKey = normalizeTier(tier);
  const premiumNote =
    tierKey === 'free'
      ? [
          'FREE TEMPLATE: the MATCH RATING row may have no star glyphs yet — draw a horizontal row of exactly 5 star outlines matching the premium template star shape (same outline style, size, and spacing as IMG_2549).',
          'Do not use a different star icon set.',
        ].join(' ')
      : [
          'PREMIUM TEMPLATE: five star outline glyphs are already pre-rendered in the MATCH RATING row — use those exact shapes only.',
          'Do NOT redraw, move, resize, or replace the template star outlines.',
        ].join(' ');

  return [
    `MATCH RATING: fill exactly ${filled} of 5 stars with solid brand red ${BRAND_RED} (same red as panel border glow).`,
    `Leave the remaining ${5 - filled} star(s) as empty outlines — do not fill them.`,
    premiumNote,
    'FORBIDDEN: yellow/gold stars, emoji stars, new star shapes, or stars outside the MATCH RATING value panel.',
  ].join(' ');
}

function overallScoreAndRatingRules(look: FalAnalysisLook, tier: FalHairstyleAnalysis['tier']): string {
  return [
    '=== OVERALL SCORE + MATCH RATING — FILL IN TEMPLATE (IN-IMAGE) ===',
    overallScoreFalLine(look),
    matchRatingStarsFalLine(look, tier),
  ].join('\n');
}

function matchScoreFalLine(look: FalAnalysisLook): string {
  return [
    `MATCH SCORE value: print "${formatScorePercent(look.score)}" in medium gray ${MATCH_SCORE_GRAY} beside the "MATCH SCORE:" label.`,
    'Use black uppercase Futura PT Medium for texture, color, and length values on the same row.',
  ].join(' ');
}

function matchScoreManifestBlock(analysis: FalHairstyleAnalysis): string {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return '';

  const lines: string[] = [
    '=== MATCH 02–04 ROW VALUES — PRINT IN TEMPLATE SLOTS ===',
    'Fill texture, color, length, and match score % for each additional match in the value areas beside their labels.',
    'Texture/color/length: black uppercase Futura PT Medium. Match score %: medium gray only.',
  ];

  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    lines.push(
      `MATCH ${String(i + 2).padStart(2, '0')}: TEXTURE ${look.unit}, COLOR ${look.color}, LENGTH ${displayLength(look.length)}, MATCH SCORE ${formatScorePercent(look.score)}`
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
    'Leave all other template areas unchanged — marble/panel chrome only; never invent extra hairstyle comparisons.',
  ].join('\n');
}

function additionalMatchTemplateRules(): string[] {
  return [
    '=== ADDITIONAL MATCHES — VARIED STYLING ===',
    'Each additional match uses its own STYLE value — salon finish must differ across matches for variety.',
    'Apply the assigned BAW styling reference on every additional-match thumbnail.',
    '',
    '=== MATCH THUMBNAILS — SAME CLIENT FACE + MANNEQUIN SILHOUETTE ===',
    'Every thumbnail square must show the client from IMAGE 2 with different unit/color/length/styling applied.',
    'Thumbnails use an even tighter face/neck crop than the main preview — no invented clothing below the jaw.',
    'Use the matching mannequin front IMAGE as texture **and** one-shoulder drape reference for that unit.',
    'NEVER use back-of-head stock photos, different people, hair-only swatches, repainted lower-body clothing, or symmetric both-shoulder hair.',
    '',
    'TOP MATCH spec values and every-detail-matters lines: black uppercase Futura PT Medium.',
    'MATCH 02–04 texture/color/length: black uppercase Futura PT Medium in each value slot.',
    'MATCH 02–04 match score %: medium gray in each MATCH SCORE value slot.',
  ];
}

function buildTemplateRules(
  refs: FalPromptImageRefs,
  analysis: FalHairstyleAnalysis
): string {
  const tierKey = normalizeTier(analysis.tier);
  const mannequinList =
    refs.mannequinRefs.length > 0
      ? refs.mannequinRefs
          .map((r) => `IMAGE ${r.imageIndex} = ${r.unit} mannequin front (texture + one-shoulder drape silhouette — NOT both shoulders)`)
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
      : [
          '=== CLIENT PHOTOS — TIGHT FACE CROP + EXACT FACE FROM IMAGE 2 (CRITICAL) ===',
          faceIdentityLockBlock(),
          'Main client preview + every match thumbnail: tight face-centered portrait crop from IMAGE 2.',
          'Zoom IN on the face — crop OUT torso, waist, and lower body. Never repaint or invent clothing to fill the panel bottom.',
          'If the crop leaves empty space at the bottom, use a soft fade into the panel — NOT generated outfit/fabric.',
          'Hair density/volume changes affect hair strands only — never repaint or shrink the face.',
          'Same framing standard on 3-month, 6-month, and 12-month templates — every generation must match this rule.',
        ];

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
    asymmetricOneShoulderDrapeBlock('all_photos'),
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
    ...(tierKey === 'free' ? [freeTierOnlyBlock(), ''] : additionalMatchTemplateRules()),
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
      ? 'OUTPUT ONE COMPLETE FREE-TIER CARD AT 4:5 PORTRAIT — TOP MATCH + specs + every detail matters + overall score % + match rating stars.'
      : 'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — fill every value field including overall score %, match rating stars, and match rows.',
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
    `STYLE: ${displayStyle(look.styling)}`,
  ];
}

function altRowBlock(label: string, look: FalAnalysisLook): string {
  return [
    label,
    `TEXTURE: ${look.unit}`,
    colorValueLine(look),
    `LENGTH: ${displayLength(look.length)}`,
    `STYLE: ${displayStyle(look.styling)}`,
    matchScoreFalLine(look),
  ].join('\n');
}

function promptFooter(analysis: FalHairstyleAnalysis): string {
  const tierKey = normalizeTier(analysis.tier);
  const lines = [
    '',
    '=== FINAL CHECK ===',
    'PILL: first name replaces "CLIENT PREVIEW" inside the tab — not below it.',
    'CLIENT PANEL: tight face-centered portrait crop — head/neck/upper chest only; never repaint clothing on the bottom half.',
    'FACE LOCK: exact face from IMAGE 2 — hair edits only; never repaint facial skin or features.',
    'PHOTO FRAMING: zoom on face, crop out lower body; soft bottom fade OK — invented outfits/clothing FORBIDDEN.',
    'TIER SUBTITLE: erased — no month/tier analysis label visible.',
    'HAIRLINE: no baby hairs or wispy flyaways anywhere.',
    'TOP MATCH spec column: all values filled in black (texture, color, length, lace, density, part, hairline, style).',
    overallScoreFalLine(analysis.topMatch),
    matchRatingStarsFalLine(analysis.topMatch, analysis.tier),
  ];

  if (tierKey === 'free') {
    lines.push(
      'FREE TIER: TOP MATCH ONLY — no MATCH 02+, no portfolio thumbnails, no horizontal match strip, no extra match scores.'
    );
  } else {
    lines.push(
      'MATCH 02–04: texture, color, length, and gray match score % filled in template value slots.',
      'THUMBNAILS: same client face from IMAGE 2 — one-shoulder drape like hero + mannequin; BAW styling refs for salon shapes only.',
      'DRAPE CHECK: no thick forward hair on both shoulders on any match thumbnail.'
    );
  }

  lines.push(
    'EVERY DETAIL MATTERS: fixed rose-icon rows, one verbatim sentence per line — no label:value format.',
    'PANEL CHROME: acrylic frost + red glow preserved exactly from IMAGE 1.',
    'COLOR values: color name only — no hex codes or parentheses on the template.'
  );

  return lines.join('\n');
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
  if (analysis.whyItWorks.length > 0) {
    lines.push('');
    lines.push(everyDetailMattersRulesBlock(analysis.whyItWorks.length));
    analysis.whyItWorks.forEach((line, i) => {
      lines.push(`EVERY DETAIL MATTERS LINE ${i + 1}: ${line}`);
    });
  }
  lines.push(promptFooter(analysis));
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
  lines.push('');
  lines.push(matchScoreManifestBlock(analysis));
  lines.push(promptFooter(analysis));
  return lines.join('\n');
}

export function buildHairstyleAnalysisFalPrompt(
  analysis: FalHairstyleAnalysis,
  refs: FalPromptImageRefs
): string {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return freePrompt(analysis, refs);
  return threeMonthPrompt(analysis, refs);
}

