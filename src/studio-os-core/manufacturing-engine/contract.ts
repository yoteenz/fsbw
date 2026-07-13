/**
 * Studio World Manufacturing Engine™
 * Blueprint Author designs. Asset DNA engineers. Render Intent manufactures.
 */

export const MANUFACTURING_ENGINE_VERSION = 'manufacturing-engine.v1';

/** Extended canonical compiler — Blueprint Author Phase II */
export const WORLD_MANUFACTURING_COMPILER_ORDER = [
  'founder-request',
  'blueprint-author',
  'construction-plan',
  'asset-dna',
  'render-intent',
  'manufacturing-queue',
  'ai-factory-workers',
  'manufacturing-inspection',
  'quality-guard',
  'immune-system',
  'scene-stack',
  'living-world',
] as const;

export type WorldManufacturingPhase = (typeof WORLD_MANUFACTURING_COMPILER_ORDER)[number];

export type ManufacturingWorkerRole =
  | 'architect-worker'
  | 'hero-asset-worker'
  | 'furniture-worker'
  | 'decor-worker'
  | 'lighting-worker'
  | 'animation-worker'
  | 'particle-worker'
  | 'material-worker'
  | 'background-removal-worker'
  | 'upscaling-worker'
  | 'optimization-worker';

export type AssetLifecycleStatus =
  | 'designed'
  | 'queued'
  | 'manufacturing'
  | 'inspecting'
  | 'approved'
  | 'repairing'
  | 'replaced'
  | 'retired';

export type ManufacturingJobStatus =
  | 'pending'
  | 'queued'
  | 'rendering'
  | 'inspecting'
  | 'completed'
  | 'failed'
  | 'repairing'
  | 'requeued';
