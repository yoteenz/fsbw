/**
 * Studio World™ Architecture Auditor™
 * Permanent architectural intelligence — guardian of Studio World philosophy.
 */

export type * from './types';
export { ARCHITECTURE_AUDITOR_EVENT } from './types';
export * from './laws';
export * from './webpage-detector';
export * from './scene-stack-auditor';
export * from './route-auditor';
export * from './asset-registry-auditor';
export * from './continuity-auditor';
export * from './recommendation-engine';
export * from './memory-store';
export * from './auditor';
export * from './pipeline-gate';
export * from './pipeline-gate';
export {
  STUDIO_WORLD_PRODUCTION_PIPELINE,
  getPipelineStage,
  stageComesBefore,
} from './pipeline-stages';
export type { StudioWorldPipelineStage, StudioWorldPipelineStageId } from './pipeline-stages';
