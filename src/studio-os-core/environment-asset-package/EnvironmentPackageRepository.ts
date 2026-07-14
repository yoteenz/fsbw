import type { EnvironmentAssetPackage, EnvironmentVariantId } from './EnvironmentAssetPackage';
import { ensureProductionReadinessForPackage } from './ProductionReadinessService';
import { isEnvironmentPackageInMemoryOnly } from './environment-package-feature-flags';

/** In-memory persistence — tests only. Production uses Supabase via API routes. */
const PACKAGE_BY_ID = new Map<string, EnvironmentAssetPackage>();
const PACKAGE_BY_VARIANT = new Map<string, EnvironmentAssetPackage>();

export function assertProductionPersistenceMode(): void {
  if (!isEnvironmentPackageInMemoryOnly()) {
    throw new Error('PACKAGE_NOT_PERSISTED: In-memory repository is not allowed in production.');
  }
}

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
  if (!defaultRepository) {
    if (!isEnvironmentPackageInMemoryOnly() && typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
      throw new Error('PACKAGE_NOT_PERSISTED: Durable persistence required in production.');
    }
    defaultRepository = new EnvironmentPackageRepository();
  }
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
