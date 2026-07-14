import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listV3DepartmentsForProgram,
  listV3Programs,
  resolveV3DepartmentLabel,
} from './registry/v3-program-registry';
import { resolveV3WorkbenchTools, defaultV3WorkbenchTool } from './registry/v3-workbench-registry';
import { createInitialV3State, rebuildV3ContextState } from './store/v3-demo-seed';
import { resolveExperienceLabV3FeatureFlags } from './experience-lab-v3-feature-flags';

const V3_DIR = dirname(fileURLToPath(import.meta.url));

function readV3Source(filename: string): string {
  return readFileSync(resolve(V3_DIR, filename), 'utf8');
}

describe('Experience Lab V3 Architecture', () => {
  it('lists two top-level programs', () => {
    const programs = listV3Programs();
    expect(programs.map((p) => p.programId)).toEqual(['studio-world', 'industry-packs']);
  });

  it('loads departments dynamically per program', () => {
    const world = listV3DepartmentsForProgram('studio-world');
    const packs = listV3DepartmentsForProgram('industry-packs');
    expect(world.some((d) => d.id === 'reception')).toBe(true);
    expect(world.some((d) => d.id === 'build-a-wig')).toBe(true);
    expect(packs.some((d) => d.id === 'dental')).toBe(true);
    expect(packs.some((d) => d.id === 'restaurant')).toBe(true);
  });

  it('workbench tools change by department', () => {
    const reception = resolveV3WorkbenchTools('reception').map((t) => t.id);
    const marketplace = resolveV3WorkbenchTools('marketplace').map((t) => t.id);
    const rewards = resolveV3WorkbenchTools('rewards').map((t) => t.id);
    expect(reception).toContain('lighting');
    expect(marketplace).toContain('packaging');
    expect(rewards).toContain('collectibles');
    expect(reception).not.toEqual(marketplace);
  });

  it('seeds work orders with progress, cost, owner, dependencies', () => {
    const state = createInitialV3State();
    expect(state.workOrders.length).toBeGreaterThan(0);
    const wo = state.workOrders[0]!;
    expect(wo.progress).toBeGreaterThanOrEqual(0);
    expect(wo.owner).toBeTruthy();
    expect(wo.costUsd).toBeGreaterThanOrEqual(0);
  });

  it('package view exposes multi-device outputs with desktop as source of truth', () => {
    const state = createInitialV3State();
    const pkg = state.activePackage!;
    const mobile = pkg.outputs.find((o) => o.id === 'mobile');
    const desktop = pkg.outputs.find((o) => o.id === 'desktop');
    expect(desktop?.derivedFrom).toBe('desktop');
    expect(mobile?.derivedFrom).toBe('desktop');
  });

  it('rebuilds context on department change without losing program', () => {
    const initial = createInitialV3State();
    const next = rebuildV3ContextState(initial, { departmentId: 'marketplace' });
    expect(next.workspace.programId).toBe('studio-world');
    expect(next.workspace.departmentId).toBe('marketplace');
    expect(resolveV3DepartmentLabel('studio-world', 'marketplace')).toBe('Marketplace');
  });

  it('pipeline stages derive from work orders', () => {
    const state = createInitialV3State();
    expect(state.pipeline.some((s) => s.status === 'active')).toBe(true);
  });

  it('shell has single blueprint, active work order, and context panels', () => {
    const shell = readV3Source('ExperienceLabV3Shell.tsx');
    expect(shell).toContain('V3BlueprintInspectorPanel');
    expect(shell).toContain('V3ActiveWorkOrderPanel');
    expect(shell).toContain('V3ContextInspectorPanel');
    const renderMatches = shell.match(/<V3ContextInspectorPanel/g) ?? [];
    expect(renderMatches.length).toBe(1);
  });

  it('V3 does not import from experience-lab-v2', () => {
    const files = [
      'ExperienceLabV3Shell.tsx',
      'store/ExperienceLabV3Store.tsx',
      'registry/v3-program-registry.ts',
    ];
    for (const f of files) {
      const src = readV3Source(f);
      expect(src).not.toContain('experience-lab-v2');
    }
  });

  it('feature flags gate V3 independently from V2', () => {
    const flags = resolveExperienceLabV3FeatureFlags();
    expect(flags).toHaveProperty('experienceLabV3Enabled');
    expect(flags).toHaveProperty('worldBuilderAliasEnabled');
  });

  it('default workbench tool resolves per department', () => {
    expect(defaultV3WorkbenchTool('reception')).toBe('lighting');
    expect(defaultV3WorkbenchTool('marketplace')).toBe('packaging');
  });

  it('operations board metrics are seeded', () => {
    const state = createInitialV3State();
    expect(state.operations.todaySpendUsd).toBeGreaterThan(0);
    expect(state.operations.systemHealthPercent).toBeGreaterThan(0);
  });
});
