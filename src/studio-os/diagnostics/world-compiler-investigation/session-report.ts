import {
  getInvestigationEvents,
  getActiveCompileRun,
  getCompileStoppedSnapshot,
  loadInvestigationEventsFromSession,
} from './investigation-log';
import { findTimersNearThreeSeconds, getRuntimeTimersNearThreeSeconds, COMPILER_PATH_TIMERS } from './timer-audit';
import { buildWorldCompilerOwnershipReport } from './ownership-report';
import type { CompilerInvestigationEvent } from './types';

export type WorldCompilerForensicReport = {
  generatedAt: string;
  evidenceOnly: true;
  measuredResetIntervalsMs: number[];
  compilerRestartsVsUiOnly: 'unknown' | 'compiler_restart' | 'ui_only' | 'both';
  compileRunIdChanges: number;
  compilerInstanceIdChanges: number;
  componentRemounts: number;
  shellIdChanges: number;
  shellInvalidations: number;
  tapCount: number;
  overlappingRunsBlocked: number;
  timerAtResetCadence: ReturnType<typeof findTimersNearThreeSeconds>;
  runtimeTimersNear3s: ReturnType<typeof getRuntimeTimersNearThreeSeconds>;
  effectCleanupsBeforeReset: number;
  registrySubscriptionResets: number;
  finalSuccessfulEvent: CompilerInvestigationEvent | null;
  firstAbnormalEvent: CompilerInvestigationEvent | null;
  firstResetDetected: CompilerInvestigationEvent | null;
  compileStopped: ReturnType<typeof getCompileStoppedSnapshot>;
  activeRun: ReturnType<typeof getActiveCompileRun>;
  ownership: ReturnType<typeof buildWorldCompilerOwnershipReport>;
  layer1Classification: string;
  staticTimers: typeof COMPILER_PATH_TIMERS;
  eventCount: number;
  recentEvents: CompilerInvestigationEvent[];
};

function intervalsBetweenResets(events: CompilerInvestigationEvent[]): number[] {
  const resets = events.filter((e) => e.type === 'RESET_DETECTED');
  const intervals: number[] = [];
  for (let i = 1; i < resets.length; i += 1) {
    intervals.push(resets[i].timestamp - resets[i - 1].timestamp);
  }
  return intervals;
}

export function buildWorldCompilerForensicReport(): WorldCompilerForensicReport {
  loadInvestigationEventsFromSession();
  const events = [...getInvestigationEvents()];

  const resets = events.filter((e) => e.type === 'RESET_DETECTED');
  const runStarts = events.filter((e) => e.type === 'COMPILE_RUN_STARTED');
  const runIds = new Set(runStarts.map((e) => e.detail?.compileRunId as string).filter(Boolean));
  const instanceIds = new Set(runStarts.map((e) => e.detail?.compilerInstanceId as string).filter(Boolean));

  let layer1Classification = 'Insufficient evidence — run with ?compilerDiag=1 on failing device';
  const stageEnters = events.filter((e) => e.type === 'COMPILE_STAGE_ENTER');
  const mountLandmark = stageEnters.filter((e) => e.stageName === 'mount-landmark');
  const loadShell = stageEnters.filter((e) => e.stageName === 'load-shell');
  if (loadShell.length > 1 && mountLandmark.length === 0) {
    layer1Classification = 'B. Layer 1 (load-shell) completes then restarts — load-shell entered multiple times, mount-landmark never entered';
  } else if (mountLandmark.length === 0 && loadShell.length >= 1) {
    layer1Classification = 'A. Layer 1 never completes — mount-landmark never entered';
  } else if (events.some((e) => e.type === 'SHELL_INVALIDATED' || e.type === 'SHELL_DELETED')) {
    layer1Classification = 'C. Shell invalidated during run';
  } else if (events.filter((e) => e.type === 'COMPILER_COMPONENT_UNMOUNT').length > 0) {
    layer1Classification = 'D. Compiler component remounts';
  } else if (runStarts.length > 1) {
    layer1Classification = 'E. Multiple compile runs replace active run';
  }

  const abnormalTypes = new Set(['RESET_DETECTED', 'COMPILE_FAILED', 'COMPILE_STOPPED', 'COMPILE_RUN_ID_VIOLATION']);
  let finalSuccess: CompilerInvestigationEvent | null = null;
  let firstAbnormal: CompilerInvestigationEvent | null = null;
  for (const ev of events) {
    if (abnormalTypes.has(ev.type)) {
      if (!firstAbnormal) firstAbnormal = ev;
    } else {
      finalSuccess = ev;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    evidenceOnly: true,
    measuredResetIntervalsMs: intervalsBetweenResets(events),
    compilerRestartsVsUiOnly: resets.length > 0 && runStarts.length <= 1 ? 'ui_only' : runStarts.length > 1 ? 'both' : 'unknown',
    compileRunIdChanges: runIds.size,
    compilerInstanceIdChanges: instanceIds.size,
    componentRemounts: events.filter((e) => e.type === 'COMPILER_COMPONENT_UNMOUNT').length,
    shellIdChanges: events.filter((e) => e.type === 'SHELL_UPDATED').length,
    shellInvalidations: events.filter((e) => e.type === 'SHELL_INVALIDATED' || e.type === 'SHELL_DELETED').length,
    tapCount: events.filter((e) => e.type === 'TAP_DETECTED').length,
    overlappingRunsBlocked: events.filter((e) => e.type === 'TAP_BLOCKED_OVERLAP').length,
    timerAtResetCadence: findTimersNearThreeSeconds(),
    runtimeTimersNear3s: getRuntimeTimersNearThreeSeconds(),
    effectCleanupsBeforeReset: events.filter((e) => e.type === 'EFFECT_CLEANUP').length,
    registrySubscriptionResets: events.filter((e) => e.type === 'SCENE_STACK_UPDATED' || e.type === 'REGISTRY_UPDATED').length,
    finalSuccessfulEvent: finalSuccess,
    firstAbnormalEvent: firstAbnormal,
    firstResetDetected: resets[0] ?? null,
    compileStopped: getCompileStoppedSnapshot(),
    activeRun: getActiveCompileRun(),
    ownership: buildWorldCompilerOwnershipReport(),
    layer1Classification,
    staticTimers: COMPILER_PATH_TIMERS,
    eventCount: events.length,
    recentEvents: events.slice(-80),
  };
}
