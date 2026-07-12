/**
 * World Compiler v2 — canonical construction order.
 * Generation is hierarchical. Assembly is deterministic.
 */

import type { GenerationPhase } from './contract';

export const WORLD_COMPILER_V2_VERSION = 'world-compiler.v2';

/** Official World Compiler generation + assembly order */
export const WORLD_COMPILER_V2_ORDER: GenerationPhase[] = [
  'world-blueprint',
  'room-blueprint',
  'architecture-validation',
  'signature-asset-generation',
  'furniture-generation',
  'decoration-generation',
  'material-application',
  'lighting-pass',
  'scene-assembly',
  'room-validation',
  'immune-check',
  'activate-room',
];

export const WORLD_COMPILER_V2_STAGE_LABELS: Record<GenerationPhase, string> = {
  'world-blueprint': 'Generate BlueprintShell™',
  'room-blueprint': 'Define Room Blueprint',
  'architecture-validation': 'Validate Architecture',
  'signature-asset-generation': 'Generate Hero Assets',
  'furniture-generation': 'Generate Furniture',
  'decoration-generation': 'Generate Decor',
  'material-application': 'Apply Organization Materials',
  'lighting-pass': 'Bake Lighting',
  'scene-assembly': 'Assemble Scene (no generation)',
  'room-validation': 'Validate Room Systems',
  'immune-check': 'Run Immune System',
  'activate-room': 'Activate Room',
};

/** Phases where provider dispatch is allowed */
export const WORLD_COMPILER_V2_GENERATION_PHASES: GenerationPhase[] = [
  'world-blueprint',
  'signature-asset-generation',
  'furniture-generation',
  'decoration-generation',
  'lighting-pass',
];

/** Phases where only assembly occurs — zero generation */
export const WORLD_COMPILER_V2_ASSEMBLY_ONLY_PHASES: GenerationPhase[] = [
  'scene-assembly',
];

export type WorldCompilerV2StageResult = {
  phase: GenerationPhase;
  success: boolean;
  durationMs: number;
  detail: string;
  generationOccurred: boolean;
};

export function isGenerationPhase(phase: GenerationPhase): boolean {
  return WORLD_COMPILER_V2_GENERATION_PHASES.includes(phase);
}

export function isAssemblyOnlyPhase(phase: GenerationPhase): boolean {
  return WORLD_COMPILER_V2_ASSEMBLY_ONLY_PHASES.includes(phase);
}

export function nextCompilerPhase(current: GenerationPhase): GenerationPhase | null {
  const idx = WORLD_COMPILER_V2_ORDER.indexOf(current);
  if (idx < 0 || idx >= WORLD_COMPILER_V2_ORDER.length - 1) return null;
  return WORLD_COMPILER_V2_ORDER[idx + 1]!;
}

export function assertArchitectureGatePassed(
  architectureValid: boolean,
  nextPhase: GenerationPhase
): { ok: true } | { ok: false; reason: string } {
  const requiresArchitecture = [
    'signature-asset-generation',
    'furniture-generation',
    'decoration-generation',
    'material-application',
    'lighting-pass',
    'scene-assembly',
    'room-validation',
    'immune-check',
    'activate-room',
  ];
  if (!architectureValid && requiresArchitecture.includes(nextPhase)) {
    return {
      ok: false,
      reason: 'BlueprintShell validation failed — repair architecture only before continuing.',
    };
  }
  return { ok: true };
}
