/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * Only overall score % and match-rating stars are composited server-side after Fal.
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
  return `Use IMAGE ${idx} as the authoritative 3D ${unit} mannequin texture reference (curl pattern, strand definition, volume, silhouette).`;
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
    `Change ONLY the hair to match TOP MATCH: ${look.unit}, ${look.color}, ${displayLength(look.length)}.`,
    realisticHairRecolorBlock(),
    realisticHairDensityBlock(displayDensity(look.density)),
    colorHairGuidanceLine(look),
    styledHairLine(look, refs),
    mannequinRefLine(look.unit, refs),
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

function realisticHairDensityBlock(densityLabel: string): string {
  return [
    '=== HAIR DENSITY — REALISTIC, NOT WIG-CAP / HELMET HAIR ===',
    `Target catalog density: ${densityLabel} — interpret as natural installed fullness, NOT oversized wig volume.`,
    'Reduce bulk at crown and temples — visible strand separation, natural scalp depth at the part, believable weight at the ends.',
    'FORBIDDEN: helmet hair, uniform plastic volume, bouffant crown, solid hair helmet, wig-cap puff, or one solid mass with no strand detail.',
    'Additional match thumbnails must look lighter and more natural than the main client preview — avoid stacking extra volume on every alternate look.',
  ].join('\n');
}

function matchThumbnailBlock(label: string, look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  return [
    `${label} THUMBNAIL (small square on template):`,
    '- REQUIRED: front-facing portrait of the SAME CLIENT from IMAGE 2 — identical face, skin tone, and expression.',
    matchThumbnailFramingBlock(),
    `- TEXTURE: ${look.unit}`,
    realisticHairRecolorBlock(),
    colorHairGuidanceLine(look),
    `- LENGTH: ${displayLength(look.length)}`,
    `- DENSITY: ${displayDensity(look.density)} — natural installed fullness; reduce crown/temple bulk vs main preview.`,
    styledHairLine(look, refs),
    mannequinRefLine(look.unit, refs),
    realisticHairDensityBlock(displayDensity(look.density)),
    '- Composite client selfie + unit texture for maximum accuracy — strand-level recolor, not a color overlay.',
    '- Thumbnail hair must be SLIMMER and less voluminous than the main client preview — realistic density, not helmet wig hair.',
    '- FORBIDDEN: back-of-head shots, stock photos, wig-only swatches, silhouettes, helmet hair, or any different person.',
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

function blankScoreAndRatingRules(): string {
  return [
    '=== SCORES + STARS — LEAVE BLANK (SERVER OVERLAY ONLY) ===',
    'Do NOT print the overall score percentage in the OVERALL SCORE value area.',
    'Do NOT draw stars or rating glyphs in the MATCH RATING row.',
    'Do NOT print ANY match score percentage in additional-match / portfolio / alternative rows — leave every MATCH SCORE value slot empty.',
    'Leave all score and star areas blank — you fill texture, color, length, style, specs, and photos only.',
  ].join('\n');
}

function matchScoreFalLine(look: FalAnalysisLook): string {
  const pct = formatScorePercent(look.score);
  return [
    `MATCH SCORE value slot for this row: LEAVE BLANK — server overlays "${pct}" in gray ${MATCH_SCORE_GRAY} after generation.`,
    'Do NOT print any percentage in the match score value area.',
  ].join(' ');
}

function matchScoreManifestBlock(analysis: FalHairstyleAnalysis): string {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return '';

  const lines: string[] = [
    '=== MATCH SCORE VALUES (SERVER OVERLAY — DO NOT PRINT ON TEMPLATE) ===',
    'Each row has a unique score assigned server-side. Leave every MATCH SCORE value slot empty.',
  ];

  if (tier === 'three_month') {
    analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
      lines.push(`MATCH ${String(i + 2).padStart(2, '0')} score = ${formatScorePercent(look.score)} (blank on template)`);
    });
  } else if (tier === 'six_month') {
    const portfolio = [analysis.topMatch, ...analysis.additionalLooks];
    portfolio.slice(0, 7).forEach((look, i) => {
      lines.push(`ALTERNATIVE ${String(i + 1).padStart(2, '0')} score = ${formatScorePercent(look.score)} (blank on template)`);
    });
  } else {
    analysis.additionalLooks.slice(0, 9).forEach((alt, i) => {
      lines.push(`ALTERNATIVE ${String(i + 1).padStart(2, '0')} score = ${formatScorePercent(alt.score)} (blank on template)`);
    });
  }

  return lines.join('\n');
}

