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
} from './investigation-log';

export { buildWorldCompilerForensicReport } from './session-report';
export { COMPILER_PATH_TIMERS, findTimersNearThreeSeconds } from './timer-audit';
export { WORLD_COMPILER_OWNERSHIP, buildWorldCompilerOwnershipReport } from './ownership-report';

export type {
  CompilerInvestigationEvent,
  CompilerInvestigationEventType,
  ActiveCompileRun,
  CompileStoppedSnapshot,
  ResetDetectedPayload,
} from './types';

export type { WorldCompilerForensicReport } from './session-report';
