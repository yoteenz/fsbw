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

export type WorldCompileOptions = {
  /** Ephemeral validation compile — mounts draft_ready layers, no registry promotion */
  validationMode?: boolean;
};

export type WorldCompileResult = {
  graph: SceneGraph;
  report: WorldCompilationReport;
  rejected: boolean;
};

async function runStage(
  stage: WorldCompilerStage,
  execute: () => Promise<string> | string
): Promise<WorldCompileStageResult> {
  const start = performance.now();
  try {
    const detail = await execute();
    return {
      stage,
      label: stage,
      success: true,
      durationMs: Math.round(performance.now() - start),
      detail,
    };
  } catch (err) {
    return {
      stage,
      label: stage,
      success: false,
      durationMs: Math.round(performance.now() - start),
      detail: err instanceof Error ? err.message : 'Stage failed',
    };
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
  const compileStart = performance.now();
  const stages: WorldCompileStageResult[] = [];
  const shellLock = resolveShellLockState(input.departmentId, input.projectId, input.stationId, {
    validationMode,
  });
  const shellDiagnostic = diagnoseShellResolution(
    input.departmentId,
    input.projectId,
    input.stationId,
    { validationMode }
  );
  const records = listSceneStackLayersForStation(
    input.departmentId,
    input.projectId,
    input.stationId
  );

  stages.push(
    await runStage('load-shell', () => {
      if (!shellLock.shellUrl) {
        const code = shellLock.resolution === 'missing-record' ? 'SHELL_RECORD_MISSING' : 'SHELL_URL_MISSING';
        throw new Error(
          `[${code}] No executable shell loaded. ${shellDiagnostic.failureReason ?? 'environment-shell unresolved.'} Station ${input.stationId} · mode ${shellDiagnostic.authorizationMode}.`
        );
      }
      return `Shell v${shellLock.shellVersion} loaded (${shellLock.resolution}) as reference.`;
    })
  );

  stages.push(
    await runStage('lock-shell', () => {
      if (!shellLock.locked) return 'Shell awaiting approval — not yet locked.';
      return `Shell locked at ${shellLock.lockedAt ?? 'unknown'}.`;
    })
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
      })
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
    })
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

  return {
    graph,
    report,
    rejected: !report.success,
  };
}
