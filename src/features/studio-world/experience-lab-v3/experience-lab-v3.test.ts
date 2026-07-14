import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listV3DepartmentsForProgram,
  listV3Programs,
  resolveV3DepartmentLabel,
} from './registry/v3-program-registry';
import {
  resolveV3WorkbenchTools,
  defaultV3WorkbenchTool,
  resolveV3InspectorModeForTool,
} from './registry/v3-workbench-registry';
import {
  V3_CORE_WORKSPACES,
  resolveV3WorkspaceByOffset,
  buildV3DesignVariants,
} from './registry/v3-workspace-registry';
import { createInitialV3State, rebuildV3ContextState } from './store/v3-demo-seed';
import { resolveExperienceLabV3FeatureFlags } from './experience-lab-v3-feature-flags';
import { V3_CORE_WORKSPACE_IDS } from './experience-lab-v3.types';

const V3_DIR = dirname(fileURLToPath(import.meta.url));

function readV3Source(filename: string): string {
  return readFileSync(resolve(V3_DIR, filename), 'utf8');
}

describe('Experience Lab V3 Five-Workspace OS', () => {
  it('defines exactly five core workspaces', () => {
    expect(V3_CORE_WORKSPACE_IDS).toEqual([
      'environment',
      'production',
      'review',
      'assets',
      'intelligence',
    ]);
    expect(V3_CORE_WORKSPACES).toHaveLength(5);
  });

  it('swipes workspace index with wrap-around', () => {
    expect(resolveV3WorkspaceByOffset('environment', 1)).toBe('production');
    expect(resolveV3WorkspaceByOffset('intelligence', 1)).toBe('environment');
    expect(resolveV3WorkspaceByOffset('production', -1)).toBe('environment');
  });

  it('lists two top-level programs', () => {
    const programs = listV3Programs();
    expect(programs.map((p) => p.programId)).toEqual(['studio-world', 'industry-packs']);
  });

  it('loads departments dynamically per program', () => {
    const world = listV3DepartmentsForProgram('studio-world');
    const packs = listV3DepartmentsForProgram('industry-packs');
    expect(world.some((d) => d.id === 'reception')).toBe(true);
    expect(packs.some((d) => d.id === 'dental')).toBe(true);
  });

  it('workbench tools change by workspace', () => {
    const env = resolveV3WorkbenchTools('environment').map((t) => t.id);
    const prod = resolveV3WorkbenchTools('production').map((t) => t.id);
    const review = resolveV3WorkbenchTools('review').map((t) => t.id);
    expect(env).toContain('lighting');
    expect(prod).toContain('retry');
    expect(review).toContain('approve');
    expect(env).not.toEqual(prod);
  });

  it('inspector morphs from workbench tool — single mode only', () => {
    expect(resolveV3InspectorModeForTool('environment', 'lighting')).toBe('lighting');
    expect(resolveV3InspectorModeForTool('environment', 'materials')).toBe('materials');
    expect(resolveV3InspectorModeForTool('production', 'dependencies')).toBe('dependencies');
    expect(resolveV3InspectorModeForTool('environment', null)).toBeNull();
  });

  it('seeds package-driven demo state with six design variants', () => {
    const state = createInitialV3State();
    expect(state.designVariants).toHaveLength(6);
    expect(state.activePackage).toBeTruthy();
    expect(state.workOrders.length).toBeGreaterThan(0);
    expect(state.activeWorkspace).toBe('environment');
  });

  it('rebuilds context on department change without losing workspace', () => {
    const initial = createInitialV3State();
    const next = rebuildV3ContextState(initial, { departmentId: 'marketplace' });
    expect(next.activeWorkspace).toBe('environment');
    expect(next.workspace.departmentId).toBe('marketplace');
    expect(resolveV3DepartmentLabel('studio-world', 'marketplace')).toBe('Marketplace');
  });

  it('shell composes persistent shell regions', () => {
    const shell = readV3Source('ExperienceLabV3Shell.tsx');
    expect(shell).toContain('V3WorkspaceStage');
    expect(shell).toContain('V3DesignVariantStrip');
    expect(shell).toContain('V3ContextAwareWorkbench');
    expect(shell).toContain('V3CommandDock');
    const stage = readV3Source('viewport/V3WorkspaceStage.tsx');
    expect(stage).toContain('V3BlueprintPanel');
    expect(stage).toContain('V3ContextInspector');
    const inspectorMatches = stage.match(/<V3ContextInspector/g) ?? [];
    expect(inspectorMatches.length).toBe(1);
  });

  it('viewport stage mounts five workspace panels', () => {
    const stage = readV3Source('viewport/V3WorkspaceStage.tsx');
    expect(stage).toContain('V3EnvironmentWorkspace');
    expect(stage).toContain('V3ProductionWorkspace');
    expect(stage).toContain('V3ReviewWorkspace');
    expect(stage).toContain('V3AssetsWorkspace');
    expect(stage).toContain('V3IntelligenceWorkspace');
  });

  it('V3 does not import from experience-lab-v2', () => {
    const files = [
      'ExperienceLabV3Shell.tsx',
      'store/ExperienceLabV3Store.tsx',
      'viewport/V3WorkspaceStage.tsx',
      'shell/V3CommandDock.tsx',
    ];
    for (const f of files) {
      const src = readV3Source(f);
      expect(src).not.toContain('experience-lab-v2');
    }
  });

  it('feature flags gate V3 independently from V2', () => {
    const flags = resolveExperienceLabV3FeatureFlags();
    expect(flags).toHaveProperty('experienceLabV3Enabled');
  });

  it('default workbench tool resolves per workspace', () => {
    expect(defaultV3WorkbenchTool('environment')).toBe('blueprint');
    expect(defaultV3WorkbenchTool('production')).toBe('pause');
    expect(defaultV3WorkbenchTool('review')).toBe('approve');
  });

  it('design variants build per department context', () => {
    const variants = buildV3DesignVariants('reception', 12);
    expect(variants).toHaveLength(6);
    expect(variants[0]?.environmentPackageId).toContain('reception');
  });

  it('V3 page uses scrollable golden build shell (not fixedViewport)', () => {
    const page = readFileSync(
      resolve(V3_DIR, '../../../pages/admin/studio/experience-lab-v3/page.tsx'),
      'utf8'
    );
    expect(page).not.toContain('fixedViewport');
  });
});
