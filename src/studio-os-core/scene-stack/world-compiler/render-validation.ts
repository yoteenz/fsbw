/**
 * Render Validation™ — reject invalid compiles before final render.
 * Never silently compose ghost geometry, duplicates, or shell bleed-through.
 */

import type { SceneComponentPackage } from './component-package';
import type { ShellLockState } from './immutable-shell';
import type { SceneGraph, SceneGraphNode } from '../scene-graph';
import type { SceneStackLayerId } from '../types';

export type RenderValidationIssue = {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  layerId?: SceneStackLayerId;
};

export type RenderValidationResult = {
  passed: boolean;
  sceneIntegrityPct: number;
  issues: RenderValidationIssue[];
};

function detectDuplicateComponents(packages: SceneComponentPackage[]): RenderValidationIssue[] {
  const seen = new Set<string>();
  const issues: RenderValidationIssue[] = [];

  for (const pkg of packages) {
    for (const id of pkg.componentIds) {
      if (seen.has(id)) {
        issues.push({
          code: 'DUPLICATE_OBJECT',
          severity: 'error',
          message: `Duplicate object ID "${id}" detected — ghost geometry risk.`,
          layerId: pkg.layerId,
        });
      }
      seen.add(id);
    }
  }

  return issues;
}

function detectShellBleedThrough(
  graph: SceneGraph,
  packages: SceneComponentPackage[],
  shellLock: ShellLockState
): RenderValidationIssue[] {
  const issues: RenderValidationIssue[] = [];
  if (!shellLock.locked || !shellLock.shellUrl) return issues;

  for (const node of graph.nodes) {
    if (node.layerId === 'environment-shell') continue;
    if (node.qualityIssues.some((i) => i.includes('re-encoded shell'))) {
      issues.push({
        code: 'SHELL_BLEED_THROUGH',
        severity: 'error',
        message: `${node.layerId} re-encoded shell pixels — architecture must remain immutable.`,
        layerId: node.layerId,
      });
    }
    const metrics = node.qualityIssues.join(' ');
    if (metrics.includes('full-scene rerender')) {
      issues.push({
        code: 'FULL_SCENE_RERENDER',
        severity: 'error',
        message: `${node.layerId} appears to be a full-scene rerender instead of isolated component mount.`,
        layerId: node.layerId,
      });
    }
  }

  for (const pkg of packages) {
    if (pkg.mountType === 'structural' && pkg.temporaryImageRef === shellLock.shellUrl) {
      issues.push({
        code: 'SHELL_REFERENCE_AS_COMPOSITE',
        severity: 'error',
        message: `${pkg.layerId} uses shell image as composite source — reference only.`,
        layerId: pkg.layerId,
      });
    }
  }

  return issues;
}

function detectTransparencyConflicts(nodes: SceneGraphNode[]): RenderValidationIssue[] {
  const issues: RenderValidationIssue[] = [];
  const structuralWithBlend = nodes.filter(
    (n) =>
      n.mountType === 'structural' &&
      n.blendMode !== 'normal' &&
      Boolean(n.sourceImageUrl)
  );

  for (const node of structuralWithBlend) {
    issues.push({
      code: 'TRANSPARENCY_CONFLICT',
      severity: 'error',
      message: `Structural layer ${node.layerId} uses blend mode "${node.blendMode}" — causes ghosting.`,
      layerId: node.layerId,
    });
  }

  return issues;
}

function detectReflectionDuplication(packages: SceneComponentPackage[]): RenderValidationIssue[] {
  const groups = new Map<string, number>();
  for (const pkg of packages) {
    groups.set(pkg.reflectionGroup, (groups.get(pkg.reflectionGroup) ?? 0) + 1);
  }

  const issues: RenderValidationIssue[] = [];
  for (const [group, count] of groups) {
    if (count > 2 && group.includes('reflections')) {
      issues.push({
        code: 'REFLECTION_DUPLICATION',
        severity: 'warning',
        message: `Reflection group "${group}" mounted ${count} times — verify no duplicate reflections.`,
      });
    }
  }
  return issues;
}

function detectAnchorViolations(packages: SceneComponentPackage[]): RenderValidationIssue[] {
  const issues: RenderValidationIssue[] = [];
  for (const pkg of packages) {
    for (const p of pkg.placements) {
      if (p.depth < 0 || p.depth > 1) {
        issues.push({
          code: 'DEPTH_INCONSISTENCY',
          severity: 'error',
          message: `Component ${p.componentId} depth ${p.depth} outside valid range.`,
          layerId: pkg.layerId,
        });
      }
      if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) {
        issues.push({
          code: 'ANCHOR_VIOLATION',
          severity: 'warning',
          message: `Component ${p.componentId} placement outside normalized bounds.`,
          layerId: pkg.layerId,
        });
      }
    }
  }
  return issues;
}

export function validateCompiledScene(input: {
  graph: SceneGraph;
  packages: SceneComponentPackage[];
  shellLock: ShellLockState;
}): RenderValidationResult {
  const issues: RenderValidationIssue[] = [
    ...detectDuplicateComponents(input.packages),
    ...detectShellBleedThrough(input.graph, input.packages, input.shellLock),
    ...detectTransparencyConflicts(input.graph.nodes),
    ...detectReflectionDuplication(input.packages),
    ...detectAnchorViolations(input.packages),
  ];

  const errors = issues.filter((i) => i.severity === 'error');
  const passed = errors.length === 0;
  const penalty = errors.length * 18 + issues.filter((i) => i.severity === 'warning').length * 6;
  const sceneIntegrityPct = Math.max(0, Math.min(100, 100 - penalty));

  return {
    passed,
    sceneIntegrityPct,
    issues,
  };
}
