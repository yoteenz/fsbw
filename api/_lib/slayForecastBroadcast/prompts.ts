import {
  SLAY_FORECAST_GOLDEN_PROMPT_VERSION,
  injectGoldenPromptDialogue,
} from './goldenPrompt.js';
import { slayForecastGenerationConfig } from './generationConfig.js';
import {
  CLOSING_TEMPLATE_VERSION,
  DEFAULT_CLOSING_DURATION_SEC,
  DEFAULT_OPENING_DURATION_SEC,
  FULL_BROADCAST_DURATION_SEC,
  OPENING_TEMPLATE_VERSION,
} from './constants.js';
import type { GenerationSegmentType } from './types.js';

export type PromptBuildInput = {
  segmentType: GenerationSegmentType;
  script: string;
  closingScript?: string;
  durationSec?: number;
  continuityInstructions?: string;
  generationNotes?: string;
  forecastWeek?: string;
};

export function buildFullBroadcastGoldenPrompt(input: {
  openingDialogue: string;
  closingDialogue: string;
  forecastWeek?: string;
}): string {
  return injectGoldenPromptDialogue({
    openingDialogue: input.openingDialogue,
    closingDialogue: input.closingDialogue,
    forecastWeek: input.forecastWeek,
  });
}

export function buildCanonicalOpeningPrompt(input: PromptBuildInput): string {
  const duration = input.durationSec ?? DEFAULT_OPENING_DURATION_SEC;
  return [
    'PSA FORECAST STUDIO — OPENING SEGMENT',
    'Same set, same outfit, same camera, same seated position, same lighting, same framing.',
    'No added graphics, no generated text, no camera movement, no scene changes.',
    'Natural lip sync, minimal gesture, ends in the approved resting smile pose.',
    input.continuityInstructions ??
      'End frame must visually match the approved RESTING FIRST FRAME (exact pose and expression).',
    `Duration target: ~${duration.toFixed(1)} seconds.`,
    `Opening script: "${input.script.trim()}"`,
    input.generationNotes ? `Retry notes: ${input.generationNotes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildCanonicalClosingPrompt(input: PromptBuildInput): string {
  const duration = input.durationSec ?? DEFAULT_CLOSING_DURATION_SEC;
  return [
    'PSA FORECAST STUDIO — CLOSING SEGMENT',
    'Same set, same outfit, same camera, same lighting, no graphics, no added text.',
    'Clip begins from the exact RESTING LAST FRAME (same smile/pose).',
    'PSA transitions naturally into speaking, delivers closing line confidently.',
    `Duration target: ~${duration.toFixed(1)} seconds.`,
    `Closing script: "${input.script.trim()}"`,
    input.generationNotes ? `Retry notes: ${input.generationNotes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function promptTemplateVersionFor(segmentType: GenerationSegmentType): string {
  if (segmentType === 'full') return SLAY_FORECAST_GOLDEN_PROMPT_VERSION;
  return segmentType === 'opening' ? OPENING_TEMPLATE_VERSION : CLOSING_TEMPLATE_VERSION;
}

export function buildPromptSnapshot(input: PromptBuildInput): Record<string, unknown> {
  if (input.segmentType === 'full') {
    const closing = input.closingScript?.trim() ?? '';
    const prompt = buildFullBroadcastGoldenPrompt({
      openingDialogue: input.script.trim(),
      closingDialogue: closing,
      forecastWeek: input.forecastWeek,
    });
    return {
      templateVersion: SLAY_FORECAST_GOLDEN_PROMPT_VERSION,
      masterAssetVersion: slayForecastGenerationConfig.masterAssetVersion,
      prompt,
      durationSec: FULL_BROADCAST_DURATION_SEC,
      openingDialogue: input.script.trim(),
      closingDialogue: closing,
      model: slayForecastGenerationConfig.model,
      aspectRatio: slayForecastGenerationConfig.aspectRatio,
      resolution: slayForecastGenerationConfig.resolution,
      generationNotes: input.generationNotes ?? null,
    };
  }

  const prompt =
    input.segmentType === 'opening'
      ? buildCanonicalOpeningPrompt(input)
      : buildCanonicalClosingPrompt(input);
  return {
    templateVersion: promptTemplateVersionFor(input.segmentType),
    prompt,
    durationSec: input.durationSec ?? (input.segmentType === 'opening' ? DEFAULT_OPENING_DURATION_SEC : DEFAULT_CLOSING_DURATION_SEC),
    script: input.script.trim(),
    generationNotes: input.generationNotes ?? null,
  };
}
