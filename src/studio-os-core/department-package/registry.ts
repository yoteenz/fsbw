import { ensureDepartmentPackageRegistryInitialized } from './initialize';
import type { DepartmentPackage } from './types';

function registry() {
  return ensureDepartmentPackageRegistryInitialized();
}

export function listRegisteredDepartmentIds(): string[] {
  return registry().listRegisteredDepartmentIds();
}

export function loadDepartmentPackage(departmentId: string): DepartmentPackage | null {
  return registry().loadDepartmentPackage(departmentId);
}

export function requireDepartmentPackage(departmentId: string): DepartmentPackage {
  return registry().requireDepartmentPackage(departmentId);
}

export { ensureDepartmentPackageRegistryInitialized } from './initialize';
export {
  getDepartmentPackageRegistry,
  type DepartmentPackageRegistrySnapshot,
} from './department-package-registry';
export {
  DepartmentPackageNotRegisteredError,
  DuplicateDepartmentPackageError,
  DuplicatePackageIdError,
  DepartmentPackageValidationError,
} from './registry-errors';
