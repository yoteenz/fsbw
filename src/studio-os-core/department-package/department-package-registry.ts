import type { DepartmentPackage } from './types';
import {
  DepartmentPackageNotRegisteredError,
  DuplicateDepartmentPackageError,
  DuplicatePackageIdError,
} from './registry-errors';
import {
  emitLookupFailed,
  emitLookupResolved,
  emitLookupStarted,
  emitPackageRegistered,
  emitRegistryInitialized,
  publishDevRegistryDiagnostics,
} from './registry-diagnostics';

let instanceCounter = 0;

export type DepartmentPackageRegistrySnapshot = {
  instanceId: string;
  initializedAt: string;
  registrationSource: string;
  registeredDepartmentIds: readonly string[];
  registeredPackageIds: readonly string[];
  moduleIdentity: string;
};

export class DepartmentPackageRegistry {
  readonly instanceId: string;
  readonly initializedAt: string;
  readonly registrationSource: string;

  private readonly byDepartmentId = new Map<string, DepartmentPackage>();
  private readonly byPackageId = new Map<string, string>();
  private initialized = false;

  private constructor(instanceId: string, initializedAt: string, registrationSource: string) {
    this.instanceId = instanceId;
    this.initializedAt = initializedAt;
    this.registrationSource = registrationSource;
  }

  static create(packages: readonly DepartmentPackage[], registrationSource: string): DepartmentPackageRegistry {
    instanceCounter += 1;
    const instanceId = `dpr-${instanceCounter}-${Date.now().toString(36)}`;
    const registry = new DepartmentPackageRegistry(instanceId, new Date().toISOString(), registrationSource);

    for (const pkg of packages) {
      registry.registerOne(pkg);
    }

    registry.initialized = true;
    emitRegistryInitialized(registry.toDiagnosticsDetail());
    publishDevRegistryDiagnostics(registry.toDiagnosticsDetail());

    return registry;
  }

  private registerOne(pkg: DepartmentPackage): void {
    const existing = this.byDepartmentId.get(pkg.departmentId);
    if (existing) {
      throw new DuplicateDepartmentPackageError(
        pkg.departmentId,
        pkg.packageId,
        existing.packageId,
        this.instanceId
      );
    }

    const existingDeptForPackageId = this.byPackageId.get(pkg.packageId);
    if (existingDeptForPackageId) {
      throw new DuplicatePackageIdError(
        pkg.packageId,
        pkg.departmentId,
        existingDeptForPackageId,
        this.instanceId
      );
    }

    this.byDepartmentId.set(pkg.departmentId, pkg);
    this.byPackageId.set(pkg.packageId, pkg.departmentId);

    emitPackageRegistered({
      departmentId: pkg.departmentId,
      packageId: pkg.packageId,
      registryInstanceId: this.instanceId,
      registrationSource: this.registrationSource,
      registeredPackageIds: this.listRegisteredDepartmentIds(),
      timestamp: new Date().toISOString(),
    });
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  listRegisteredDepartmentIds(): string[] {
    return [...this.byDepartmentId.keys()].sort();
  }

  listRegisteredPackageIds(): string[] {
    return [...this.byPackageId.keys()].sort();
  }

  loadDepartmentPackage(departmentId: string): DepartmentPackage | null {
    emitLookupStarted(departmentId, {
      registryInstanceId: this.instanceId,
      registeredPackageIds: this.listRegisteredDepartmentIds(),
    });

    const pkg = this.byDepartmentId.get(departmentId) ?? null;
    if (pkg) {
      emitLookupResolved(departmentId, {
        packageId: pkg.packageId,
        registryInstanceId: this.instanceId,
        registeredPackageIds: this.listRegisteredDepartmentIds(),
      });
    } else {
      emitLookupFailed(departmentId, {
        registryInstanceId: this.instanceId,
        registeredPackageIds: this.listRegisteredDepartmentIds(),
        availableDepartmentIds: this.listRegisteredDepartmentIds(),
      });
    }

    return pkg;
  }

  requireDepartmentPackage(departmentId: string): DepartmentPackage {
    const pkg = this.loadDepartmentPackage(departmentId);
    if (!pkg) {
      throw new DepartmentPackageNotRegisteredError(
        departmentId,
        this.listRegisteredDepartmentIds(),
        this.instanceId
      );
    }
    return pkg;
  }

  getSnapshot(): DepartmentPackageRegistrySnapshot {
    return {
      instanceId: this.instanceId,
      initializedAt: this.initializedAt,
      registrationSource: this.registrationSource,
      registeredDepartmentIds: this.listRegisteredDepartmentIds(),
      registeredPackageIds: this.listRegisteredPackageIds(),
      moduleIdentity: 'studio-os-core/department-package/department-package-registry',
    };
  }

  toDiagnosticsDetail(): Record<string, unknown> {
    return {
      registryInstanceId: this.instanceId,
      initializationTimestamp: this.initializedAt,
      registrationSource: this.registrationSource,
      registeredDepartmentIds: this.listRegisteredDepartmentIds(),
      registeredPackageIds: this.listRegisteredPackageIds(),
      moduleIdentity: 'studio-os-core/department-package/department-package-registry',
    };
  }
}

let singleton: DepartmentPackageRegistry | null = null;

export function getDepartmentPackageRegistry(): DepartmentPackageRegistry {
  if (!singleton) {
    throw new Error(
      'Department Package Registry not initialized — call ensureDepartmentPackageRegistryInitialized() at boot'
    );
  }
  return singleton;
}

export function ensureDepartmentPackageRegistry(
  packages: readonly DepartmentPackage[],
  registrationSource: string
): DepartmentPackageRegistry {
  if (singleton) {
    return singleton;
  }
  singleton = DepartmentPackageRegistry.create(packages, registrationSource);
  return singleton;
}

/** Test-only — reset singleton between tests. */
export function resetDepartmentPackageRegistryForTest(): void {
  singleton = null;
}
