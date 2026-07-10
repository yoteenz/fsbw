import { WORLD_COMPILER_STAGES, worldCompilerStageLabel } from '../scene-stack/world-compiler/constants';
import type { WorldCompileStageResult } from '../scene-stack/world-compiler/compilation-report';

/** Full Experience Lab render pipeline — shell generation + World Compiler™ */
export const RENDER_PIPELINE_STEP_DEFS = [
  { id: 'compile-preview-spec', label: 'Compile preview spec' },
  { id: 'generate-shell', label: 'Generate environment shell' },
  { id: 'register-ephemeral', label: 'Register ephemeral shell' },
  { id: 'ensure-station', label: 'Mount layer stack' },
  ...WORLD_COMPILER_STAGES.map((stage) => ({
    id: stage,
    label: worldCompilerStageLabel(stage).replace(/™/g, ''),
  })),
  { id: 'complete', label: 'Render complete' },
] as const;

export type RenderPipelineStepId = (typeof RENDER_PIPELINE_STEP_DEFS)[number]['id'];

export type RenderPipelineStepStatus = 'pending' | 'active' | 'done' | 'failed';

export type RenderPipelineStep = {
  id: RenderPipelineStepId;
  label: string;
  status: RenderPipelineStepStatus;
};

export type RenderPipelineProgressInput = {
  shellPhase: 'idle' | 'compile-spec' | 'generate-shell' | 'register' | 'ready' | 'failed';
  shellStage?: 'compile-preview-spec' | 'generate-shell' | 'register-ephemeral' | 'complete';
  ensureStationActive?: boolean;
  layerPipelineActive?: boolean;
  compileStages?: WorldCompileStageResult[];
  compileSuccess?: boolean;
  compileFailedStage?: string | null;
  shellFailed?: boolean;
};

export type RenderPipelineProgress = {
  steps: RenderPipelineStep[];
  currentStepId: RenderPipelineStepId;
  currentStepLabel: string;
  stepIndex: number;
  totalSteps: number;
  progressPct: number;
  isRunning: boolean;
  isComplete: boolean;
  isFailed: boolean;
};

function shellPhaseToStepId(
  shellPhase: RenderPipelineProgressInput['shellPhase'],
  shellStage?: RenderPipelineProgressInput['shellStage']
): RenderPipelineStepId {
  if (shellPhase === 'generate-shell' || shellStage === 'generate-shell') return 'generate-shell';
  if (shellPhase === 'register' || shellStage === 'register-ephemeral') return 'register-ephemeral';
  if (shellPhase === 'compile-spec' || shellStage === 'compile-preview-spec') return 'compile-preview-spec';
  if (shellPhase === 'failed') return 'compile-preview-spec';
  return 'ensure-station';
}

export function computeRenderPipelineProgress(input: RenderPipelineProgressInput): RenderPipelineProgress {
  const totalSteps = RENDER_PIPELINE_STEP_DEFS.length;
  let currentStepId: RenderPipelineStepId = 'compile-preview-spec';

  if (input.shellPhase === 'idle') {
    currentStepId = 'compile-preview-spec';
  } else if (input.shellPhase === 'failed' || input.shellFailed) {
    currentStepId = shellPhaseToStepId(input.shellPhase, input.shellStage);
  } else if (input.shellPhase !== 'ready') {
    currentStepId = shellPhaseToStepId(input.shellPhase, input.shellStage);
  } else if (input.ensureStationActive || input.layerPipelineActive) {
    currentStepId = 'ensure-station';
  } else if (input.compileFailedStage) {
    currentStepId = input.compileFailedStage as RenderPipelineStepId;
  } else if (input.compileSuccess) {
    currentStepId = 'complete';
  } else if (input.compileStages?.length) {
    const last = input.compileStages[input.compileStages.length - 1];
    if (last?.success === false) {
      currentStepId = last.stage as RenderPipelineStepId;
    } else {
      const nextIdx = WORLD_COMPILER_STAGES.findIndex((s) => s === last?.stage) + 1;
      currentStepId =
        nextIdx > 0 && nextIdx < WORLD_COMPILER_STAGES.length
          ? WORLD_COMPILER_STAGES[nextIdx]
          : last?.stage ?? 'load-shell';
    }
  } else {
    currentStepId = 'load-shell';
  }

  const currentIndex = RENDER_PIPELINE_STEP_DEFS.findIndex((s) => s.id === currentStepId);
  const stepIndex = currentIndex >= 0 ? currentIndex : 0;

  const stageResultMap = new Map(input.compileStages?.map((s) => [s.stage, s]) ?? []);

  const steps: RenderPipelineStep[] = RENDER_PIPELINE_STEP_DEFS.map((def, idx) => {
    let status: RenderPipelineStepStatus = 'pending';
    if (idx < stepIndex) status = 'done';
    else if (idx === stepIndex) status = 'active';

    if (def.id === 'complete' && input.compileSuccess) status = 'done';
    if (WORLD_COMPILER_STAGES.includes(def.id as (typeof WORLD_COMPILER_STAGES)[number])) {
      const result = stageResultMap.get(def.id as (typeof WORLD_COMPILER_STAGES)[number]);
      if (result?.success === true) status = 'done';
      if (result?.success === false) status = 'failed';
    }
    if ((input.shellFailed || input.shellPhase === 'failed') && idx === stepIndex) status = 'failed';
    if (input.compileFailedStage === def.id) status = 'failed';

    return { id: def.id, label: def.label, status };
  });

  const doneCount = steps.filter((s) => s.status === 'done').length;
  const activePartial = steps.some((s) => s.status === 'active') ? 0.35 : 0;
  const progressPct = Math.min(
    100,
    Math.round(((doneCount + activePartial) / totalSteps) * 100)
  );

  const isComplete = Boolean(input.compileSuccess);
  const isFailed = Boolean(input.shellFailed || input.shellPhase === 'failed' || input.compileFailedStage);
  const isRunning = !isComplete && !isFailed && input.shellPhase !== 'idle';

  return {
    steps,
    currentStepId,
    currentStepLabel: RENDER_PIPELINE_STEP_DEFS[stepIndex]?.label ?? 'Starting…',
    stepIndex,
    totalSteps,
    progressPct: isComplete ? 100 : progressPct,
    isRunning,
    isComplete,
    isFailed,
  };
}

/** Step unchanged longer than this → show stall warning (ms). */
export const RENDER_PIPELINE_STALL_MS = 90_000;
