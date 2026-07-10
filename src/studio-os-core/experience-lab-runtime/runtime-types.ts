import type { CreativePreviewCompanyId } from '../creative-studio-preview/types';
import type { CreativePreviewRenderBinding } from '../creative-studio-preview/render-bindings';
import type { RenderPipelineProgress } from '../creative-studio-preview/render-pipeline-progress';
import type { ValidationShellPipelineResult } from '../creative-studio-preview/validation-shell-pipeline';
import type {
  SceneGraph,
  SceneStackCompositeStatus,
  SceneStackLayerId,
  SceneStackLayerView,
  WorldCompilationReport,
} from '../scene-stack';
import type { ShellResolutionDiagnostic } from '../scene-stack/shell-diagnostics';

export type SceneStackPipelineProgress = {
  stationId: string;
  layersComplete: number;
  layersTotal: number;
  currentLayerId: SceneStackLayerId | null;
  currentLayerLabel: string | null;
  phase: 'idle' | 'queued' | 'generating';
};

export type ShellPipelinePhase =
  | 'idle'
  | 'compile-spec'
  | 'generate-shell'
  | 'register'
  | 'ensure-station'
  | 'world-compile'
  | 'ready'
  | 'failed';

export type RenderPipelineRunMeta = {
  runAttempt: number;
  runStartedAt: number | null;
  elapsedMs: number;
  lastStepChangeAt: number | null;
  stepStallMs: number;
  isStalled: boolean;
};

export type RuntimeRenderStatus = 'idle' | 'running' | 'paused' | 'complete' | 'failed';

export type ExperienceLabSessionKey = {
  companyId: CreativePreviewCompanyId;
  conceptId: 'a' | 'b' | 'c';
  departmentId: string;
  stationId: string;
  projectId: string;
  workspaceId?: string;
};

export type ExperienceLabRuntimeSnapshot = {
  sessionId: string;
  compileRunId: string;
  binding: CreativePreviewRenderBinding;
  stationId: string;
  previewSessionId: string;
  heartbeat: number;
  shellPipelinePhase: ShellPipelinePhase;
  shellPipelineStage: ValidationShellPipelineResult['stage'];
  shellPipelineResult: ValidationShellPipelineResult | null;
  renderPipelineProgress: RenderPipelineProgress;
  runMeta: RenderPipelineRunMeta;
  renderStatus: RuntimeRenderStatus;
  currentStage: string | null;
  completedStages: string[];
  errors: string[];
  layers: SceneStackLayerView[];
  status: SceneStackCompositeStatus;
  pipeline: SceneStackPipelineProgress;
  sceneGraph: SceneGraph;
  compileReport: WorldCompilationReport | null;
  shellDiagnostic: ShellResolutionDiagnostic;
  shellReady: boolean;
  isBuilding: boolean;
  companyId: CreativePreviewCompanyId;
  conceptId: 'a' | 'b' | 'c';
};
