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

const TEMPLATE_RULES = [
  'USE THE FIRST UPLOADED IMAGE AS THE EXACT STATIC TEMPLATE BACKGROUND.',
  'DO NOT REDESIGN THE CARD, MOVE PANELS, CHANGE FONTS, OR ALTER THE MARBLE BACKGROUND.',
  'ONLY POPULATE THE EXISTING EMPTY PLACEHOLDERS — ALL SECTION LABELS AND ROSE ICONS ARE ALREADY ON THE TEMPLATE.',
  'USE THE SECOND UPLOADED IMAGE ONLY INSIDE THE CLIENT PREVIEW FRAME.',
  'KEEP THE CLIENT FACE, SKIN TONE, AGE, EXPRESSION, AND CAMERA ANGLE FROM THE SECOND IMAGE.',
  'ONLY CHANGE THE CLIENT HAIR TO MATCH THE TOP MATCH SPEC.',
  'MATCH THE TEMPLATE TYPOGRAPHY: UPPERCASE FUTURA-STYLE SANS, RED ACCENTS WHERE SHOWN ON TEMPLATE.',
  'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — EVERY FIELD FILLED, NO BLANK PLACEHOLDERS.',
].join('\n');

function freePrompt(analysis: FalHairstyleAnalysis): string {
  const top = analysis.topMatch;
  const lines = [
    TEMPLATE_RULES,
    '',
    `TIER: FREE HAIRSTYLE ANALYSIS`,
    `CLIENT NAME (ABOVE CLIENT PREVIEW): ${analysis.clientName.toUpperCase()}`,
    `OVERALL SCORE: ${formatScore(top.score)}`,
    `MATCH RATING: ${formatStars(top.rating)}`,
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
  ];
  analysis.whyItWorks.forEach((line, i) => {
    lines.push(`WHY IT WORKS LINE ${i + 1}: ${line}`);
  });
  return lines.join('\n');
}

function threeMonthPrompt(analysis: FalHairstyleAnalysis): string {
  const top = analysis.topMatch;
  const lines = [
    TEMPLATE_RULES,
    '',
    `TIER: 3 MONTH HAIRSTYLE ANALYSIS`,
    `CLIENT NAME: ${analysis.clientName.toUpperCase()}`,
    `OVERALL SCORE: ${formatScore(top.score)}`,
    `MATCH RATING: ${formatStars(top.rating)}`,
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
  ];
  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    lines.push('');
    lines.push(altRowBlock(`MATCH ${String(i + 2).padStart(2, '0')}`, look));
    lines.push('(PLACE A SMALL HAIRSTYLE THUMBNAIL IN THE MATCH SQUARE — SAME SILHOUETTE AS SPECS)');
  });
  return lines.join('\n');
}

function sixMonthPrompt(analysis: FalHairstyleAnalysis): string {
  const top = analysis.topMatch;
  const portfolio = [top, ...analysis.additionalLooks];
  const lines = [
    TEMPLATE_RULES,
    '',
    `TIER: 6 MONTH HAIRSTYLE ANALYSIS — STYLE PORTFOLIO`,
    `CLIENT NAME: ${analysis.clientName.toUpperCase()}`,
    `OVERALL SCORE: ${formatScore(top.score)}`,
    `MATCH RATING: ${formatStars(top.rating)}`,
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
    '',
    'STYLE PORTFOLIO — FILL EACH ALTERNATIVE ROW (THUMBNAIL + TEXTURE + COLOR + LENGTH + MATCH SCORE):',
  ];
  portfolio.slice(0, 7).forEach((look, i) => {
    lines.push(`ALTERNATIVE ${String(i + 1).padStart(2, '0')}: ${portfolioLine(i + 1, look)}`);
    lines.push(`  TEXTURE: ${look.unit}`);
    lines.push(`  COLOR: ${look.color}`);
    lines.push(`  LENGTH: ${displayLength(look.length)}`);
    lines.push(`  MATCH SCORE: ${formatScore(look.score)}`);
  });
  return lines.join('\n');
}

function twelveMonthPrompt(analysis: FalHairstyleAnalysis): string {
  const top = analysis.topMatch;
  const lines = [
    TEMPLATE_RULES,
    '',
    `TIER: 12 MONTH HAIRSTYLE ANALYSIS`,
    `CLIENT NAME: ${analysis.clientName.toUpperCase()}`,
    `OVERALL SCORE: ${formatScore(top.score)}`,
    `MATCH RATING: ${formatStars(top.rating)}`,
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
    '',
    'STYLE PORTFOLIO GRID — FILL ALL 9 ALTERNATIVES (THUMBNAIL + COLOR + LENGTH + MATCH SCORE):',
  ];
  analysis.additionalLooks.slice(0, 9).forEach((alt, i) => {
    lines.push(`ALTERNATIVE ${String(i + 1).padStart(2, '0')}:`);
    lines.push(`  COLOR: ${alt.color}`);
    lines.push(`  LENGTH: ${displayLength(alt.length)}`);
    lines.push(`  MATCH SCORE: ${formatScore(alt.score)}`);
  });
  analysis.whyItWorks.forEach((line, i) => {
    lines.push(`WHY IT WORKS LINE ${i + 1}: ${line}`);
  });
  return lines.join('\n');
}

export function buildHairstyleAnalysisFalPrompt(analysis: FalHairstyleAnalysis): string {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return freePrompt(analysis);
  if (tier === 'three_month') return threeMonthPrompt(analysis);
  if (tier === 'six_month') return sixMonthPrompt(analysis);
  return twelveMonthPrompt(analysis);
}
