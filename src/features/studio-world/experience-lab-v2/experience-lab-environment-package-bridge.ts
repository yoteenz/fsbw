import {
  ensureVariantEnvironmentPackage,
  resolveActiveEnvironmentUrl,
  buildPackageDrawerModel,
  getPackageByIdOrVariant,
  type EnvironmentAssetPackage,
  type EnvironmentPackageDrawerModel,
} from '../../../studio-os-core/environment-asset-package';
import {
  EXPERIENCE_LAB_DESIGN_VARIANTS,
  type DesignVariantId,
  type DesignVariantRecord,
} from './experience-lab-design-variants';
import {
  EXPERIENCE_LAB_DEPARTMENT_ID,
  EXPERIENCE_LAB_ENVIRONMENT_ID,
  resolveVariantPackageId,
} from './experience-lab-design-variant-package-migration';
import experienceLabV2ViewportEnvironmentUrl from '../../../assets/studio-world/experience-lab/experience-lab-v2-viewport-environment.png';
import experienceLabV2ViewportEnvironmentDesktopUrl from '../../../assets/studio-world/experience-lab/experience-lab-v2-viewport-environment-desktop.png';

const LIGHT_PREVIEW = experienceLabV2ViewportEnvironmentUrl;
const DARK_PREVIEW = experienceLabV2ViewportEnvironmentDesktopUrl;

let bootstrapped = false;

function previewUrlsForVariant(variant: DesignVariantRecord) {
  const isLight = variant.theme === 'light';
  return {
    previewUrl: isLight ? LIGHT_PREVIEW : DARK_PREVIEW,
    desktopPreviewUrl: isLight ? null : DARK_PREVIEW,
  };
}

/** Bootstrap one package per design variant (idempotent). */
export function ensureExperienceLabVariantPackages(): EnvironmentAssetPackage[] {
  if (bootstrapped) {
    return EXPERIENCE_LAB_DESIGN_VARIANTS.map((v) =>
      getPackageByIdOrVariant(
        v.environmentPackageId,
        EXPERIENCE_LAB_DEPARTMENT_ID,
        EXPERIENCE_LAB_ENVIRONMENT_ID,
        v.id
      )!
    ).filter(Boolean);
  }
  bootstrapped = true;

  return EXPERIENCE_LAB_DESIGN_VARIANTS.map((variant) => {
    const urls = previewUrlsForVariant(variant);
    return ensureVariantEnvironmentPackage({
      departmentId: EXPERIENCE_LAB_DEPARTMENT_ID,
      environmentId: EXPERIENCE_LAB_ENVIRONMENT_ID,
      variantId: variant.id,
      variantName: variant.name,
      theme: variant.theme,
      promptHash: variant.promptHash,
      promptVersion: variant.promptHash,
      seed: variant.seed,
      estimatedCostUsd: variant.estimatedCostUsd,
      previewUrl: urls.previewUrl,
      desktopPreviewUrl: urls.desktopPreviewUrl,
      status: variant.cardStatus === 'generating' ? 'generating' : 'review',
      canonical: variant.canonicalStatus === 'canonical' || variant.cardStatus === 'active',
    });
  });
}

export function getDesignVariantPackage(variantId: DesignVariantId): EnvironmentAssetPackage | null {
  ensureExperienceLabVariantPackages();
  const variant = EXPERIENCE_LAB_DESIGN_VARIANTS.find((v) => v.id === variantId);
  if (!variant) return null;
  return getPackageByIdOrVariant(
    variant.environmentPackageId,
    EXPERIENCE_LAB_DEPARTMENT_ID,
    EXPERIENCE_LAB_ENVIRONMENT_ID,
    variantId
  );
}

export function resolveDesignVariantEnvironmentFromPackage(
  variantId: DesignVariantId,
  isMobile: boolean
): string | null {
  const pkg = getDesignVariantPackage(variantId);
  if (!pkg) return null;
  return resolveActiveEnvironmentUrl(pkg, isMobile);
}

export function resolveDesignVariantPackageDrawer(
  variantId: DesignVariantId
): EnvironmentPackageDrawerModel | null {
  const pkg = getDesignVariantPackage(variantId);
  if (!pkg) return null;
  return buildPackageDrawerModel(pkg);
}

export function resolveDesignVariantPackageId(variantId: DesignVariantId): string {
  const variant = EXPERIENCE_LAB_DESIGN_VARIANTS.find((v) => v.id === variantId);
  return variant?.environmentPackageId ?? resolveVariantPackageId(variantId);
}

/** Active variant package id — use resolveDesignVariantPackageId for specific variants. */
export function resolveActiveVariantPackageId(activeVariantId: DesignVariantId): string {
  return resolveDesignVariantPackageId(activeVariantId);
}

/** @deprecated Use resolveDesignVariantPackageId per variant. */
export const EXPERIENCE_LAB_ENVIRONMENT_PACKAGE_ID = resolveVariantPackageId('light-01');

export function getExperienceLabEnvironmentPackage(): EnvironmentAssetPackage | null {
  return getDesignVariantPackage('light-01');
}

/** @deprecated Use ensureExperienceLabVariantPackages. */
export function ensureExperienceLabEnvironmentPackage(): EnvironmentAssetPackage {
  const packages = ensureExperienceLabVariantPackages();
  return packages[0];
}
