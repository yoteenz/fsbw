import type { DesignVariantId, DesignVariantRecord } from './experience-lab-design-variants';
import { DESIGN_VARIANT_IDS } from './experience-lab-design-variants';
import {
  buildVariantPackageId,
  type EnvironmentAssetPackage,
  type EnvironmentVariantId,
} from '../../../studio-os-core/environment-asset-package';

export const EXPERIENCE_LAB_ENVIRONMENT_ID = 'reception';
export const EXPERIENCE_LAB_DEPARTMENT_ID = 'experience-lab' as const;

/** Automatic migration — every design variant receives a canonical environmentPackageId. */
export function migrateDesignVariantPackageId(variant: {
  id: DesignVariantId;
  promptRevision: number;
}): string {
  return buildVariantPackageId({
    departmentId: EXPERIENCE_LAB_DEPARTMENT_ID,
    environmentId: EXPERIENCE_LAB_ENVIRONMENT_ID,
    variantId: variant.id,
    revision: variant.promptRevision,
  });
}

export function migrateDesignVariantsWithPackageIds<
  T extends { id: DesignVariantId; promptRevision: number; environmentPackageId?: string },
>(variants: T[]): (T & { environmentPackageId: string })[] {
  return variants.map((variant) => ({
    ...variant,
    environmentPackageId:
      variant.environmentPackageId && variant.environmentPackageId.length > 0
        ? variant.environmentPackageId
        : migrateDesignVariantPackageId(variant),
  }));
}

export function assertAllVariantsOwnPackages(variants: DesignVariantRecord[]): boolean {
  return variants.every(
    (v) => Boolean(v.environmentPackageId?.length) && DESIGN_VARIANT_IDS.includes(v.id)
  );
}

export function resolveVariantPackageId(variantId: DesignVariantId): string {
  return buildVariantPackageId({
    departmentId: EXPERIENCE_LAB_DEPARTMENT_ID,
    environmentId: EXPERIENCE_LAB_ENVIRONMENT_ID,
    variantId,
    revision: 1,
  });
}

export type DesignVariantPackageIndex = Record<DesignVariantId, EnvironmentAssetPackage | null>;

export function indexPackagesByVariantId(
  packages: EnvironmentAssetPackage[]
): Partial<Record<EnvironmentVariantId, EnvironmentAssetPackage>> {
  const index: Partial<Record<EnvironmentVariantId, EnvironmentAssetPackage>> = {};
  for (const pkg of packages) {
    index[pkg.variantId] = pkg;
  }
  return index;
}
