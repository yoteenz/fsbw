/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * TOP MATCH spec values, overall score, match rating stars, and match-score % are composited server-side after Fal.
 */

import { clientFirstName, type MannequinRefIndex } from './hairstyleAnalysisMannequinRefs.js';
import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
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
};

const BRAND_RED = '#EB1C24';

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

function clientPreviewHairLine(look: FalAnalysisLook, refs: { mannequinRefs: MannequinRefIndex[] }): string {
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

function matchThumbnailBlock(label: string, look: FalAnalysisLook, refs: { mannequinRefs: MannequinRefIndex[] }): string {
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

function blankTopMatchAndRatingRules(): string {
  return [
    '=== TOP MATCH SPECS + SCORE + RATING — LEAVE BLANK (SERVER OVERLAY) ===',
    'Do NOT print any text in the TOP MATCH value column (texture, color, length, lace, density, part, hairline, style values).',
    'Do NOT print the overall score percentage in the OVERALL SCORE value area.',
    'Do NOT draw stars or rating glyphs in the MATCH RATING row.',
    'Leave those areas clean marble/white so text and stars can be added after generation.',
    '',
    '=== MATCH SCORE VALUE AREAS — LEAVE BLANK (SERVER OVERLAY) ===',
    'Where the template shows MATCH SCORE labels, leave the value area next to each label completely empty — no numbers.',
  ].join('\n');
}

function buildTemplateRules(refs: { mannequinRefs: MannequinRefIndex[] }): string {
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
    blankTopMatchAndRatingRules(),
    '',
    mannequinList,
    '',
    '=== MATCH THUMBNAILS — SAME CLIENT FACE + MANNEQUIN TEXTURE ===',
    'Every thumbnail square must show the client from IMAGE 2 with different unit/color/length hair applied.',
    'Use the matching 3D mannequin image (listed above) as the hair texture reference for that unit.',
    'NEVER use back-of-head stock photos, different people, or hair-only swatches without the client face.',
    '',
    'ALL OTHER POPULATED VALUES (match rows, portfolio lines, why lines): black uppercase Futura PT Medium style.',
    '',
    'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — EVERY REQUIRED VISUAL FILLED EXCEPT BLANK SERVER-OVERLAY SLOTS.',
  ]
    .filter(Boolean)
    .join('\n');
}

function altRowBlock(label: string, look: FalAnalysisLook): string {
  return [
    label,
    `TEXTURE: ${look.unit}`,
    `COLOR: ${look.color}`,
    `LENGTH: ${displayLength(look.length)}`,
    'MATCH SCORE VALUE: leave blank (server adds red percentage after generation).',
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
  'CLIENT PANEL: selfie fills entire panel edge-to-edge — no inset crop or floating photo.',
  'TIER SUBTITLE: erased — no month/tier analysis label visible.',
  'HAIRLINE: no baby hairs or wispy flyaways anywhere.',
  'TOP MATCH VALUES, OVERALL SCORE %, MATCH RATING STARS, and MATCH SCORE % values: left blank.',
  'THUMBNAILS: same client face from IMAGE 2 + mannequin texture per unit — never different people or back-of-head stock.',
].join('\n');

function freePrompt(analysis: FalHairstyleAnalysis, refs: { mannequinRefs: MannequinRefIndex[] }): string {
  const top = analysis.topMatch;
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs),
    '',
    clientPreviewTabLine(firstName),
    clientPreviewHairLine(top, refs),
  ];
  analysis.whyItWorks.forEach((line, i) => {
    lines.push(`WHY IT WORKS LINE ${i + 1}: ${line}`);
  });
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

function threeMonthPrompt(analysis: FalHairstyleAnalysis, refs: { mannequinRefs: MannequinRefIndex[] }): string {
  const top = analysis.topMatch;
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs),
    '',
    clientPreviewTabLine(firstName),
    clientPreviewHairLine(top, refs),
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

function sixMonthPrompt(analysis: FalHairstyleAnalysis, refs: { mannequinRefs: MannequinRefIndex[] }): string {
  const top = analysis.topMatch;
  const portfolio = [top, ...analysis.additionalLooks];
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs),
    '',
    clientPreviewTabLine(firstName),
    clientPreviewHairLine(top, refs),
    '',
    'STYLE PORTFOLIO — FILL EACH ALTERNATIVE ROW (THUMBNAIL + TEXTURE + COLOR + LENGTH; LEAVE MATCH SCORE % BLANK):',
  ];
  portfolio.slice(0, 7).forEach((look, i) => {
    const label = `ALTERNATIVE ${String(i + 1).padStart(2, '0')}`;
    lines.push(`${label}: ${portfolioLine(i + 1, look)}`);
    lines.push(`  TEXTURE: ${look.unit}`);
    lines.push(`  COLOR: ${look.color}`);
    lines.push(`  LENGTH: ${displayLength(look.length)}`);
    lines.push('  MATCH SCORE VALUE: leave blank (server adds red percentage).');
    lines.push(matchThumbnailBlock(`  ${label}`, look, refs));
  });
  lines.push(PROMPT_FOOTER);
  return lines.join('\n');
}

function twelveMonthPrompt(analysis: FalHairstyleAnalysis, refs: { mannequinRefs: MannequinRefIndex[] }): string {
  const top = analysis.topMatch;
  const firstName = clientFirstName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs),
    '',
    clientPreviewTabLine(firstName),
    clientPreviewHairLine(top, refs),
    '',
    'STYLE PORTFOLIO GRID — FILL ALL 9 ALTERNATIVES (THUMBNAIL + COLOR + LENGTH; LEAVE MATCH SCORE % BLANK):',
  ];
  analysis.additionalLooks.slice(0, 9).forEach((alt, i) => {
    const label = `ALTERNATIVE ${String(i + 1).padStart(2, '0')}`;
    lines.push(`${label}:`);
    lines.push(`  COLOR: ${alt.color}`);
    lines.push(`  LENGTH: ${displayLength(alt.length)}`);
    lines.push('  MATCH SCORE VALUE: leave blank (server adds red percentage).');
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
  refs: { mannequinRefs: MannequinRefIndex[] }
): string {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return freePrompt(analysis, refs);
  if (tier === 'three_month') return threeMonthPrompt(analysis, refs);
  if (tier === 'six_month') return sixMonthPrompt(analysis, refs);
  return twelveMonthPrompt(analysis, refs);
}

// Legacy exports for star paths (composite only — not sent to Fal).
export const HAIRSTYLE_ANALYSIS_STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
export const HAIRSTYLE_ANALYSIS_STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';
