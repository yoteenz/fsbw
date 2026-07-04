/**
 * Server-side Creative DNA mirror for Asset Factory pipeline.
 * Keeps api/_lib independent from src/ — values must match CreativeDnaRegistry.ts.
 */

export const SERVER_CREATIVE_DNA_VERSION = '1.0';

export const SERVER_CREATIVE_DNA_BENCHMARK = {
  unitSlug: 'soft-wave',
  label: 'SOFT WAVE',
  collectionNumber: '003',
  /** Website product image — reference input for Fal generation, not the processing master. */
  productReferenceSrc: '/assets/2D WAVY FRONT.png',
} as const;

export const SERVER_CREATIVE_DNA_LOCKED_RULE_COUNT = 20;

export type ServerCreativeDnaContext = {
  version: string;
  benchmarkUnitSlug: string;
  productReferenceSrc: string;
  displayBustLabel: string;
  approvedPromptVersion: string;
  lockStatus: 'locked';
  rulesApplied: string[];
};

export function resolveServerCreativeDnaForAssetFactory(opts: {
  unitSlug?: string;
  productReferenceSrc?: string;
  masterHeroSrcOverride?: string;
}): ServerCreativeDnaContext {
  const unitSlug = opts.unitSlug ?? SERVER_CREATIVE_DNA_BENCHMARK.unitSlug;
  const productReferenceSrc =
    opts.productReferenceSrc ??
    SERVER_CREATIVE_DNA_BENCHMARK.productReferenceSrc;

  return {
    version: SERVER_CREATIVE_DNA_VERSION,
    benchmarkUnitSlug: SERVER_CREATIVE_DNA_BENCHMARK.unitSlug,
    productReferenceSrc,
    displayBustLabel: 'Official Frontal Slayer Display Bust v1.0',
    approvedPromptVersion: 'v2.0',
    lockStatus: 'locked',
    rulesApplied: [
      'Creative DNA v1.0 loaded — photography rules are locked',
      'Asset Factory must not invent product photography rules',
      'Existing website product image is reference input only — never the final master',
      `Official Display Bust v1.0 · approved prompt v2.0 · ${SERVER_CREATIVE_DNA_LOCKED_RULE_COUNT} locked specifications`,
      unitSlug === SERVER_CREATIVE_DNA_BENCHMARK.unitSlug
        ? `Benchmark unit: SOFT WAVE ${SERVER_CREATIVE_DNA_BENCHMARK.collectionNumber}`
        : `Unit ${unitSlug} inherits Creative DNA v1.0`,
      opts.masterHeroSrcOverride
        ? 'Using pre-generated Fal master hero for derivative processing'
        : 'Generate new Master Hero Portrait before background removal',
    ],
  };
}
