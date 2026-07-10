/** World Compiler Three-Second Reset Loop Investigation™ — event types. Forensics only. */

export type CompilerInvestigationEventType =
  | 'COMPILE_RUN_STARTED'
  | 'COMPILE_RUN_ENDED'
  | 'COMPILE_RUN_ID_VIOLATION'
  | 'COMPILER_COMPONENT_MOUNT'
  | 'COMPILER_COMPONENT_UNMOUNT'
  | 'COMPILER_COMPONENT_RENDER'
  | 'COMPILER_CONTROLLER_CREATED'
  | 'COMPILER_CONTROLLER_DESTROYED'
  | 'EFFECT_STARTED'
  | 'EFFECT_CLEANUP'
  | 'EFFECT_RESTARTED'
  | 'RESET_DETECTED'
  | 'RESET_PREVENTED'
  | 'COMPILE_STOPPED'
  | 'COMPILE_STAGE_ENTER'
  | 'COMPILE_STAGE_COMPLETE'
  | 'COMPILE_FAILED'
  | 'COMPILE_RESET'
  | 'SHELL_REQUESTED'
  | 'SHELL_CREATED'
  | 'SHELL_REGISTERED'
  | 'SHELL_RESOLVED'
  | 'SHELL_LOCKED'
  | 'SHELL_UPDATED'
  | 'SHELL_INVALIDATED'
  | 'SHELL_DELETED'
  | 'SHELL_DETACHED'
  | 'STATE_WRITE'
  | 'STATION_UPDATED'
  | 'SCENE_STACK_UPDATED'
  | 'REGISTRY_UPDATED'
  | 'GENESIS_UPDATED'
  | 'CONTEXT_UPDATED'
  | 'TAP_DETECTED'
  | 'TAP_BLOCKED_OVERLAP'
  | 'TIMER_NEAR_RESET_CADENCE'
  | 'LAYER_1_ENTERED'
  | 'LANDMARK_REQUEST_CREATED'
  | 'GENERATION_REQUEST_STARTED'
  | 'GENERATION_REQUEST_COMPLETED'
  | 'GENERATION_REQUEST_FAILED'
  | 'LANDMARK_VALIDATION_STARTED'
  | 'LANDMARK_VALIDATION_FAILED'
  | 'COMPILER_TERMINATED'
  | 'PIPELINE_LIFECYCLE'
  | 'PIPELINE_OWNERSHIP'
  | 'LOAD_SHELL_MILESTONE'
  | 'ASYNC_BOUNDARY_START'
  | 'ASYNC_BOUNDARY_END'
  | 'ASYNC_BOUNDARY_STALL'
  | 'UI_COMPILER_SYNC'
  | 'INVESTIGATION_RECORDER_SELF_TEST';

export type CompilerInvestigationEvent = {
  id: number;
  timestamp: number;
  isoTime: string;
  type: CompilerInvestigationEventType;
  compileRunId: string | null;
  compilerInstanceId: string | null;
  renderId: number | null;
  shellId: string | null;
  stationId: string | null;
  companyId: string | null;
  sceneId: string | null;
  layerNumber: number | null;
  stageName: string | null;
  status: string | null;
  elapsedMs: number | null;
  caller: string;
  source: string;
  detail?: Record<string, unknown>;
  stackTrace?: string;
};

export type ActiveCompileRun = {
  compileRunId: string;
  compilerInstanceId: string;
  renderId: number;
  startedAt: number;
  companyId: string;
  conceptId: string;
  stationId: string;
  shellId: string | null;
  previewSessionId: string;
  trigger: 'manual' | 'auto';
  status: 'running' | 'frozen' | 'success' | 'failed';
  lastSuccessfulStage: string | null;
  lastSuccessfulLayer: number | null;
  failedStage: string | null;
  failedLayer: number | null;
  error: string | null;
  resetAttemptedBy: string | null;
  resetPrevented: boolean;
};

export type CompileStoppedSnapshot = {
  compileRunId: string;
  failedStage: string | null;
  failedLayer: number | null;
  error: string | null;
  shellId: string | null;
  lastSuccessfulEvent: string | null;
  resetAttemptedBy: string | null;
  resetPrevented: boolean;
  frozenAt: string;
  layer1Forensic?: import('./layer1-forensic').Layer1ForensicSnapshot;
};

export type ResetDetectedPayload = {
  compileRunId: string | null;
  previousStage: string | null;
  previousLayer: number | null;
  currentStage: string | null;
  currentLayer: number | null;
  shellIdBefore: string | null;
  shellIdAfter: string | null;
  compilerStatusBefore: string | null;
  compilerStatusAfter: string | null;
  resetReason: string;
  caller: string;
  stackTrace: string;
};
