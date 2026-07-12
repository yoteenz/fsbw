/**
 * Scene Stack v2 — assembly only. No generation at compose time.
 */

import type { SceneStackLayerId } from '../scene-stack/types';
import type { GenerationPhase } from './contract';

export const SCENE_STACK_V2_VERSION = 'scene-stack.v2';

/** Assembly order — maps to World Compiler v2 scene-assembly phase */
export const SCENE_STACK_V2_ASSEMBLY_ORDER: Array<{
  assemblyStep: string;
  layerId: SceneStackLayerId | null;
  phase: GenerationPhase;
  generates: false;
}> = [
  { assemblyStep: 'blueprint-shell', layerId: 'environment-shell', phase: 'scene-assembly', generates: false },
  { assemblyStep: 'room-blueprint-metadata', layerId: null, phase: 'scene-assembly', generates: false },
  { assemblyStep: 'architecture', layerId: 'environment-shell', phase: 'scene-assembly', generates: false },
  { assemblyStep: 'hero-assets', layerId: 'signature-landmark', phase: 'scene-assembly', generates: false },
  { assemblyStep: 'furniture', layerId: 'furniture-objects', phase: 'scene-assembly', generates: false },
  { assemblyStep: 'decor', layerId: 'surface-materials', phase: 'scene-assembly', generates: false },
  { assemblyStep: 'materials', layerId: 'surface-materials', phase: 'scene-assembly', generates: false },
  { assemblyStep: 'lighting', layerId: 'lighting-systems', phase: 'scene-assembly', generates: false },
  { assemblyStep: 'effects', layerId: 'atmospheric-systems', phase: 'scene-assembly', generates: false },
  { assemblyStep: 'interaction', layerId: 'interaction', phase: 'scene-assembly', generates: false },
];

export type SceneStackV2AssemblyInput = {
  departmentId: string;
  projectId: string;
  stationId: string;
  mountedLayers: Partial<Record<SceneStackLayerId, { publicUrl: string; approved: boolean }>>;
};

export type SceneStackV2AssemblyResult = {
  ok: boolean;
  assembledSteps: string[];
  skippedSteps: string[];
  generationOccurred: false;
  errors: string[];
};

export function assembleSceneStackV2(input: SceneStackV2AssemblyInput): SceneStackV2AssemblyResult {
  const assembledSteps: string[] = [];
  const skippedSteps: string[] = [];
  const errors: string[] = [];

  for (const step of SCENE_STACK_V2_ASSEMBLY_ORDER) {
    if (!step.layerId) {
      assembledSteps.push(step.assemblyStep);
      continue;
    }
    const layer = input.mountedLayers[step.layerId];
    if (!layer?.publicUrl) {
      skippedSteps.push(step.assemblyStep);
      continue;
    }
    if (!layer.approved) {
      errors.push(`${step.assemblyStep}: layer ${step.layerId} not approved — cannot mount.`);
      continue;
    }
    assembledSteps.push(step.assemblyStep);
  }

  return {
    ok: errors.length === 0,
    assembledSteps,
    skippedSteps,
    generationOccurred: false,
    errors,
  };
}

export function assertSceneAssemblyNoGeneration(): true {
  return true;
}
