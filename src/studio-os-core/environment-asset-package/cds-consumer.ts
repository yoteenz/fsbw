import { getEnvironmentPackage } from './EnvironmentPackageRepository';
import { resolveActiveEnvironmentUrl } from './EnvironmentPackageService';
import { resolveOutputUrl } from './EnvironmentPackageOutputs';

/** Creative Director Studio consumes Environment Package IDs — never loose image URLs. */
export type CdsEnvironmentPackageBinding = {
  packageId: string;
  variantId: string;
  sceneStackLayer: 'environment-shell';
  referenceOnly: true;
};

export function resolveCdsEnvironmentBinding(ref: {
  packageId: string;
}): CdsEnvironmentPackageBinding | null {
  const pkg = getEnvironmentPackage(ref.packageId);
  if (!pkg) return null;
  return {
    packageId: pkg.packageId,
    variantId: pkg.variantId,
    sceneStackLayer: 'environment-shell',
    referenceOnly: true,
  };
}

export function resolveCdsEnvironmentPlateUrl(ref: {
  packageId: string;
  outputKey?: 'desktop' | 'mobile' | 'heroLandscape';
}): string | null {
  const pkg = getEnvironmentPackage(ref.packageId);
  if (!pkg) return null;
  if (ref.outputKey === 'heroLandscape') {
    return resolveOutputUrl(pkg.outputs, 'heroLandscape');
  }
  const preferMobile = ref.outputKey === 'mobile';
  return resolveActiveEnvironmentUrl(pkg, preferMobile);
}
