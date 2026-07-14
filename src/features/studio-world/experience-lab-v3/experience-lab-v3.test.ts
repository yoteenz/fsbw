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
  defaultV3WorkbenchTool,
} from './registry/v3-workbench-registry';
import {
  V3_CORE_WORKSPACES,
  resolveV3WorkspaceByOffset,
} from './registry/v3-workspace-registry';
import { resolveV3WorkspaceForWorkbenchTool } from './registry/v3-workbench-workspace-map';
import { createInitialV3State, rebuildV3ContextState } from './store/v3-demo-seed';
import { resolveExperienceLabV3FeatureFlags } from './experience-lab-v3-feature-flags';
import { V3_CORE_WORKSPACE_IDS } from './experience-lab-v3.types';

const V3_DIR = dirname(fileURLToPath(import.meta.url));

function readV3Source(filename: string): string {
  return readFileSync(resolve(V3_DIR, filename), 'utf8');
}

describe('Experience Lab V3 — V2 shell rebase', () => {
  it('defines exactly five core workspaces including Command', () => {
    expect(V3_CORE_WORKSPACE_IDS).toEqual([
      'environment',
      'production',
      'review',
      'assets',
      'command',
    ]);
    expect(V3_CORE_WORKSPACES).toHaveLength(5);
  });

  it('swipes workspace index with wrap-around', () => {
    expect(resolveV3WorkspaceByOffset('environment', 1)).toBe('production');
    expect(resolveV3WorkspaceByOffset('command', 1)).toBe('environment');
    expect(resolveV3WorkspaceByOffset('production', -1)).toBe('environment');
  });

  it('V3 shell composes V2 command dock and workbench unchanged', () => {
    const shell = readV3Source('ExperienceLabV3Shell.tsx');
    expect(shell).toContain('ExperienceLabCommandDock');
    expect(shell).toContain('ExperienceLabFounderWorkbench');
    expect(shell).toContain('ExperienceLabWorkstationFrame');
    expect(shell).toContain('experience-lab-v2.css');
    expect(shell).not.toContain('V3CommandDock');
    expect(shell).not.toContain('V3ContextAwareWorkbench');
  });

  it('viewport uses horizontal pager not dashboard layout', () => {
    const shell = readV3Source('ExperienceLabV3Shell.tsx');
    expect(shell).toContain('V3WorkspaceViewportPager');
    expect(shell).toContain('ExperienceLabViewportStage');
    const pager = readV3Source('viewport/V3WorkspaceViewportPager.tsx');
    expect(pager).toContain('translate3d');
    expect(pager).toContain('V3WorkspaceSegmentedControl');
  });

  it('Environment workspace renders V2 viewport stage', () => {
    const renderer = readV3Source('viewport/V3WorkspacePaneRenderer.tsx');
    expect(renderer).toContain('environmentPane');
  });

  it('workbench tool maps to workspace context', () => {
    expect(resolveV3WorkspaceForWorkbenchTool('lighting-studio')).toBe('environment');
    expect(resolveV3WorkspaceForWorkbenchTool('workforce-center')).toBe('production');
    expect(resolveV3WorkspaceForWorkbenchTool('budget-forecast')).toBe('command');
  });

  it('lists two top-level programs', () => {
    const programs = listV3Programs();
    expect(programs.map((p) => p.programId)).toEqual(['studio-world', 'industry-packs']);
  });

  it('loads departments dynamically per program', () => {
    const world = listV3DepartmentsForProgram('studio-world');
    expect(world.some((d) => d.id === 'reception')).toBe(true);
  });

  it('seeds package-driven demo state', () => {
    const state = createInitialV3State();
    expect(state.activePackage).toBeTruthy();
    expect(state.activeWorkspace).toBe('environment');
  });

  it('V3 page uses fixedViewport like V2', () => {
    const page = readFileSync(
      resolve(V3_DIR, '../../../pages/admin/studio/experience-lab-v3/page.tsx'),
      'utf8'
    );
    expect(page).toContain('fixedViewport');
  });

  it('default workbench tool resolves per workspace registry', () => {
    expect(defaultV3WorkbenchTool('environment')).toBe('blueprint');
    expect(defaultV3WorkbenchTool('command')).toBe('budget');
  });

  it('feature flags gate V3 independently from V2', () => {
    const flags = resolveExperienceLabV3FeatureFlags();
    expect(flags).toHaveProperty('experienceLabV3Enabled');
  });

  it('rebuilds context on department change', () => {
    const initial = createInitialV3State();
    const next = rebuildV3ContextState(initial, { departmentId: 'marketplace' });
    expect(next.workspace.departmentId).toBe('marketplace');
    expect(resolveV3DepartmentLabel('studio-world', 'marketplace')).toBe('Marketplace');
  });
});
