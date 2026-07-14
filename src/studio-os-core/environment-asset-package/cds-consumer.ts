import { getEnvironmentPackage } from './EnvironmentPackageRepository';
import { resolveActiveEnvironmentUrl } from './EnvironmentPackageService';
import { resolveOutputUrl } from './EnvironmentPackageOutputs';
import { assertPackageProductionReadyForConsumer } from './ProductionReadinessService';

/** Creative Director Studio consumes Environment Package IDs — never loose image URLs. */
export type CdsEnvironmentPackageBinding = {
  packageId: string;
  variantId: string;
  sceneStackLayer: 'environment-shell';
  referenceOnly: true;
};

export type CdsPackageAccessResult =
  | { ok: true; binding: CdsEnvironmentPackageBinding }
  | { ok: false; code: string; message: string };

export function resolveCdsPackageAccess(ref: { packageId: string }): CdsPackageAccessResult {
  const gate = assertPackageProductionReadyForConsumer(ref.packageId);
  if (!gate.ok) {
    return { ok: false, code: gate.code ?? 'NOT_PRODUCTION_READY', message: gate.message ?? 'Awaiting Production Approval' };
  }
  const pkg = getEnvironmentPackage(ref.packageId);
  if (!pkg) {
    return { ok: false, code: 'PACKAGE_NOT_FOUND', message: 'Package not found' };
  }
  return {
    ok: true,
    binding: {
      packageId: pkg.packageId,
      variantId: pkg.variantId,
      sceneStackLayer: 'environment-shell',
      referenceOnly: true,
    },
  };
}

export function resolveCdsEnvironmentBinding(ref: {
  packageId: string;
}): CdsEnvironmentPackageBinding | null {
  const access = resolveCdsPackageAccess(ref);
  return access.ok ? access.binding : null;
}

export function resolveCdsEnvironmentPlateUrl(ref: {
  packageId: string;
  outputKey?: 'desktop' | 'mobile' | 'heroLandscape';
}): string | null {
  const access = resolveCdsPackageAccess(ref);
  if (!access.ok) return null;
  const pkg = getEnvironmentPackage(ref.packageId);
  if (!pkg) return null;
  if (ref.outputKey === 'heroLandscape') {
    return resolveOutputUrl(pkg.outputs, 'heroLandscape');
  }
  const preferMobile = ref.outputKey === 'mobile';
  return resolveActiveEnvironmentUrl(pkg, preferMobile);
}
