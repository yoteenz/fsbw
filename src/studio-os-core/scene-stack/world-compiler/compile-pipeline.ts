/**
 * World Compiler™ — compile pipeline.
 * Rebuilds the world every render. Never alpha-composites full scenes.
 */

import { buildSceneGraph, type SceneGraph } from '../scene-graph';
import { listSceneStackLayersForStation } from '../store';
import type { MasterSceneBlueprint } from '../master-scene-blueprint';
import { type WorldCompilerStage } from './constants';
import { buildComponentPackagesForStation } from './component-package';
import { resolveShellLockState } from './immutable-shell';
import { validateCompiledScene } from './render-validation';
import { buildCompilationReport, type WorldCompilationReport, type WorldCompileStageResult } from './compilation-report';
import { SCENE_GRAPH_BRANCH_TREE } from './scene-graph-branches';
import { isExperienceLabValidationRender } from '../validation-render';
import { diagnoseShellResolution } from '../shell-diagnostics';
import type { PreviewCompileContext } from '../preview-compile-context';
import { assertPreviewSessionInvariant } from '../preview-compile-context';
import { getValidationEnvironmentShell, verifyEphemeralShellMount } from '../ephemeral-validation-registry';
import { logCompilerEvent, recordStageSuccess } from '../../../studio-os/diagnostics/world-compiler-investigation';
import {
  logLoadShellMilestone,
  logPipelineLifecycle,
  recordDuplicateCompileInvocation,
  type StallEvidenceContext,
} from '../../../studio-os/diagnostics/world-compiler-investigation/stall-evidence';
import { emitStudioOsRuntimeEvent } from '../../../studio-os/diagnostics/runtime-emit';

export type WorldCompileOptions = {
  /** Ephemeral validation compile — mounts draft_ready layers, no registry promotion */
  validationMode?: boolean;
  /** Skip environment-shell — already registered in ephemeral validation registry */
  skipEnvironmentShell?: boolean;
  /** Explicit preview-scoped compile identity — required for Experience Lab validation compiles */
  previewCompileContext?: PreviewCompileContext;
  /** Forensic investigation context — logging only */
  investigation?: {
    compileRunId: string;
    compilerInstanceId: string;
    renderId: number;
  };
  /** Experience Lab runtime — emit after each compile stage */
  onStageComplete?: (stage: WorldCompilerStage, success: boolean) => void;
};

export type WorldCompileResult = {
  graph: SceneGraph;
  report: WorldCompilationReport;
  rejected: boolean;
};

async function runStage(
  stage: WorldCompilerStage,
  execute: () => Promise<string> | string,
  options?: {
    investigation?: WorldCompileOptions['investigation'];
    onStageComplete?: (stage: WorldCompilerStage, success: boolean) => void;
  }
): Promise<WorldCompileStageResult> {
  const start = performance.now();
  const investigation = options?.investigation;
  logCompilerEvent('COMPILE_STAGE_ENTER', 'compile-pipeline.runStage', {
    stageName: stage,
    detail: investigation
      ? { compileRunId: investigation.compileRunId, compilerInstanceId: investigation.compilerInstanceId }
      : undefined,
  });
  emitStudioOsRuntimeEvent('COMPILER_STAGE_CHANGED', 'world-compiler.compile-pipeline', {
    stage,
    compileRunId: investigation?.compileRunId,
  });
  if (stage === 'mount-landmark') {
    emitStudioOsRuntimeEvent('LANDMARK_GENERATED', 'world-compiler.compile-pipeline', {
      compileRunId: investigation?.compileRunId,
    });
  }
  try {
    const detail = await execute();
    const result: WorldCompileStageResult = {
      stage,
      label: stage,
      success: true,
      durationMs: Math.round(performance.now() - start),
      detail,
    };
    logCompilerEvent('COMPILE_STAGE_COMPLETE', 'compile-pipeline.runStage', {
      stageName: stage,
      detail: { durationMs: result.durationMs, detail },
    });
    recordStageSuccess(stage);
    options?.onStageComplete?.(stage, true);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stage failed';
    logCompilerEvent('COMPILE_FAILED', 'compile-pipeline.runStage', {
      stageName: stage,
      detail: { error: message },
      stackTrace: err instanceof Error ? err.stack : undefined,
    });
    const result: WorldCompileStageResult = {
      stage,
      label: stage,
      success: false,
      durationMs: Math.round(performance.now() - start),
      detail: message,
    };
    options?.onStageComplete?.(stage, false);
    return result;
  }
}

