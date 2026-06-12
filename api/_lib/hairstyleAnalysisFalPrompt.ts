/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * Keep field copy aligned with src/utils/hairstyleAnalysisOverlayContent.ts.
 */

import { clientFirstName, type MannequinRefIndex } from './hairstyleAnalysisMannequinRefs.js';

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
};

/** Public site paths — resolved to absolute URLs in hairstyleAnalysisFal.ts (images 3 & 4). */
export const HAIRSTYLE_ANALYSIS_STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
export const HAIRSTYLE_ANALYSIS_STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';

const BRAND_RED = '#EB1C24';

function normalizeTier(tier: FalHairstyleAnalysis['tier']): Exclude<FalHairstyleAnalysis['tier'], 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

function displayLength(length: string): string {
  const u = length.toUpperCase();
  return u.includes('INCH') ? u : `${u} INCHES`;
}

function displayLace(lace: string): string {
  return lace.replace(/\s*LACE\s*$/i, '').replace(/\s*HD\s*$/i, ' HD').trim().toUpperCase();
}

function displayDensity(density: string): string {
  return density.replace(/\s*DENSITY\s*$/i, '').trim();
}

function displayHairline(hairline: string): string {
  return hairline.replace(/\s*HAIRLINE\s*$/i, '').trim().toUpperCase();
}

function displayPart(part: string): string {
  const p = part.replace(/\s*PART\s*$/i, '').trim().toUpperCase();
  return p.includes('PART') ? p : `${p} PART`;
}

function displayStyle(styling: string): string {
  const s = styling.replace(/^STYLING:\s*/i, '').trim().toUpperCase();
  if (s === 'LAYERS') return 'SOFT FACE FRAMING LAYERS';
  return s;
}

function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

function mannequinIndexForUnit(refs: FalPromptImageRefs, unit: string): number | null {
  const u = unit.trim().toUpperCase();
  const hit = refs.mannequinRefs.find((r) => r.unit === u);
  return hit?.imageIndex ?? null;
}

