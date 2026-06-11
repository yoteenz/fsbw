/**
 * ChatGPT template-population prompts (reference) + client preview generation prompt.
 * The React app uses static templates + buildTemplateOverlayValues() — not these prompts for layout.
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
CLIENT NAME + CLIENT PHOTO IN FRAME. KEEP FACE / SKIN / AGE / ANGLE. ONLY CHANGE HAIR.
TOP MATCH + SPECS + WHY LINES PER TEMPLATE.`,

  three_month: `USE THE UPLOADED 3 MONTH ANALYSIS TEMPLATE. ONLY FILL PLACEHOLDERS.
TOP MATCH + 3 ALTERNATIVES (UNIT, COLOR, LENGTH, SCORE%). CLIENT PHOTO WITH TOP MATCH HAIR.`,

  six_month: `USE THE UPLOADED 6 MONTH ANALYSIS TEMPLATE. ONLY POPULATE FIELDS.
STYLE PORTFOLIO 01–07 (TOP + 6 ALTS). CLIENT PHOTO WITH TOP MATCH HAIR.`,

  twelve_month: `USE THE UPLOADED 12 MONTH TEMPLATE. TEMPLATE POPULATION ONLY — NO REDESIGN.
FULL TOP MATCH + 9 ALTERNATIVES + SPECS PANEL + 10 WHY LINES. CLIENT PHOTO = TOP MATCH HAIR.`,
};

/** Upstream AI: composite client selfie with top-match hair only (not the analysis card layout). */
export function buildClientHairstylePreviewPrompt(look: AnalysisLook, clientName?: string): string {
  const name = clientName?.trim() || 'CLIENT';
  return [
    `Edit the uploaded client selfie for ${name.toUpperCase()}.`,
    'KEEP THE EXACT FACE, SKIN TONE, AGE, CAMERA ANGLE, EXPRESSION, AND FACIAL FEATURES.',
    'ONLY CHANGE THE HAIR. NO WIG CAP, NO LACE, NO FLOATING HAIR, NO BALD SPOTS.',
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
