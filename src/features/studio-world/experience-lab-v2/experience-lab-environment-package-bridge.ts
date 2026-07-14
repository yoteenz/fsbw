import {
  EXPERIENCE_LAB_RECEPTION_PACKAGE_ID,
  ensureDefaultEnvironmentPackages,
  getEnvironmentPackage,
  buildPackageDrawerModel,
  resolveViewportEnvironmentFromPackage,
  type EnvironmentAssetPackage,
  type EnvironmentPackageDrawerModel,
} from '../../../studio-os-core/environment-asset-package';
import type { DesignVariantId } from './experience-lab-design-variants';
import experienceLabV2ViewportEnvironmentUrl from '../../../assets/studio-world/experience-lab/experience-lab-v2-viewport-environment.png';
import experienceLabV2ViewportEnvironmentDesktopUrl from '../../../assets/studio-world/experience-lab/experience-lab-v2-viewport-environment-desktop.png';

export const EXPERIENCE_LAB_ENVIRONMENT_PACKAGE_ID = EXPERIENCE_LAB_RECEPTION_PACKAGE_ID;

let bootstrapped = false;

/** Bootstrap canonical reception package (idempotent). Architecture-only — no UI changes. */
export function ensureExperienceLabEnvironmentPackage(): EnvironmentAssetPackage {
  if (!bootstrapped) {
    bootstrapped = true;
    return ensureDefaultEnvironmentPackages({
      lightPreviewUrl: experienceLabV2ViewportEnvironmentUrl,
      darkPreviewUrl: experienceLabV2ViewportEnvironmentDesktopUrl,
    });
  }
  return ensureDefaultEnvironmentPackages({
    lightPreviewUrl: experienceLabV2ViewportEnvironmentUrl,
    darkPreviewUrl: experienceLabV2ViewportEnvironmentDesktopUrl,
  });
}

export function getExperienceLabEnvironmentPackage(): EnvironmentAssetPackage | null {
  ensureExperienceLabEnvironmentPackage();
  return getEnvironmentPackage(EXPERIENCE_LAB_ENVIRONMENT_PACKAGE_ID);
}

export function resolveDesignVariantEnvironmentFromPackage(
  variantId: DesignVariantId,
  isMobile: boolean
): string | null {
  const pkg = getExperienceLabEnvironmentPackage();
  if (!pkg) return null;
  return resolveViewportEnvironmentFromPackage(pkg, variantId, isMobile);
}

export function resolveDesignVariantPackageDrawer(
  variantId: DesignVariantId
): EnvironmentPackageDrawerModel | null {
  const pkg = getExperienceLabEnvironmentPackage();
  if (!pkg) return null;
  return buildPackageDrawerModel(pkg, variantId);
}