function mannequinRefLine(unit: string, refs: FalPromptImageRefs): string {
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

function clientPreviewHairLine(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  return [
    '=== CLIENT PREVIEW PHOTO (IMAGE 2) — FULL BLEED, ONE PERSON ONLY ===',
    'Scale IMAGE 2 to COMPLETELY FILL the large client preview panel edge-to-edge (top, bottom, left, right).',
    'NO inner padding, NO inset crop, NO letterboxing, NO margins — photo must touch all four inner edges of the panel border.',
    'Use cover-style scaling: center the client face; crop overflow at edges if needed, but the panel must look full, not a smaller photo floating inside.',
    'KEEP the exact face, skin tone, age, expression, body, and camera angle from IMAGE 2.',
    `Change ONLY the hair to match TOP MATCH: ${look.unit}, ${look.color}, ${displayLength(look.length)}.`,
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

function matchThumbnailBlock(label: string, look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  return [
    `${label} THUMBNAIL (small square on template):`,
    '- REQUIRED: front-facing portrait of the SAME CLIENT from IMAGE 2 — identical face, skin tone, and expression.',
    `- Apply this match hair onto that client: TEXTURE ${look.unit}, COLOR ${look.color}, LENGTH ${displayLength(look.length)}.`,
    mannequinRefLine(look.unit, refs),
    '- Composite client selfie + mannequin hair texture for maximum accuracy.',
    '- FORBIDDEN: back-of-head shots, stock photos, wig-only swatches, silhouettes, or any different person.',
    '- NO baby hairs or wispy hairline flyaways on thumbnails.',
  ]
    .filter(Boolean)
    .join('\n');
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
    '=== BRAND TYPOGRAPHY & COLORS ===',
    'OVERALL SCORE VALUE: print ONLY the percentage number (e.g. "98%") in brand red ' +
      BRAND_RED +
      ' using the decorative "Covered By Your Grace" display font.',
    'The label "OVERALL SCORE" is already on the template — do NOT repeat it.',
    'Do NOT render the words "COVERED BY YOUR GRACE" as visible text anywhere on the card.',
    '',
    '=== MATCH RATING STARS — WEBSITE STYLE (IMAGES 3 & 4) ===',
    'IMAGE 3 = EMPTY STAR REFERENCE: white fill inside the star, thin black border/outline (Frontal Slayer site style).',
    `IMAGE 4 = FILLED STAR REFERENCE: solid brand red ${BRAND_RED} fill, thin black border (Frontal Slayer site style).`,
    'In the MATCH RATING box: draw exactly 5 small five-point stars in a row — copy the shape from images 3 & 4.',
    'FILLED RATING STARS = red background like image 4. EMPTY RATING STARS = white background + black border like image 3.',
    'NO yellow stars, NO gray stars, NO emoji ★ characters — only the website star icons described above.',
    '',
    'ALL OTHER POPULATED VALUES (specs, portfolio text, why lines): black uppercase Futura PT Medium style.',
    '',
    mannequinList,
    '',
    '=== MATCH THUMBNAILS — SAME CLIENT FACE + MANNEQUIN TEXTURE ===',
    'Every thumbnail square must show the client from IMAGE 2 with different unit/color/length hair applied.',
    'Use the matching 3D mannequin image (listed above) as the hair texture reference for that unit.',
    'NEVER use back-of-head stock photos, different people, or hair-only swatches without the client face.',
    '',
    'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — EVERY VALUE FILLED, NO BLANK PLACEHOLDERS.',
  ]
    .filter(Boolean)
    .join('\n');
}

function topMatchBlock(look: FalAnalysisLook): string[] {
  return [
    `TEXTURE: ${look.unit}`,
    `COLOR: ${look.color}`,
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
    `COLOR: ${look.color}`,
    `LENGTH: ${displayLength(look.length)}`,
    `MATCH SCORE: ${formatScore(look.score)}`,
  ].join('\n');
}

function portfolioLine(rank: number, look: FalAnalysisLook): string {
  const style =
    displayStyle(look.styling) !== 'NONE' && displayStyle(look.styling) !== 'LAYERS'
      ? ` + ${displayStyle(look.styling)}`
      : displayStyle(look.styling) === 'LAYERS'
        ? ' + LAYERS'
        : '';
  return `${String(rank).padStart(2, '0')} ${look.unit}${style} — ${formatScore(look.score)}`;
}

function describeMatchRatingStars(rating: number): string {
  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  const empty = 5 - filled;
  return [
    `MATCH RATING — ${filled} filled + ${empty} empty stars (left to right):`,
    filled > 0
      ? `  FILLED (×${filled}): brand red ${BRAND_RED} star with black border — match IMAGE 4.`
      : '',
    empty > 0
      ? `  EMPTY (×${empty}): white star with black border — match IMAGE 3.`
      : '',
    'Render as 5 separate small star icons in the MATCH RATING box, not text glyphs.',
  ]
    .filter(Boolean)
    .join('\n');
}

function scoreLine(top: FalAnalysisLook): string {
  return `OVERALL SCORE VALUE ONLY (${BRAND_RED}, Covered By Your Grace font): ${formatScore(top.score)} — number only, no extra label text.`;
}

function scoreAndRatingLines(top: FalAnalysisLook): string[] {
  return [scoreLine(top), describeMatchRatingStars(top.rating)];
}

const PROMPT_FOOTER = [
  '',
  '=== FINAL CHECK ===',
  'PILL: first name replaces "CLIENT PREVIEW" inside the tab — not below it.',
  'CLIENT PANEL: selfie fills entire panel edge-to-edge — no inset crop or floating photo.',
  'TIER SUBTITLE: erased — no "3 MONTH", "6 MONTH", "12 MONTH", or "FREE" analysis label visible.',
  'HAIRLINE: no baby hairs or wispy flyaways anywhere.',
  `SCORE: only "${formatScore(98)}" style number in red Covered By Your Grace — never print "COVERED BY YOUR GRACE" as text.`,
  'THUMBNAILS: same client face from IMAGE 2 + mannequin texture per unit — never different people or back-of-head stock.',
  `STARS: red ${BRAND_RED} filled + white/black-border empty (website style from images 3 & 4).`,
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
    ...scoreAndRatingLines(top),
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
  ];
  analysis.whyItWorks.forEach((line, i) => {
    lines.push(`WHY IT WORKS LINE ${i + 1}: ${line}`);
  });
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
    ...scoreAndRatingLines(top),
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
  ];
  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    const label = `MATCH ${String(i + 2).padStart(2, '0')}`;
    lines.push('');
    lines.push(altRowBlock(label, look));
    lines.push(matchThumbnailBlock(`${label}`, look, refs));
  });
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
    ...scoreAndRatingLines(top),
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
    '',
    'STYLE PORTFOLIO — FILL EACH ALTERNATIVE ROW (THUMBNAIL + TEXTURE + COLOR + LENGTH + MATCH SCORE):',
  ];
  portfolio.slice(0, 7).forEach((look, i) => {
    const label = `ALTERNATIVE ${String(i + 1).padStart(2, '0')}`;
    lines.push(`${label}: ${portfolioLine(i + 1, look)}`);
    lines.push(`  TEXTURE: ${look.unit}`);
    lines.push(`  COLOR: ${look.color}`);
    lines.push(`  LENGTH: ${displayLength(look.length)}`);
    lines.push(`  MATCH SCORE: ${formatScore(look.score)}`);
    lines.push(matchThumbnailBlock(`  ${label}`, look, refs));
  });
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
    ...scoreAndRatingLines(top),
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
    '',
    'STYLE PORTFOLIO GRID — FILL ALL 9 ALTERNATIVES (THUMBNAIL + COLOR + LENGTH + MATCH SCORE):',
  ];
  analysis.additionalLooks.slice(0, 9).forEach((alt, i) => {
    const label = `ALTERNATIVE ${String(i + 1).padStart(2, '0')}`;
    lines.push(`${label}:`);
    lines.push(`  COLOR: ${alt.color}`);
    lines.push(`  LENGTH: ${displayLength(alt.length)}`);
    lines.push(`  MATCH SCORE: ${formatScore(alt.score)}`);
    lines.push(matchThumbnailBlock(`  ${label}`, alt, refs));
  });
  analysis.whyItWorks.forEach((line, i) => {
    lines.push(`WHY IT WORKS LINE ${i + 1}: ${line}`);
  });
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
