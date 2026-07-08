/**
 * Compilation Report™ — engineering language for every successful World Compile.
 */

import type { WorldCompilerStage } from './constants';
import { worldCompilerStageLabel } from './constants';
import type { RenderValidationResult } from './render-validation';
import type { SceneComponentPackage } from './component-package';
import type { ShellLockState } from './immutable-shell';

export type WorldCompileStageResult = {
  stage: WorldCompilerStage;
  label: string;
  success: boolean;
  durationMs: number;
  detail: string;
};

export type WorldCompilationReport = {
  reportVersion: string;
  compiledAt: string;
  success: boolean;
  headline: string;
  shellLocked: boolean;
  stages: WorldCompileStageResult[];
  validation: RenderValidationResult;
  sceneIntegrityPct: number;
  renderTimeMs: number;
  objectCount: number;
  componentPackageCount: number;
  memoryEstimateMb: number;
  generationCostEstimate: number;
  lines: string[];
};

export function buildCompilationReport(input: {
  stages: WorldCompileStageResult[];
  validation: RenderValidationResult;
  shellLock: ShellLockState;
  packages: SceneComponentPackage[];
  renderTimeMs: number;
  generationCostEstimate?: number;
}): WorldCompilationReport {
  const objectCount = input.packages.reduce((sum, p) => sum + p.componentIds.length, 0);
  const success = input.stages.every((s) => s.success) && input.validation.passed;

  const lines: string[] = [];
  if (success) {
    lines.push('World Compile Successful™');
  } else {
    lines.push('World Compile Failed — validation rejected render.');
  }
  if (input.shellLock.locked) lines.push('Shell Locked™');
  if (input.packages.some((p) => p.layerId === 'signature-landmark')) lines.push('Landmark Mounted™');
  if (input.packages.some((p) => p.layerId === 'furniture-objects')) lines.push('Furniture Mounted™');
  if (input.packages.some((p) => p.layerId === 'lighting-systems')) lines.push('Lighting Applied™');
  if (input.packages.some((p) => p.layerId === 'atmospheric-systems')) lines.push('Atmosphere Applied™');
  if (input.packages.some((p) => p.layerId === 'ambient-motion')) lines.push('Motion Linked™');
  if (input.validation.passed) lines.push('Validation Passed™');
  else lines.push('Validation Failed™ — render rejected.');
  lines.push(`Scene Integrity: ${input.validation.sceneIntegrityPct}%`);
  lines.push(`Render Time: ${input.renderTimeMs}ms`);
  lines.push(`Object Count: ${objectCount}`);

  return {
    reportVersion: 'compilation-report.v1',
    compiledAt: new Date().toISOString(),
    success,
    headline: success ? 'World Compile Successful™' : 'World Compile Rejected™',
    shellLocked: input.shellLock.locked,
    stages: input.stages.map((s) => ({ ...s, label: worldCompilerStageLabel(s.stage) })),
    validation: input.validation,
    sceneIntegrityPct: input.validation.sceneIntegrityPct,
    renderTimeMs: input.renderTimeMs,
    objectCount,
    componentPackageCount: input.packages.length,
    memoryEstimateMb: Math.round(objectCount * 2.4 + input.packages.length * 8),
    generationCostEstimate: input.generationCostEstimate ?? input.packages.length * 0.12,
    lines,
  };
}
