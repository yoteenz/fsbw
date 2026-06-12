/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * Only overall score % and match-rating stars are composited server-side after Fal.
 */

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

/** Hair-edit guidance only — never print hex or parentheses in template value fields. */
function colorHairGuidanceLine(look: FalAnalysisLook): string {
  return `Match hair pigment to catalog color ${look.color}. Do not print hex codes, # symbols, or parenthetical notes on the template.`;
}

function styledHairLine(look: FalAnalysisLook): string {
  const style = displayStyle(look.styling);
  if (style === 'NONE') return 'Finish hair in a polished salon-ready look.';
  return `Apply salon styling: ${style}.`;
}

function clientPreviewHairLine(look: FalAnalysisLook, refs: { mannequinRefs: MannequinRefIndex[] }): string {
  return [
    '=== CLIENT PREVIEW PHOTO (IMAGE 2) — FULL BLEED, STYLED TOP MATCH ===',
    'Scale IMAGE 2 to COMPLETELY FILL the large client preview panel edge-to-edge (top, bottom, left, right).',
    'NO inner padding, NO inset crop, NO letterboxing, NO margins — photo must touch all four inner edges of the panel border.',
    'Use cover-style scaling: center the client face; crop overflow at edges if needed, but the panel must look full, not a smaller photo floating inside.',
    'KEEP the exact face, skin tone, age, expression, body, and camera angle from IMAGE 2.',
    `Change ONLY the hair to match TOP MATCH: ${look.unit}, ${look.color}, ${displayLength(look.length)}.`,
    colorHairGuidanceLine(look),
    styledHairLine(look),
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

function matchThumbnailBlock(
  label: string,
  look: FalAnalysisLook,
  refs: { mannequinRefs: MannequinRefIndex[] }
): string {
  return [
    `${label} THUMBNAIL (small square on template):`,
    '- REQUIRED: front-facing portrait of the SAME CLIENT from IMAGE 2 — identical face, skin tone, and expression.',
    `- TEXTURE: ${look.unit}`,
    colorHairGuidanceLine(look),
    `- LENGTH: ${displayLength(look.length)}`,
    styledHairLine(look),
    mannequinRefLine(look.unit, refs),
    '- Composite client selfie + mannequin hair texture for maximum accuracy.',
    '- FORBIDDEN: back-of-head shots, stock photos, wig-only swatches, silhouettes, or any different person.',
    '- NO baby hairs or wispy hairline flyaways on thumbnails.',
  ]
    .filter(Boolean)
    .join('\n');
}

function whyItWorksRulesBlock(): string {
  return [
    '=== WHY IT WORKS LINES (PRINT VERBATIM — NO REWRITES) ===',
    'Each WHY IT WORKS LINE is a final curated stylist note for this client — print it exactly as given.',
    'Each line must tie a catalog spec (unit texture, color, length, styling, part) to this client\'s features — face shape, eyes, jawline, undertone, proportions.',
    'Example tone: "NOIR\'S STRAIGHT TEXTURE ACCENTUATES YOUR HEART-SHAPED FEATURES" or "JET BLACK ENHANCES YOUR ALMOND-SHAPED EYES".',
    'These are intentional pairing notes — show you selected specs for them specifically, not generic praise.',
    'FORBIDDEN: empowerment fluff, girl-power jargon, confidence slogans, trendy slang, or vague compliments with no spec tie-in.',
    'Do not invent extra why lines or merge lines together.',
  ].join('\n');
}

function panelChromePreservationBlock(): string {
  return [
    '=== PANEL CHROME — PIXEL-PERFECT PRESERVATION (CRITICAL) ===',
    'IMAGE 1 includes pre-rendered frosted acrylic / glass panels, red outer glow on panel edges, borders, drop shadows, and marble backdrop.',
    'DO NOT flatten, blur, repaint, remove, or weaken the acrylic panel effect or the red glow around panels.',
    'DO NOT replace glossy translucent panels with flat white boxes, plain gray rectangles, or simplified UI.',
    'Photo windows are cutouts INSIDE the acrylic panels — place client selfie and thumbnails in the cutout only, behind the glass layer.',
    'ONLY edit inside: (a) photo cutout areas, (b) empty value text slots next to labels, (c) erasing the tier subtitle per rules below.',
    'All panel frames, glows, translucency, section chrome, and marble texture must remain identical to IMAGE 1.',
  ].join('\n');
}

function blankScoreAndRatingRules(): string {
  return [
    '=== OVERALL SCORE + MATCH RATING — LEAVE BLANK (SERVER OVERLAY ONLY) ===',
    'Do NOT print the overall score percentage in the OVERALL SCORE value area.',
    'Do NOT draw stars or rating glyphs in the MATCH RATING row.',
    'Leave only those two areas blank — all other value fields must be filled by you.',
  ].join('\n');
}

function matchScoreFalLine(look: FalAnalysisLook): string {
  const pct = formatScorePercent(look.score);
  return (
    `MATCH SCORE value slot: the "MATCH SCORE:" label is already on the template in black. ` +
    `Print ONLY "${pct}" in the value area in medium gray ${MATCH_SCORE_GRAY}. ` +
    `Do not repeat "MATCH SCORE", do not print the percentage in black or red.`
  );
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
    '=== ADDITIONAL MATCHES — VARIED STYLING ===',
    'Each additional match uses its own STYLE value — salon finish must differ across matches for variety.',
    'Apply the assigned styling on every additional-match thumbnail (not raw mannequin texture).',
    '',
    '=== MATCH THUMBNAILS — SAME CLIENT FACE + MANNEQUIN TEXTURE ===',
    'Every thumbnail square must show the client from IMAGE 2 with different unit/color/length/styling applied.',
    'Use the matching 3D mannequin image (listed above) as the hair texture reference for that unit.',
    'NEVER use back-of-head stock photos, different people, or hair-only swatches without the client face.',
    '',
    'TOP MATCH spec values, match rows, portfolio lines, and why lines: black uppercase Futura PT Medium style.',
    'MATCH SCORE percentages only: medium gray ' + MATCH_SCORE_GRAY + ' in the value slot.',
    '',
    'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — fill every value field except overall score % and match rating stars.',
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
  'CLIENT PANEL: selfie fills entire panel edge-to-edge — no inset crop or floating photo.',
  'TIER SUBTITLE: erased — no month/tier analysis label visible.',
  'HAIRLINE: no baby hairs or wispy flyaways anywhere.',
  'TOP MATCH spec column: all values filled in black.',
  'OVERALL SCORE % and MATCH RATING stars: left blank for server overlay.',
  'MATCH SCORE value slots: gray percentage only in the correct template position.',
  'THUMBNAILS: same client face from IMAGE 2 — each match uses its own styling.',
  'PANEL CHROME: acrylic frost + red glow preserved exactly from IMAGE 1.',
  'COLOR values: color name only — no hex codes or parentheses on the template.',
].join('\n');

function freePrompt(analysis: FalHairstyleAnalysis, refs: { mannequinRefs: MannequinRefIndex[] }): string {
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
    lines.push(whyItWorksRulesBlock());
    analysis.whyItWorks.forEach((line, i) => {
      lines.push(`WHY IT WORKS LINE ${i + 1}: ${line}`);
    });
  }
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
    '',
    ...topMatchBlock(top).map((line) => `TOP MATCH — ${line}`),
  ];
  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    const label = `MATCH ${String(i + 2).padStart(2, '0')}`;
    lines.push('');
    lines.push(altRowBlock(label, look));
    lines.push(matchThumbnailBlock(label, look, refs));
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
  if (analysis.whyItWorks.length > 0) {
    lines.push('');
    lines.push(whyItWorksRulesBlock());
    analysis.whyItWorks.forEach((line, i) => {
      lines.push(`WHY IT WORKS LINE ${i + 1}: ${line}`);
    });
  }
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

export const HAIRSTYLE_ANALYSIS_STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
export const HAIRSTYLE_ANALYSIS_STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';
