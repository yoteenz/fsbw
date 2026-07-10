import { describe, expect, it, beforeEach } from 'vitest';
import { BUNDLED_DEPARTMENT_PACKAGES } from './bundled-packages';
import { DepartmentPackageRegistry, resetDepartmentPackageRegistryForTest } from './department-package-registry';
import {
  ensureDepartmentPackageRegistryInitialized,
  isDepartmentPackageRegistryReady,
  resetDepartmentPackageRegistryBootstrapForTest,
} from './initialize';
import {
  DepartmentPackageNotRegisteredError,
  DuplicateDepartmentPackageError,
} from './registry-errors';
import { resetLookupDiagnosticsForTest } from './registry-diagnostics';
import {
  collectExperienceLabMode2DepartmentIds,
  validateDepartmentPackageRegistry,
} from './registry-validation';
import {
  listRegisteredDepartmentIds,
  loadDepartmentPackage,
  requireDepartmentPackage,
} from './registry';
import { listSceneStackDepartmentIds } from '../scene-stack/station-manifest';

describe('Department Package Registry', () => {
  beforeEach(() => {
    resetDepartmentPackageRegistryForTest();
    resetDepartmentPackageRegistryBootstrapForTest();
    resetLookupDiagnosticsForTest();
  });

  it('registers studio-world-atlas in bundled manifest', () => {
    const atlas = BUNDLED_DEPARTMENT_PACKAGES.find((p) => p.departmentId === 'studio-world-atlas');
    expect(atlas).toBeDefined();
    expect(atlas?.packageId).toBe('pkg-studio-world-atlas-golden-v1');
    expect(atlas?.definition.spatial.heroObjectId).toBe('atlas-landmark');
  });

  it('requireDepartmentPackage("studio-world-atlas") resolves after initialization', () => {
    ensureDepartmentPackageRegistryInitialized();
    const pkg = requireDepartmentPackage('studio-world-atlas');
    expect(pkg.departmentId).toBe('studio-world-atlas');
    expect(pkg.packageId).toBe('pkg-studio-world-atlas-golden-v1');
  });

  it('throws structured error for unknown department ID', () => {
    ensureDepartmentPackageRegistryInitialized();
    try {
      requireDepartmentPackage('unknown-department');
      expect.unreachable('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(DepartmentPackageNotRegisteredError);
      const typed = err as DepartmentPackageNotRegisteredError;
      expect(typed.departmentId).toBe('unknown-department');
      expect(typed.availableDepartmentIds).toContain('studio-world-atlas');
      expect(typed.availableDepartmentIds).toContain('creative-direction');
      expect(typed.registryInstanceId).toMatch(/^dpr-/);
    }
  });

  it('validates Scene Stack bindings resolve to registered packages', () => {
    const registry = DepartmentPackageRegistry.create(BUNDLED_DEPARTMENT_PACKAGES, 'test');
    expect(() => validateDepartmentPackageRegistry(registry)).not.toThrow();
    for (const departmentId of listSceneStackDepartmentIds()) {
      expect(registry.loadDepartmentPackage(departmentId)).not.toBeNull();
    }
  });

  it('rejects duplicate department registration', () => {
    const duplicate = BUNDLED_DEPARTMENT_PACKAGES[0];
    expect(() =>
      DepartmentPackageRegistry.create([duplicate, duplicate], 'duplicate-test')
    ).toThrow(DuplicateDepartmentPackageError);
  });

  it('returns deterministic sorted manifest across lookups', () => {
    ensureDepartmentPackageRegistryInitialized();
    const first = listRegisteredDepartmentIds();
    const second = listRegisteredDepartmentIds();
    expect(first).toEqual(second);
    expect(first).toEqual([
      'creative-direction',
      'studio-command-center',
      'studio-warehouse',
      'studio-world-atlas',
    ]);
  });

  it('uses one canonical registry instance per runtime', () => {
    const a = ensureDepartmentPackageRegistryInitialized();
    const b = ensureDepartmentPackageRegistryInitialized();
    expect(a.instanceId).toBe(b.instanceId);
    expect(isDepartmentPackageRegistryReady()).toBe(true);
  });

  it('resolves all Experience Lab Mode 2 render-binding departments', () => {
    ensureDepartmentPackageRegistryInitialized();
    for (const departmentId of collectExperienceLabMode2DepartmentIds()) {
      expect(loadDepartmentPackage(departmentId)).not.toBeNull();
    }
    expect(requireDepartmentPackage('studio-world-atlas').definition.displayName).toContain('Atlas');
  });

  it('aligns Scene Stack studio-world-atlas manifest packageId with registered package', () => {
    ensureDepartmentPackageRegistryInitialized();
    const pkg = requireDepartmentPackage('studio-world-atlas');
    expect(pkg.packageId).toBe('pkg-studio-world-atlas-golden-v1');
  });
});
