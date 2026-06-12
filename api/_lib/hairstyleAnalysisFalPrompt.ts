/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * Keep field copy aligned with src/utils/hairstyleAnalysisOverlayContent.ts.
 */

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

function formatStars(rating: number): string {
  const n = Math.min(5, Math.max(0, Math.round(rating)));
  return '★'.repeat(n) + (n < 5 ? '☆'.repeat(5 - n) : '');
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

const BRAND_RED = '#EB1C24';
const BRAND_GRAY = '#808080';

const TEMPLATE_RULES = [
  '=== TEMPLATE (IMAGE 1) — DO NOT ALTER LAYOUT ===',
  'USE THE FIRST UPLOADED IMAGE AS THE EXACT STATIC TEMPLATE BACKGROUND.',
  'DO NOT REDESIGN THE CARD, MOVE PANELS, CROP, OR ALTER THE MARBLE BACKGROUND.',
  'ALL SECTION TITLES, BORDERS, FOOTER ICONS, AND LABELS (TEXTURE:, COLOR:, etc.) ARE ALREADY ON THE TEMPLATE — LEAVE THEM UNTOUCHED.',
  'ONLY FILL EMPTY VALUE AREAS NEXT TO EXISTING LABELS. DO NOT DUPLICATE LABELS OR ICONS.',
  '',
  '=== ROSE ICONS — PIXEL-PERFECT PRESERVATION (CRITICAL) ===',
  'EVERY RED ROSE ICON ON THE TEMPLATE IS PRE-RENDERED ART — DO NOT REDRAW, REGENERATE, STRETCH, BLUR, OR REPLACE ANY ROSE.',
  'DO NOT ADD NEW ROSE ICONS. DO NOT CHANGE ROSE SHAPE, SIZE, POSITION, OR COLOR.',
  'THE PRECISE MATCHING ROSE AND ALL PORTFOLIO/MATCH ROSES MUST LOOK IDENTICAL TO IMAGE 1 — ONLY ADD TEXT VALUES BESIDE THEM.',
  '',
  '=== BRAND TYPOGRAPHY & COLORS ===',
  `OVERALL SCORE VALUE ONLY: brand red ${BRAND_RED}, font "COVERED BY YOUR GRACE", uppercase, large accent number (e.g. 98%).`,
  `MATCH RATING STARS ONLY: brand gray ${BRAND_GRAY} — NOT RED. Use filled/outline star glyphs in gray only.`,
  'ALL OTHER POPULATED VALUES (specs, portfolio text, why lines, client name): black uppercase Futura PT Medium style.',
  'CLIENT NAME above preview: brand red ' + BRAND_RED + ', uppercase.',
  '',
  '=== CLIENT PREVIEW (IMAGE 2) — ONE PERSON ONLY ===',
  'USE THE SECOND UPLOADED IMAGE ONLY INSIDE THE LARGE CLIENT PREVIEW FRAME.',
  'KEEP THE EXACT FACE, SKIN TONE, AGE, EXPRESSION, BODY, AND CAMERA ANGLE FROM IMAGE 2.',
  'ONLY CHANGE THE HAIR ON THIS PERSON TO MATCH THE TOP MATCH SPEC. NO WIG CAP, NO LACE VISIBLE.',
  '',
  '=== ALTERNATIVE / MATCH THUMBNAILS — HAIR ONLY, NEVER A NEW PERSON ===',
  'FOR MATCH 02–04, STYLE PORTFOLIO ALTERNATIVES, AND GRID THUMBNAIL SQUARES: DO NOT GENERATE A DIFFERENT PERSON.',
  'NEVER PUT A NEW FACE IN THUMBNAIL BOXES. NEVER CHANGE IDENTITY FOR EXTRA MATCHES.',
  'THUMBNAIL OPTIONS (pick one per slot): (A) hair-only close-up / wig swatch with NO face, (B) mannequin back-of-head hair silhouette, (C) abstract texture+color hair bundle.',
  'IF A PERSON APPEARS IN A THUMBNAIL IT MUST BE THE SAME CLIENT FROM IMAGE 2 WITH ONLY HAIR COLOR/TEXTURE/LENGTH CHANGED — SAME FACE.',
  'PORTFOLIO ROWS = HAIRSTYLE REFERENCE ONLY — NOT PORTRAITS OF OTHER WOMEN.',
  '',
  'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — EVERY VALUE FILLED, NO BLANK PLACEHOLDERS.',
].join('\n');

function scoreAndRatingLines(top: FalAnalysisLook): string[] {
  return [
    `OVERALL SCORE (COVERED BY YOUR GRACE, ${BRAND_RED}): ${formatScore(top.score)}`,
    `MATCH RATING (STARS IN ${BRAND_GRAY} ONLY — NOT RED): ${formatStars(top.rating)}`,
  ];
}

const PROMPT_FOOTER = [
  '',
  '=== FINAL CHECK ===',
  'ROSES: UNCHANGED FROM TEMPLATE. STARS: GRAY #808080. SCORE: RED #EB1C24 IN COVERED BY YOUR GRACE.',
  'ONE CLIENT FACE ONLY (CLIENT PREVIEW). NO OTHER PEOPLE ANYWHERE ON THE CARD.',
].join('\n');

function freePrompt(analysis: FalHairstyleAnalysis): string {
  const top = analysis.topMatch;
  const lines = [
    TEMPLATE_RULES,
    '',
    `TIER: FREE HAIRSTYLE ANALYSIS`,
    `CLIENT NAME (ABOVE CLIENT PREVIEW, ${BRAND_RED}): ${analysis.clientName.toUpperCase()}`,
    ...scoreAndRatingLines(top),
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
  ];
  analysis.whyItWorks.forEach((line, i) => {
    lines.push(`WHY IT WORKS LINE ${i + 1}: ${line}`);
  });
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

function threeMonthPrompt(analysis: FalHairstyleAnalysis): string {
  const top = analysis.topMatch;
  const lines = [
    TEMPLATE_RULES,
    '',
    `TIER: 3 MONTH HAIRSTYLE ANALYSIS`,
    `CLIENT NAME (${BRAND_RED}): ${analysis.clientName.toUpperCase()}`,
    ...scoreAndRatingLines(top),
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
  ];
  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    lines.push('');
    lines.push(altRowBlock(`MATCH ${String(i + 2).padStart(2, '0')}`, look));
    lines.push(
      `MATCH ${String(i + 2).padStart(2, '0')} THUMBNAIL: HAIR-ONLY SWATCH OR BACK-OF-HEAD WIG SILHOUETTE — NO FACE, OR SAME CLIENT FROM IMAGE 2 WITH ONLY THIS HAIR SPEC. NEVER A DIFFERENT WOMAN.`
    );
  });
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

function sixMonthPrompt(analysis: FalHairstyleAnalysis): string {
  const top = analysis.topMatch;
  const portfolio = [top, ...analysis.additionalLooks];
  const lines = [
    TEMPLATE_RULES,
    '',
    `TIER: 6 MONTH HAIRSTYLE ANALYSIS — STYLE PORTFOLIO`,
    `CLIENT NAME (${BRAND_RED}): ${analysis.clientName.toUpperCase()}`,
    ...scoreAndRatingLines(top),
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
    '',
    'STYLE PORTFOLIO — FILL EACH ALTERNATIVE ROW (THUMBNAIL + TEXTURE + COLOR + LENGTH + MATCH SCORE). THUMBNAILS = HAIR ONLY:',
  ];
  portfolio.slice(0, 7).forEach((look, i) => {
    lines.push(`ALTERNATIVE ${String(i + 1).padStart(2, '0')}: ${portfolioLine(i + 1, look)}`);
    lines.push(`  TEXTURE: ${look.unit}`);
    lines.push(`  COLOR: ${look.color}`);
    lines.push(`  LENGTH: ${displayLength(look.length)}`);
    lines.push(`  MATCH SCORE: ${formatScore(look.score)}`);
    lines.push(
      `  THUMBNAIL: HAIR TEXTURE/COLOR SWATCH OR WIG BACK VIEW — NO NEW FACE. NOT A DIFFERENT PERSON.`
    );
  });
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

function twelveMonthPrompt(analysis: FalHairstyleAnalysis): string {
  const top = analysis.topMatch;
  const lines = [
    TEMPLATE_RULES,
    '',
    `TIER: 12 MONTH HAIRSTYLE ANALYSIS`,
    `CLIENT NAME (${BRAND_RED}): ${analysis.clientName.toUpperCase()}`,
    ...scoreAndRatingLines(top),
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
    '',
    'STYLE PORTFOLIO GRID — FILL ALL 9 ALTERNATIVES (THUMBNAIL + COLOR + LENGTH + MATCH SCORE). THUMBNAILS = HAIR ONLY:',
  ];
  analysis.additionalLooks.slice(0, 9).forEach((alt, i) => {
    lines.push(`ALTERNATIVE ${String(i + 1).padStart(2, '0')}:`);
    lines.push(`  COLOR: ${alt.color}`);
    lines.push(`  LENGTH: ${displayLength(alt.length)}`);
    lines.push(`  MATCH SCORE: ${formatScore(alt.score)}`);
    lines.push(
      `  THUMBNAIL: HAIR SWATCH OR WIG SILHOUETTE ONLY — NO FACE, NO DIFFERENT PERSON.`
    );
  });
  analysis.whyItWorks.forEach((line, i) => {
    lines.push(`WHY IT WORKS LINE ${i + 1}: ${line}`);
  });
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

export function buildHairstyleAnalysisFalPrompt(analysis: FalHairstyleAnalysis): string {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return freePrompt(analysis);
  if (tier === 'three_month') return threeMonthPrompt(analysis);
  if (tier === 'six_month') return sixMonthPrompt(analysis);
  return twelveMonthPrompt(analysis);
}