function buildTemplateRules(refs: FalPromptImageRefs): string {
  const mannequinList =
    refs.mannequinRefs.length > 0
      ? refs.mannequinRefs
          .map((r) => `IMAGE ${r.imageIndex} = 3D ${r.unit} mannequin front (texture reference only)`)
          .join('\n')
      : '';

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
    '=== ROSE ICONS — PIXEL-PERFECT PRESERVATION (CRITICAL) ===',
    'EVERY RED ROSE ICON ON THE TEMPLATE IS PRE-RENDERED ART — DO NOT REDRAW, REGENERATE, STRETCH, BLUR, OR REPLACE ANY ROSE.',
    'DO NOT ADD NEW ROSE ICONS. DO NOT CHANGE ROSE SHAPE, SIZE, POSITION, OR COLOR.',
    '',
    blankScoreAndRatingRules(),
    '',
    mannequinList,
    '',
    bawStylingRefListBlock(refs.stylingRefs),
    '',
    '=== SALON STYLING — BAW REFERENCES ONLY (NO INVENTED STYLES) ===',
    'When STYLE is LAYERS, CRIMPS, FLAT IRON, DEFINE, or WAND CURLS: copy hairstyle shape from the matching BAW styling reference IMAGE.',
    'Retint hair to the look catalog color (hex in hair-edit instructions) — do not create new curl, crimp, or straight patterns.',
    '',
    '=== ADDITIONAL MATCHES — VARIED STYLING ===',
    'Each additional match uses its own STYLE value — salon finish must differ across matches for variety.',
    'Apply the assigned BAW styling reference on every additional-match thumbnail.',
    '',
    '=== CLIENT PHOTOS — TIGHT FACE CROP ON EVERY TIER (CRITICAL) ===',
    'Main client preview + every match thumbnail: tight face-centered portrait crop from IMAGE 2.',
    'Zoom IN on the face — crop OUT torso, waist, and lower body. Never repaint or invent clothing to fill the panel bottom.',
    'If the crop leaves empty space at the bottom, use a soft fade into the panel — NOT generated outfit/fabric.',
    'Same framing standard on free, 3-month, 6-month, and 12-month templates — every generation must match this rule.',
    '',
    '=== MATCH THUMBNAILS — SAME CLIENT FACE + MANNEQUIN TEXTURE ===',
    'Every thumbnail square must show the client from IMAGE 2 with different unit/color/length/styling applied.',
    'Thumbnails use an even tighter face/neck crop than the main preview — no invented clothing below the jaw.',
    'Use the matching 3D mannequin image (listed above) as the hair texture reference for that unit.',
    'NEVER use back-of-head stock photos, different people, hair-only swatches, or repainted lower-body clothing.',
    '',
    'TOP MATCH spec values, match row texture/color/length/style, portfolio lines, and every-detail-matters lines: black uppercase Futura PT Medium.',
    'ALL score percentages (overall + every match row): LEAVE BLANK — server overlay only.',
    '',
    'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — fill texture/color/length/style/specs/photos; leave all score % and stars blank.',
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

function portfolioLine(rank: number, look: FalAnalysisLook): string {
  const style = displayStyle(look.styling);
  const styleSuffix = style !== 'NONE' ? ` + ${style}` : '';
  return `${String(rank).padStart(2, '0')} ${look.unit}${styleSuffix}`;
}

const PROMPT_FOOTER = [
  '',
  '=== FINAL CHECK ===',
  'PILL: first name replaces "CLIENT PREVIEW" inside the tab — not below it.',
  'CLIENT PANEL: tight face-centered portrait crop — head/neck/upper chest only; never repaint clothing on the bottom half.',
  'PHOTO FRAMING: zoom on face, crop out lower body; soft bottom fade OK — invented outfits/clothing FORBIDDEN.',
  'TIER SUBTITLE: erased — no month/tier analysis label visible.',
  'HAIRLINE: no baby hairs or wispy flyaways anywhere.',
  'TOP MATCH spec column: all values filled in black (texture, color, length, lace, density, part, hairline, style).',
  'OVERALL SCORE %, MATCH RATING stars, and ALL match-row score % slots: left blank for server overlay.',
  'THUMBNAILS: same client face from IMAGE 2 — BAW styling refs for salon shapes only.',
  'EVERY DETAIL MATTERS: fixed rose-icon rows, one verbatim sentence per line — no label:value format.',
  'PANEL CHROME: acrylic frost + red glow preserved exactly from IMAGE 1.',
  'COLOR values: color name only — no hex codes or parentheses on the template.',
].join('\n');

function freePrompt(analysis: FalHairstyleAnalysis, refs: FalPromptImageRefs): string {
  const top = analysis.topMatch;
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs),
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
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

function threeMonthPrompt(analysis: FalHairstyleAnalysis, refs: FalPromptImageRefs): string {
  const top = analysis.topMatch;
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs),
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
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

function sixMonthPrompt(analysis: FalHairstyleAnalysis, refs: FalPromptImageRefs): string {
  const top = analysis.topMatch;
  const portfolio = [top, ...analysis.additionalLooks];
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs),
    '',
    clientPreviewTabLine(firstName),
    clientPreviewHairLine(top, refs),
    '',
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
    '',
    'STYLE PORTFOLIO — FILL EACH ALTERNATIVE ROW (THUMBNAIL + TEXTURE + COLOR + LENGTH + STYLE + MATCH SCORE):',
  ];
  portfolio.slice(0, 7).forEach((look, i) => {
    const label = `ALTERNATIVE ${String(i + 1).padStart(2, '0')}`;
    lines.push(`${label}: ${portfolioLine(i + 1, look)}`);
    lines.push(`  TEXTURE: ${look.unit}`);
    lines.push(`  ${colorValueLine(look)}`);
    lines.push(`  LENGTH: ${displayLength(look.length)}`);
    lines.push(`  STYLE: ${displayStyle(look.styling)}`);
    lines.push(`  ${matchScoreFalLine(look)}`);
    lines.push(matchThumbnailBlock(`  ${label}`, look, refs));
  });
  lines.push('');
  lines.push(matchScoreManifestBlock(analysis));
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