export async function compileWorldStation(input: {
  departmentId: string;
  projectId: string;
  stationId: string;
  blueprint: MasterSceneBlueprint;
  generationCostEstimate?: number;
  options?: WorldCompileOptions;
}): Promise<WorldCompileResult> {
  const validationMode = input.options?.validationMode ?? isExperienceLabValidationRender();
  const previewContext = input.options?.previewCompileContext;
  const previewSessionId = previewContext?.previewSessionId;
  const investigation = input.options?.investigation;
  const onStageComplete = input.options?.onStageComplete;
  const stageOptions = { investigation, onStageComplete };
  const shellResolveOptions = {
    validationMode,
    ...(previewSessionId ? { previewSessionId } : {}),
  };
  const diagnosticOptions = previewContext
    ? { previewCompileContext: previewContext }
    : previewSessionId
      ? { validationMode, previewSessionId }
      : { validationMode };

  const evidenceCtx: StallEvidenceContext = {
    previewSessionId: previewSessionId ?? null,
    compileRunId: investigation?.compileRunId ?? null,
    stationId: input.stationId,
    projectId: input.projectId,
    conceptId: previewContext?.conceptId ?? null,
    companyId: previewContext?.companyId ?? null,
    compileOwner: 'compileWorldStation',
    currentCompilerStage: null,
  };

  recordDuplicateCompileInvocation('compileWorldStation', evidenceCtx, {
    validationMode,
    hasPreviewContext: Boolean(previewContext),
  });

  logPipelineLifecycle('COMPILE_WORLD_STATION_ENTERED', 'world-compiler.compile-pipeline', evidenceCtx, {
    validationMode,
    previewSessionId: previewSessionId ?? null,
  });

  logLoadShellMilestone('M2', 'world-compiler.compile-pipeline.gate', evidenceCtx, previewSessionId ? 'success' : validationMode ? 'failure' : 'skipped', {
    gate: 'previewSessionId',
    validationMode,
    previewSessionIdPresent: Boolean(previewSessionId),
  });

  if (validationMode && !previewSessionId) {
    logPipelineLifecycle('COMPILE_WORLD_STATION_GATE_THROW', 'world-compiler.compile-pipeline', evidenceCtx, {
      code: 'SHELL_RECOVERY_LOOKUP_MISMATCH',
    });
    throw new Error(
      '[SHELL_RECOVERY_LOOKUP_MISMATCH] compileWorldStation requires previewCompileContext.previewSessionId for validation compiles.'
    );
  }

  const compileStart = performance.now();
  emitStudioOsRuntimeEvent('WORLD_COMPILER_STARTED', 'world-compiler.compile-pipeline', {
    stationId: input.stationId,
    compileRunId: investigation?.compileRunId,
  });
  emitStudioOsRuntimeEvent('COMPILER_STARTED', 'world-compiler.compile-pipeline', {
    stationId: input.stationId,
  });
  const stages: WorldCompileStageResult[] = [];

  stages.push(
    await runStage('load-shell', () => {
      const milestoneStart = Date.now();
      logLoadShellMilestone('M1', 'world-compiler.compile-pipeline.load-shell', evidenceCtx, 'success', {
        milestoneStartedAt: milestoneStart,
      });

      logLoadShellMilestone('M3', 'world-compiler.compile-pipeline.load-shell', evidenceCtx, 'success', {
        milestoneStartedAt: milestoneStart,
        action: 'registry_lookup_started',
      });

      const shellLock = resolveShellLockState(
        input.departmentId,
        input.projectId,
        input.stationId,
        shellResolveOptions
      );
      const shellDiagnostic = diagnoseShellResolution(
        input.departmentId,
        input.projectId,
        input.stationId,
        diagnosticOptions
      );

      logLoadShellMilestone('M4', 'world-compiler.compile-pipeline.load-shell', evidenceCtx, shellLock.shellUrl ? 'success' : 'failure', {
        milestoneStartedAt: milestoneStart,
        resolution: shellLock.resolution,
        shellUrl: shellLock.shellUrl ? 'present' : 'missing',
        registryNamespace: shellDiagnostic.registryMode ?? null,
        shellId: shellDiagnostic.requestedShellId ?? null,
      });

      if (validationMode && previewSessionId) {
        const registered = getValidationEnvironmentShell(previewSessionId);
        if (registered) {
          assertPreviewSessionInvariant(
            registered.previewSessionId,
            previewSessionId,
            investigation?.compileRunId
          );
          const verification = verifyEphemeralShellMount({
            previewSessionId,
            departmentId: input.departmentId,
            projectId: input.projectId,
            stationId: input.stationId,
          });
          logLoadShellMilestone('M5', 'world-compiler.compile-pipeline.load-shell', evidenceCtx, verification.ok ? 'success' : 'failure', {
            milestoneStartedAt: milestoneStart,
            verificationOk: verification.ok,
            errorCode: verification.errorCode ?? null,
            registryNamespace: verification.registryNamespace ?? null,
            shellId: verification.shellId ?? null,
          });
          if (!verification.ok) {
            throw new Error(
              `[${verification.errorCode ?? 'SHELL_RECOVERY_LOOKUP_MISMATCH'}] ${verification.detail ?? 'Ephemeral shell registration/lookup mismatch.'} registration=${verification.registrationPreviewSessionId} lookup=${verification.lookupPreviewSessionId} shellId=${verification.shellId ?? 'none'} namespace=${verification.registryNamespace} compileRunId=${investigation?.compileRunId ?? 'unknown'}`
            );
          }
        } else {
          logLoadShellMilestone('M5', 'world-compiler.compile-pipeline.load-shell', evidenceCtx, 'skipped', {
            milestoneStartedAt: milestoneStart,
            reason: 'no registered validation shell for session',
          });
        }
      } else {
        logLoadShellMilestone('M5', 'world-compiler.compile-pipeline.load-shell', evidenceCtx, 'skipped', {
          milestoneStartedAt: milestoneStart,
          reason: 'not validation mode or no previewSessionId',
        });
      }

      if (!shellLock.shellUrl) {
        let code = shellLock.resolution === 'missing-record' ? 'SHELL_RECORD_MISSING' : 'SHELL_URL_MISSING';
        if (
          validationMode &&
          previewSessionId &&
          getValidationEnvironmentShell(previewSessionId) &&
          shellLock.resolution === 'missing-record'
        ) {
          code = 'SHELL_RECOVERY_LOOKUP_MISMATCH';
        }
        throw new Error(
          `[${code}] No executable shell loaded. ${shellDiagnostic.failureReason ?? 'environment-shell unresolved.'} Station ${input.stationId} · preview ${previewSessionId ?? 'none'} · mode ${shellDiagnostic.authorizationMode}.`
        );
      }

      emitStudioOsRuntimeEvent('SHELL_CREATED', 'world-compiler.compile-pipeline', {
        stationId: input.stationId,
        shellVersion: shellLock.shellVersion,
      });
      emitStudioOsRuntimeEvent('SHELL_RESOLVED', 'world-compiler.compile-pipeline', {
        stationId: input.stationId,
        compileRunId: investigation?.compileRunId,
        shellVersion: shellLock.shellVersion,
        resolution: shellLock.resolution,
      });
      return `Shell v${shellLock.shellVersion} loaded (${shellLock.resolution}) as reference.`;
    }, stageOptions)
  );

  const loadShellStage = stages[stages.length - 1];
  if (loadShellStage?.success) {
    logLoadShellMilestone('M6', 'world-compiler.compile-pipeline.onStageComplete', evidenceCtx, onStageComplete ? 'success' : 'skipped', {
      onStageCompleteRegistered: Boolean(onStageComplete),
      stageSuccess: true,
    });
  } else if (loadShellStage?.success === false) {
    logLoadShellMilestone('M6', 'world-compiler.compile-pipeline.onStageComplete', evidenceCtx, 'failure', {
      detail: loadShellStage.detail,
    });
  }

  const shellLock = resolveShellLockState(
    input.departmentId,
    input.projectId,
    input.stationId,
    shellResolveOptions
  );
  const shellDiagnostic = diagnoseShellResolution(
    input.departmentId,
    input.projectId,
    input.stationId,
    diagnosticOptions
  );
  const records = listSceneStackLayersForStation(
    input.departmentId,
    input.projectId,
    input.stationId
  );

  stages.push(
    await runStage('lock-shell', () => {
      logLoadShellMilestone('M7', 'world-compiler.compile-pipeline.lock-shell', evidenceCtx, 'success', {
        action: 'transition_to_lock_shell',
        shellLocked: shellLock.locked,
      });
      if (!shellLock.locked) return 'Shell awaiting approval — not yet locked.';
      return `Shell locked at ${shellLock.lockedAt ?? 'unknown'}.`;
    }, stageOptions)
  );

  const packages = buildComponentPackagesForStation(records, input.stationId, { validationMode });

  for (const stage of [
    'mount-landmark',
    'mount-furniture',
    'apply-materials',
    'calculate-lighting',
    'apply-atmosphere',
    'apply-motion',
    'bake-reflections',
  ] as WorldCompilerStage[]) {
    stages.push(
      await runStage(stage, () => {
        const branch = SCENE_GRAPH_BRANCH_TREE.find((b) =>
          b.branchId.includes(stage.replace('mount-', '').replace('apply-', '').replace('calculate-', '').split('-')[0] ?? '')
        );
        const mounted = packages.filter((p) => {
          if (stage === 'mount-landmark') return p.layerId === 'signature-landmark';
          if (stage === 'mount-furniture') return p.layerId === 'furniture-objects';
          if (stage === 'apply-materials') return p.layerId === 'surface-materials';
          if (stage === 'calculate-lighting') return p.layerId === 'lighting-systems';
          if (stage === 'apply-atmosphere') return p.layerId === 'atmospheric-systems';
          if (stage === 'apply-motion') return p.layerId === 'ambient-motion';
          if (stage === 'bake-reflections') return p.reflectionGroup.includes('reflections');
          return false;
        });
        if (mounted.length === 0) return `Stage skipped — no ${stage} components yet.`;
        return `${mounted.length} component package(s) mounted — ${branch?.displayName ?? stage}. No upstream repaint.`;
      }, stageOptions)
    );
  }

  const graph = buildSceneGraph({
    blueprint: input.blueprint,
    departmentId: input.departmentId,
    projectId: input.projectId,
    stationId: input.stationId,
  });

  const validation = validateCompiledScene({ graph, packages, shellLock });

  stages.push(
    await runStage('render-final-scene', () => {
      if (!validation.passed) {
        throw new Error(
          validation.issues
            .filter((i) => i.severity === 'error')
            .map((i) => i.message)
            .join(' ')
        );
      }
      return `Scene integrity ${validation.sceneIntegrityPct}% — world rebuilt from ${packages.length} component packages.`;
    }, stageOptions)
  );

  const renderTimeMs = Math.round(performance.now() - compileStart);
  const report = buildCompilationReport({
    stages,
    validation,
    shellLock,
    packages,
    renderTimeMs,
    generationCostEstimate: input.generationCostEstimate,
    shellDiagnostic: shellDiagnostic.failureReason ? shellDiagnostic : undefined,
    validationMode,
  });

  if (report.success) {
    emitStudioOsRuntimeEvent('WORLD_COMPILER_STOPPED', 'world-compiler.compile-pipeline', {
      stationId: input.stationId,
      renderTimeMs,
    });
    emitStudioOsRuntimeEvent('SHELL_LOADED', 'world-compiler.compile-pipeline', {
      shellVersion: shellLock.shellVersion,
      stationId: input.stationId,
    });
  } else {
    emitStudioOsRuntimeEvent('COMPILER_FAILED', 'world-compiler.compile-pipeline', {
      stationId: input.stationId,
    });
  }

  logPipelineLifecycle('COMPILE_WORLD_STATION_COMPLETED', 'world-compiler.compile-pipeline', evidenceCtx, {
    success: report.success,
    failedStage: report.failedStage ?? null,
    stageCount: stages.length,
    renderTimeMs,
  });

  return {
    graph,
    report,
    rejected: !report.success,
  };
}