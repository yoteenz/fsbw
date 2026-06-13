/**
 * ChatGPT template-population prompts (reference) + client preview generation prompt.
 * Production card fill: Fal GPT Image 2 via POST /api/hairstyle-analysis-generate
 * (see api/_lib/hairstyleAnalysisFalPrompt.ts). React overlays are dev-only.
 */
import type { AnalysisLook, AnalysisTier, HairstyleAnalysis } from '../types/hairstyleAnalysis';
import { buildTemplateOverlayValues } from './hairstyleAnalysisOverlayContent';
import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
} from './hairstyleAnalysisFormat';

export const HAIRSTYLE_ANALYSIS_TEMPLATE_PROMPTS: Record<
  Exclude<AnalysisTier, 'black'>,
  string
> = {
  free: `USE THE UPLOADED FREE ANALYSIS TEMPLATE AS THE BACKGROUND.
DO NOT MODIFY THE TEMPLATE. ONLY FILL THE EXISTING PLACEHOLDERS.
ERASE ANY TIER SUBTITLE (FREE/3/6/12 MONTH HAIRSTYLE ANALYSIS) — CLIENT MUST NOT SEE ANALYSIS TYPE.
DO NOT REDRAW ROSE ICONS. OVERALL SCORE = #EB1C24 FUTURA PT DEMI (~50PX MAX, COMPACT IN PANEL). STARS = WEBSITE STYLE (RED FILLED INSIDE OUTLINES ONLY, NOT OVERSIZED).
CLIENT PILL = RED "TOP MATCH" (NOT CLIENT NAME). BLACK HEADER ABOVE SCORE PANELS = CLIENT FIRST + LAST NAME.
TOP MATCH + SPECS + EVERY DETAIL MATTERS LINES (VERBATIM, FEATURE + SPEC PER ROW). MATCH SCORE % = GRAY #808080.`,

  three_month: `USE THE UPLOADED PREMIUM HAIRSTYLE ANALYSIS TEMPLATE. ONLY FILL PLACEHOLDERS.
ERASE ANY TIER SUBTITLE (3/6/12 MONTH HAIRSTYLE ANALYSIS) — CLIENT MUST NOT SEE ANALYSIS TYPE.
SCORE #EB1C24 FUTURA PT DEMI COMPACT IN PANEL; STARS = RED FILL INSIDE TEMPLATE OUTLINES ONLY (NOT OVERSIZED). PRESERVE ALL ROSE ICONS PIXEL-PERFECT.
TOP MATCH + 3 ADDITIONAL MATCHES (UNIT, COLOR, LENGTH, SCORE%). MATCH SCORE % VALUES = GRAY #808080 ONLY.
CLIENT PHOTO FULL-BLEED IN PANEL WITH TOP MATCH HAIR — NO BABY HAIRS, SAME PERSON ONLY.`,

  six_month: `USE THE UPLOADED PREMIUM HAIRSTYLE ANALYSIS TEMPLATE. ONLY FILL PLACEHOLDERS.
ERASE ANY TIER SUBTITLE — CLIENT MUST NOT SEE ANALYSIS TYPE.
SCORE #EB1C24 FUTURA PT DEMI COMPACT IN PANEL; STARS = RED FILL INSIDE TEMPLATE OUTLINES ONLY (NOT OVERSIZED). PRESERVE ALL ROSE ICONS PIXEL-PERFECT.
TOP MATCH + 3 ADDITIONAL MATCHES (UNIT, COLOR, LENGTH, SCORE%). MATCH SCORE % VALUES = GRAY #808080 ONLY.
CLIENT PHOTO FULL-BLEED IN PANEL WITH TOP MATCH HAIR — NO BABY HAIRS, SAME PERSON ONLY.`,

  twelve_month: `USE THE UPLOADED PREMIUM HAIRSTYLE ANALYSIS TEMPLATE. TEMPLATE POPULATION ONLY — NO REDESIGN.
ERASE ANY TIER SUBTITLE — CLIENT MUST NOT SEE ANALYSIS TYPE.
SCORE #EB1C24 FUTURA PT DEMI COMPACT IN PANEL; STARS = RED FILL INSIDE TEMPLATE OUTLINES ONLY. PRESERVE ROSE ICONS.
TOP MATCH + 3 ADDITIONAL MATCHES + SPECS PANEL. MATCH SCORE % = GRAY #808080.
CLIENT PHOTO FULL-BLEED = TOP MATCH HAIR — NO BABY HAIRS, ONE CLIENT IDENTITY ONLY.`,
};

/** Upstream AI: composite client selfie with top-match hair only (not the analysis card layout). */
export function buildClientHairstylePreviewPrompt(look: AnalysisLook, clientName?: string): string {
  const name = clientName?.trim() || 'CLIENT';
  return [
    `Edit the uploaded client selfie for ${name.toUpperCase()}.`,
    'KEEP THE EXACT FACE, SKIN TONE, AGE, CAMERA ANGLE, EXPRESSION, AND FACIAL FEATURES.',
    'ONLY CHANGE THE HAIR. NO WIG CAP, NO LACE, NO FLOATING HAIR, NO BALD SPOTS.',
    'NO BABY HAIRS, NO WISPY FLYAWAYS, NO EDGE FUZZ AT THE HAIRLINE — CLEAN LACE-FRONT EDGE ONLY.',
    'HAIR MUST LOOK NATURALLY INSTALLED.',
    '',
    `TEXTURE: ${look.unit}`,
    `COLOR: ${look.color}`,
    `LENGTH: ${displayLength(look)}`,
    `LACE: ${displayLace(look)}`,
    `DENSITY: ${displayDensity(look)}`,
    `PART: ${displayPart(look)}`,
    `HAIRLINE: ${displayHairline(look)}`,
    `STYLE: ${displayStyle(look)}`,
    '',
    'OUTPUT: ONE PHOTO-REALISTIC PORTRAIT WITH THE NEW HAIR ONLY.',
  ].join('\n');
}

/** Serialize analysis into placeholder keys for debugging / API handoff. */
export function buildTemplatePopulationPayload(analysis: HairstyleAnalysis): {
  tier: AnalysisTier;
  templateUrl: string;
  clientPreviewUrl: string;
  fields: Record<string, string>;
} {
  return {
    tier: analysis.tier,
    templateUrl: analysis.templateUrl,
    clientPreviewUrl: analysis.clientPreviewUrl,
    fields: buildTemplateOverlayValues(analysis),
  };
}
