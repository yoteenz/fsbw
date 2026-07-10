/**
 * Compilation Report™ — engineering language for every successful World Compile.
 */

import type { WorldCompilerStage } from './constants';
import { worldCompilerStageLabel } from './constants';
import type { RenderValidationResult } from './render-validation';
import type { SceneComponentPackage } from './component-package';
import type { ShellLockState } from './immutable-shell';
import type { ShellResolutionDiagnostic } from '../shell-diagnostics';

export type WorldCompileStageResult = {
  stage: WorldCompilerStage;
  label: string;
  success: boolean;
  durationMs: number;
  detail: string;
  errorCode?: string;
};

export type WorldCompilationReport = {
  reportVersion: string;
  compiledAt: string;
  success: boolean;
  headline: string;
  shellLocked: boolean;
  stages: WorldCompileStageResult[];
  validation: RenderValidationResult;
  /** Schema/lineage checks on mounted packages — NOT compile success */
  sceneIntegrityPct: number;
  /** Whether every pipeline stage reached success */
  renderReadinessPct: number;
  /** First failed stage id, if any */
  failedStage: WorldCompilerStage | null;
  failedStageDetail: string | null;
  failedStageErrorCode: string | null;
  validationMode: boolean;
  shellDiagnostic: ShellResolutionDiagnostic | null;
  renderTimeMs: number;
  objectCount: number;
  componentPackageCount: number;
  memoryEstimateMb: number;
  generationCostEstimate: number;
  lines: string[];
};

function parseStageErrorCode(detail: string): string | undefined {
  const match = detail.match(/^\[([A-Z0-9_]+)\]/);
  return match?.[1];
}

export function buildCompilationReport(input: {
  stages: WorldCompileStageResult[];
  validation: RenderValidationResult;
  shellLock: ShellLockState;
  packages: SceneComponentPackage[];
  renderTimeMs: number;
  generationCostEstimate?: number;
  shellDiagnostic?: ShellResolutionDiagnostic;
  validationMode?: boolean;
}): WorldCompilationReport {
  const objectCount = input.packages.reduce((sum, p) => sum + p.componentIds.length, 0);
  const stagesSucceeded = input.stages.filter((s) => s.success).length;
  const renderReadinessPct =
    input.stages.length > 0 ? Math.round((stagesSucceeded / input.stages.length) * 100) : 0;
  const failedStage = input.stages.find((s) => !s.success) ?? null;
  const success = input.stages.every((s) => s.success) && input.validation.passed;

  const stagesWithCodes = input.stages.map((s) => ({
    ...s,
    label: worldCompilerStageLabel(s.stage),
    errorCode: s.success ? undefined : parseStageErrorCode(s.detail),
  }));

  const lines: string[] = [];
  if (success) {
    lines.push('World Compile Successful™');
  } else if (failedStage) {
    lines.push(`World Compile Failed at ${worldCompilerStageLabel(failedStage.stage)}.`);
  } else {
    lines.push('World Compile Failed — validation rejected render.');
  }
  if (input.shellLock.locked) lines.push('Shell Locked™');
  if (input.validationMode) lines.push('Validation Render Mode™ — ephemeral, no registry promotion.');
  if (input.packages.some((p) => p.layerId === 'signature-landmark')) lines.push('Landmark Mounted™');
  if (input.packages.some((p) => p.layerId === 'furniture-objects')) lines.push('Furniture Mounted™');
  if (input.packages.some((p) => p.layerId === 'lighting-systems')) lines.push('Lighting Applied™');
  if (input.packages.some((p) => p.layerId === 'atmospheric-systems')) lines.push('Atmosphere Applied™');
  if (input.packages.some((p) => p.layerId === 'ambient-motion')) lines.push('Motion Linked™');
  if (input.validation.passed) lines.push('Package Validation Passed™');
  else lines.push('Package Validation Failed™ — render rejected.');
  lines.push(`Input Integrity (packages): ${input.validation.sceneIntegrityPct}%`);
  lines.push(`Render Readiness (stages): ${renderReadinessPct}%`);
  lines.push(`Render Time: ${input.renderTimeMs}ms`);
  lines.push(`Object Count: ${objectCount}`);

  return {
    reportVersion: 'compilation-report.v2',
    compiledAt: new Date().toISOString(),
    success,
    headline: success ? 'World Compile Successful™' : 'World Compile Rejected™',
    shellLocked: input.shellLock.locked,
    stages: stagesWithCodes,
    validation: input.validation,
    sceneIntegrityPct: input.validation.sceneIntegrityPct,
    renderReadinessPct,
    failedStage: failedStage?.stage ?? null,
    failedStageDetail: failedStage?.detail ?? null,
    failedStageErrorCode: failedStage ? parseStageErrorCode(failedStage.detail) ?? null : null,
    validationMode: Boolean(input.validationMode),
    shellDiagnostic: input.shellDiagnostic ?? null,
    renderTimeMs: input.renderTimeMs,
    objectCount,
    componentPackageCount: input.packages.length,
    memoryEstimateMb: Math.round(objectCount * 2.4 + input.packages.length * 8),
    generationCostEstimate: input.generationCostEstimate ?? input.packages.length * 0.12,
    lines,
  };
}
