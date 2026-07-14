import type { EnvironmentAssetPackage, EnvironmentVariantId } from './EnvironmentAssetPackage';
import { ensureProductionReadinessForPackage } from './ProductionReadinessService';

/** Canonical in-memory persistence — production storage hooks here later. */
const PACKAGE_BY_ID = new Map<string, EnvironmentAssetPackage>();
const PACKAGE_BY_VARIANT = new Map<string, EnvironmentAssetPackage>();

function variantIndexKey(
  departmentId: string,
  environmentId: string,
  variantId: EnvironmentVariantId
): string {
  return `${departmentId}:${environmentId}:${variantId}`;
}

export class EnvironmentPackageRepository {
  save(pkg: EnvironmentAssetPackage): void {
    PACKAGE_BY_ID.set(pkg.packageId, pkg);
    PACKAGE_BY_VARIANT.set(
      variantIndexKey(pkg.departmentId, pkg.environmentId, pkg.variantId),
      pkg
    );
    ensureProductionReadinessForPackage(pkg);
  }

  getById(packageId: string): EnvironmentAssetPackage | null {
    return PACKAGE_BY_ID.get(packageId) ?? null;
  }

  getByVariant(
    departmentId: string,
    environmentId: string,
    variantId: EnvironmentVariantId
  ): EnvironmentAssetPackage | null {
    return PACKAGE_BY_VARIANT.get(variantIndexKey(departmentId, environmentId, variantId)) ?? null;
  }

  listAll(): EnvironmentAssetPackage[] {
    return [...PACKAGE_BY_ID.values()];
  }

  listByEnvironment(departmentId: string, environmentId: string): EnvironmentAssetPackage[] {
    return this.listAll().filter(
      (p) => p.departmentId === departmentId && p.environmentId === environmentId
    );
  }
}

let defaultRepository: EnvironmentPackageRepository | null = null;

export function getEnvironmentPackageRepository(): EnvironmentPackageRepository {
  if (!defaultRepository) defaultRepository = new EnvironmentPackageRepository();
  return defaultRepository;
}

export function registerEnvironmentPackage(pkg: EnvironmentAssetPackage): void {
  getEnvironmentPackageRepository().save(pkg);
}

export function getEnvironmentPackage(packageId: string): EnvironmentAssetPackage | null {
  return getEnvironmentPackageRepository().getById(packageId);
}

export function getEnvironmentPackageForVariant(
  departmentId: string,
  environmentId: string,
  variantId: EnvironmentVariantId
): EnvironmentAssetPackage | null {
  return getEnvironmentPackageRepository().getByVariant(departmentId, environmentId, variantId);
}

export function listEnvironmentPackages(): EnvironmentAssetPackage[] {
  return getEnvironmentPackageRepository().listAll();
}

/** @deprecated Use per-variant package IDs — kept for migration compatibility. */
export const EXPERIENCE_LAB_RECEPTION_PACKAGE_ID = 'envpkg.experience-lab.reception.r1';

export function resetEnvironmentPackageRepository(): void {
  PACKAGE_BY_ID.clear();
  PACKAGE_BY_VARIANT.clear();
  defaultRepository = null;
}
