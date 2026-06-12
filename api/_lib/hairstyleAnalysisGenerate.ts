import {
  generateHairstyleAnalysisWithFal,
  type GenerateHairstyleAnalysisFalInput,
  type GenerateHairstyleAnalysisFalResult,
} from './hairstyleAnalysisFal.js';
import {
  generateHairstyleAnalysisComposite,
  type GenerateHairstyleAnalysisCompositeInput,
  type GenerateHairstyleAnalysisCompositeResult,
} from './hairstyleAnalysisCompositeCard.js';

export type HairstyleAnalysisRenderMode = 'composite' | 'fal';

/** Default: composite (immutable template + sharp overlays). Set HAIRSTYLE_ANALYSIS_RENDER_MODE=fal to revert. */
export function hairstyleAnalysisRenderMode(): HairstyleAnalysisRenderMode {
  const raw = process.env.HAIRSTYLE_ANALYSIS_RENDER_MODE?.trim().toLowerCase();
  if (raw === 'fal') return 'fal';
  return 'composite';
}

export type GenerateHairstyleAnalysisInput = GenerateHairstyleAnalysisFalInput;

export type GenerateHairstyleAnalysisResult =
  | (GenerateHairstyleAnalysisFalResult & { renderMode: 'fal' })
  | GenerateHairstyleAnalysisCompositeResult;

export async function generateHairstyleAnalysis(
  input: GenerateHairstyleAnalysisInput
): Promise<GenerateHairstyleAnalysisResult> {
  if (hairstyleAnalysisRenderMode() === 'fal') {
    const result = await generateHairstyleAnalysisWithFal(input);
    return { ...result, renderMode: 'fal' };
  }
  return generateHairstyleAnalysisComposite(input as GenerateHairstyleAnalysisCompositeInput);
}
