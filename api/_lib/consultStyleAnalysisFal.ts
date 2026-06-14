import { buildConsultHairstyleAnalysis } from './buildConsultHairstyleAnalysis.js';
import type { ConsultHairColorName } from './consultStyleAnalysisCatalog.js';
import {
  detectInspoHairSpecs,
  inspoDataUrlFromFetch,
  normalizeManualConsultInspoSpecs,
  type ConsultInspoSpecs,
  type ManualConsultInspoSpecs,
} from './consultStyleAnalysisInspoSpecs.js';
import { generateHairstyleAnalysisWithFal } from './hairstyleAnalysisFal.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { hairstyleAnalysisTemplateUrlForTier } from './hairstyleAnalysisTemplates.js';

export type ConsultStyleAnalysisGenerateResult = {
  kind: 'consult_template';
  comparisonTier: 1 | 4;
  inspoSpecs: ConsultInspoSpecs;
  inspoHairColor: ConsultHairColorName;
  imageUrl: string;
  prompt: string;
  analysis: FalHairstyleAnalysis;
};

export type GenerateConsultStyleAnalysisInput = {
  selfieUrl: string;
  inspoUrl: string;
  comparisonCount: 1 | 4;
  siteOrigin: string;
  clientName?: string;
  manualSpecs?: ManualConsultInspoSpecs;
};

async function inspoDataUrlFromInput(
  inspoUrl: string,
  siteOrigin: string
): Promise<string> {
  const trimmed = inspoUrl.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return inspoDataUrlFromFetch(trimmed);
  }
  const origin = siteOrigin.replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return inspoDataUrlFromFetch(`${origin}${path}`);
}

/**
 * Wig consult style analysis — populates the same 1 pick / 4 pick hairstyle analysis templates.
 * Inspo vision → suggested BAW catalog specs; Fal fills free (1 pick) or premium (4 pick) card.
 */
export async function generateConsultStyleAnalysis(
  input: GenerateConsultStyleAnalysisInput
): Promise<ConsultStyleAnalysisGenerateResult> {
  const inspoDataUrl = await inspoDataUrlFromInput(input.inspoUrl, input.siteOrigin);
  const specs = input.manualSpecs
    ? normalizeManualConsultInspoSpecs(input.manualSpecs, 'OFF BLACK')
    : await detectInspoHairSpecs(inspoDataUrl);
  const analysis = buildConsultHairstyleAnalysis({
    clientName: input.clientName?.trim() || 'CLIENT',
    comparisonCount: input.comparisonCount,
    specs,
  });

  const templateUrl = hairstyleAnalysisTemplateUrlForTier(analysis.tier);
  const result = await generateHairstyleAnalysisWithFal({
    analysis,
    templateUrl,
    clientPreviewUrl: input.selfieUrl,
    inspoPreviewUrl: input.inspoUrl,
    consultInspoMode: true,
    falInImageTextOnly: true,
    siteOrigin: input.siteOrigin,
    skipLookDiversification: true,
  });

  return {
    kind: 'consult_template',
    comparisonTier: input.comparisonCount,
    inspoSpecs: specs,
    inspoHairColor: specs.color,
    imageUrl: result.imageUrl,
    prompt: result.prompt,
    analysis,
  };
}
