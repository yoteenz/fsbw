import { BUNDLED_DEPARTMENT_PACKAGES } from './bundled-packages';
import {
  ensureDepartmentPackageRegistry,
  getDepartmentPackageRegistry,
} from './department-package-registry';
import { validateDepartmentPackageRegistry } from './registry-validation';

const REGISTRATION_SOURCE = 'bundled-packages:createDepartmentPackageRegistry';

let bootstrapped = false;

/** Initialize the canonical Department Package Registry exactly once. */
export function ensureDepartmentPackageRegistryInitialized() {
  if (bootstrapped) {
    return getDepartmentPackageRegistry();
  }

  const registry = ensureDepartmentPackageRegistry(BUNDLED_DEPARTMENT_PACKAGES, REGISTRATION_SOURCE);
  validateDepartmentPackageRegistry(registry);
  bootstrapped = true;
  return registry;
}

/** Whether boot-time initialization completed successfully. */
export function isDepartmentPackageRegistryReady(): boolean {
  return bootstrapped;
}

/** Test-only — re-run initialization after reset. */
export function resetDepartmentPackageRegistryBootstrapForTest(): void {
  bootstrapped = false;
}