function twelveMonthPrompt(analysis: FalHairstyleAnalysis, refs: FalPromptImageRefs): string {
  const top = analysis.topMatch;
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs),
    '',
    clientPreviewTabLine(firstName),
    clientPreviewHairLine(top, refs),
    '',
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
    '',
    'STYLE PORTFOLIO GRID — FILL ALL 9 ALTERNATIVES (THUMBNAIL + TEXTURE + COLOR + LENGTH + STYLE + MATCH SCORE):',
  ];
  analysis.additionalLooks.slice(0, 9).forEach((alt, i) => {
    const label = `ALTERNATIVE ${String(i + 1).padStart(2, '0')}`;
    lines.push(`${label}:`);
    lines.push(`  TEXTURE: ${alt.unit}`);
    lines.push(`  ${colorValueLine(alt)}`);
    lines.push(`  LENGTH: ${displayLength(alt.length)}`);
    lines.push(`  STYLE: ${displayStyle(alt.styling)}`);
    lines.push(`  ${matchScoreFalLine(alt)}`);
    lines.push(matchThumbnailBlock(`  ${label}`, alt, refs));
  });
  lines.push('');
  lines.push(matchScoreManifestBlock(analysis));
  if (analysis.whyItWorks.length > 0) {
    lines.push('');
    lines.push(everyDetailMattersRulesBlock(analysis.whyItWorks.length));
    analysis.whyItWorks.forEach((line, i) => {
      lines.push(`EVERY DETAIL MATTERS LINE ${i + 1}: ${line}`);
    });
  }
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

export function buildHairstyleAnalysisFalPrompt(
  analysis: FalHairstyleAnalysis,
  refs: FalPromptImageRefs
): string {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return freePrompt(analysis, refs);
  if (tier === 'three_month') return threeMonthPrompt(analysis, refs);
  if (tier === 'six_month') return sixMonthPrompt(analysis, refs);
  return twelveMonthPrompt(analysis, refs);
}

export const HAIRSTYLE_ANALYSIS_STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
export const HAIRSTYLE_ANALYSIS_STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';
