export {
  isWorldCompilerDiagnosticMode,
  isAutomaticRetryDisabled,
  isAutoRunDisabled,
  isShellRegenerationAfterRunStartDisabled,
  shouldFreezeOnFirstFailure,
} from './diagnostic-mode';

export {
  logCompilerEvent,
  beginCompileRun,
  endCompileRun,
  recordCompileRunIdViolation,
  updateActiveShellId,
  recordStageSuccess,
  detectProgressReset,
  recordTap,
  logStateWrite,
  logEffectLifecycle,
  getActiveCompileRun,
  getInvestigationEvents,
  loadInvestigationEventsFromSession,
  getCompileStoppedSnapshot,
  incrementComponentRender,
  logComponentMount,
  logComponentUnmount,
  createCompilerInstanceId,
  clearInvestigationLog,
} from './investigation-log';

export {
  logPipelineLifecycle,
  logPipelineOwnership,
  logLoadShellMilestone,
  recordDuplicateCompileInvocation,
  beginAsyncBoundary,
  endAsyncBoundary,
  markPendingAsyncBoundariesAtStall,
  captureUiCompilerSyncSnapshot,
  logStallThresholdReached,
  getOpenAsyncBoundaries,
  getAsyncBoundaryHistory,
  getLoadShellMilestones,
  loadStallEvidenceFromSession,
  installStallEvidenceGlobal,
  isStallEvidenceRecordingEnabled,
  clearStallEvidenceSession,
} from './stall-evidence';

export type {
  LoadShellMilestoneId,
  LoadShellMilestoneState,
  AsyncBoundaryOutcome,
  PipelineLifecycleEvent,
  StallEvidenceContext,
  AsyncBoundaryRecord,
  UiCompilerSyncSnapshot,
} from './stall-evidence';

export { classifyLoadShellStall } from './stall-classifier';
export type { StallClassificationId, StallClassificationResult } from './stall-classifier';

export {
  buildStallEvidenceReport,
  exportStallEvidenceJson,
  exportStallEvidenceMarkdown,
} from './stall-evidence-report';
export type { StallEvidenceReport } from './stall-evidence-report';

export {
  buildCompleteInvestigationExport,
  exportCompleteInvestigationJson,
  downloadInvestigationExport,
  markInvestigationInstrumentationReady,
} from './investigation-export';
export {
  initWorldCompilerInvestigationRecorder,
  isRecorderConnected,
  getRecorderSelfTest,
  loadInvestigationRecorderBootState,
  filterRealCompilerEvents,
  isSelfTestEvent,
  isRealCompilerLifecycleEvent,
} from './investigation-recorder-boot';
export type { InvestigationRecorderBootState, InvestigationRecorderSelfTest } from './investigation-recorder-boot';
export { isInvestigationInstrumentationReady } from './investigation-ready';
export type { CompleteInvestigationExport, InvestigationExportSummary } from './investigation-export';

export {
  buildInvestigationLiveStatus,
  buildRunHistory,
  loadPersistedRunHistory,
  hasMeaningfulRunData,
  refreshBrowserMode,
  getCachedBrowserMode,
  getSelectedCompileRunId,
  setSelectedCompileRunId,
  clearCurrentInvestigationRun,
} from './investigation-live-status';
export type { InvestigationLiveStatus, InvestigationRunSummary, MeaningfulRunCheck } from './investigation-live-status';

export { buildWorldCompilerForensicReport } from './session-report';
export { COMPILER_PATH_TIMERS, findTimersNearThreeSeconds } from './timer-audit';
export { WORLD_COMPILER_OWNERSHIP, buildWorldCompilerOwnershipReport } from './ownership-report';
export {
  getLayer1ForensicSnapshot,
  isLayer1Frozen,
  formatLayer1DiagnosticsMarkdown,
  setLayer1RunContext,
  freezeLayer1Failure,
  recordLayer1Transition,
  LAYER_1_ID,
  LAYER_1_DISPLAY,
  type Layer1ForensicSnapshot,
} from './layer1-forensic';

export type {
  CompilerInvestigationEvent,
  CompilerInvestigationEventType,
  ActiveCompileRun,
  CompileStoppedSnapshot,
  ResetDetectedPayload,
} from './types';

export type { WorldCompilerForensicReport } from './session-report';
