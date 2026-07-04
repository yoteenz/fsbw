import {
  CREATIVE_DNA_APPROVED_PROMPT_BODY,
  CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT,
  PRODUCT_PHOTOGRAPHY_POC_UNIT,
} from './creativeDnaV1.js';

export function assembleProductPhotographyFalPrompt(opts: {
  unitLabel: string;
  collectionNumber: string;
  texture: string;
  length: string;
  density: string;
  lace: string;
  includeBenchmarkAttachment: boolean;
}): string {
  const benchmarkBlock = opts.includeBenchmarkAttachment
    ? 'IMAGE 3 = Approved SOFT WAVE benchmark Master Hero — composition, lighting, white studio quality, and negative space ONLY. Never replace mannequin identity or hair texture from IMAGE 1 and IMAGE 2.'
    : 'Use editorial reference prompt text below for lighting and composition quality only.';

  return [
    CREATIVE_DNA_APPROVED_PROMPT_BODY,
    '',
    '— ACTIVE GENERATION (CREATIVE DNA v1.0) —',
    `UNIT: ${opts.unitLabel}`,
    `UNIT NUMBER: ${opts.collectionNumber}`,
    `TEXTURE: ${opts.texture}`,
    `LENGTH: ${opts.length}`,
    `DENSITY: ${opts.density}`,
    `LACE: ${opts.lace}`,
    '',
    'EDITORIAL REFERENCE (STYLE ONLY — DO NOT REPLACE MANNEQUIN OR PRODUCT IDENTITY):',
    CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT,
    '',
    'IMAGE ATTACHMENT INSTRUCTIONS:',
    'IMAGE 1 = Official Frontal Slayer Display Bust v1.0 — lock gray bust material, proportions, chest logo.',
    'IMAGE 2 = Product reference — lock hair texture, wave pattern, length impression, density, lace readability.',
    benchmarkBlock,
    '',
    'OUTPUT: Single Master Hero Portrait · 1:1 square · pure white seamless studio · photoreal luxury commercial quality.',
    'Do not invent photography rules. Follow Creative DNA v1.0 locked specifications exactly.',
    `Benchmark unit reference: ${PRODUCT_PHOTOGRAPHY_POC_UNIT.label} ${PRODUCT_PHOTOGRAPHY_POC_UNIT.collectionNumber}.`,
  ].join('\n');
}
