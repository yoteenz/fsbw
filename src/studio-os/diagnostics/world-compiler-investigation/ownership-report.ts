import type { OwnershipConflict } from '../types';

/** World Compiler state ownership — evidence baseline. */
export const WORLD_COMPILER_OWNERSHIP: Record<
  string,
  { owner: string; writers: string[]; readers: string[]; subscribers: string[] }
> = {
  activeCompileRun: {
    owner: 'world-compiler-investigation/investigation-log (diag) · useCreativeStudioRenderPreview pipelineRunRef (prod)',
    writers: ['beginCompileRun', 'runFullPipeline', 'auto-run effect cleanup'],
    readers: ['CreativeStudioPipelineStatusBar', 'SceneStackViewport'],
    subscribers: [],
  },
  currentStage: {
    owner: 'computeRenderPipelineProgress ← compileReport.stages + shellPipelinePhase',
    writers: ['setShellPipelinePhase', 'compileWorldStation stages', 'setCompileReports'],
    readers: ['CreativeStudioPipelineStatusBar', 'SceneStackViewport'],
    subscribers: ['renderPipelineProgress useMemo'],
  },
  currentLayer: {
    owner: 'useSceneStack pipelineLayer state',
    writers: ['ensureStation loop', 'generateLayer'],
    readers: ['getStationPipelineProgress', 'SceneStackViewport'],
    subscribers: ['SCENE_STACK_HYDRATED_EVENT → bump'],
  },
  shellRecord: {
    owner: 'ephemeral-validation-registry (validation) · scene-stack/store localStorage (prod)',
    writers: ['registerValidationEnvironmentShell', 'clearValidationPreviewSession', 'saveSceneStackLayerRecord'],
    readers: ['getSceneStackLayerRecord', 'resolveShellLockState'],
    subscribers: ['studio-os-scene-stack-hydrated'],
  },
  stationRecord: {
    owner: 'scene-stack/store',
    writers: ['ensureStation', 'generateLayer'],
    readers: ['compileWorldStation', 'listSceneStackLayersForStation'],
    subscribers: ['pipeline registry sync'],
  },
  compileReport: {
    owner: 'useSceneStack compileReports[stationId]',
    writers: ['compileStation', 'generateLayer fire-and-forget compileWorldStation'],
    readers: ['useCreativeStudioRenderPreview', 'computeRenderPipelineProgress'],
    subscribers: [],
  },
  progressPct: {
    owner: 'computeRenderPipelineProgress (derived)',
    writers: ['shell phase + compile stages + layer pipeline flags'],
    readers: ['CreativeStudioPipelineStatusBar'],
    subscribers: [],
  },
  retryState: {
    owner: 'useCreativeStudioRenderPreview retryPipeline + showRetry UI',
    writers: ['retryPipeline', 'failed compile/shell'],
    readers: ['CreativeStudioRenderPreview footer'],
    subscribers: [],
  },
};

export function buildWorldCompilerOwnershipReport(): OwnershipConflict[] {
  return Object.entries(WORLD_COMPILER_OWNERSHIP).map(([stateKey, meta]) => ({
    stateKey,
    owners: [meta.owner],
    writers: meta.writers,
    readers: meta.readers,
    mutationCount: 0,
  }));
}
