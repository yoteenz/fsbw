import { CREATIVE_PREVIEW_RENDER_BINDINGS } from '../creative-studio-preview/render-bindings';
import { listSceneStackDepartmentIds, requireSceneStackManifest } from '../scene-stack/station-manifest';
import type { DepartmentPackageRegistry } from './department-package-registry';
import { DepartmentPackageValidationError } from './registry-errors';
import { emitValidationFailed } from './registry-diagnostics';

function collectRenderBindingDepartmentIds(): string[] {
  return Array.from(
    new Set(
      Object.values(CREATIVE_PREVIEW_RENDER_BINDINGS).flatMap((concepts) =>
        Object.values(concepts).map((b) => b.departmentId)
      )
    )
  ).sort();
}

/**
 * Validates Department Package Registry against Scene Stack manifests and Experience Lab render bindings.
 * Genesis Department DNA Registry is a separate domain — packages carry departmentDnaRef for bridge only.
 */
export function validateDepartmentPackageRegistry(registry: DepartmentPackageRegistry): void {
  const failures: string[] = [];
  const registered = registry.listRegisteredDepartmentIds();

  for (const departmentId of listSceneStackDepartmentIds()) {
    const pkg = registry.loadDepartmentPackage(departmentId);
    if (!pkg) {
      failures.push(`Scene Stack manifest references unregistered department: ${departmentId}`);
      continue;
    }

    const manifest = requireSceneStackManifest(departmentId);
    if (manifest.packageId !== pkg.packageId) {
      failures.push(
        `Scene Stack packageId mismatch for ${departmentId}: manifest=${manifest.packageId}, package=${pkg.packageId}`
      );
    }
  }

  for (const departmentId of collectRenderBindingDepartmentIds()) {
    if (!registry.loadDepartmentPackage(departmentId)) {
      failures.push(`Experience Lab render binding references unregistered department: ${departmentId}`);
    }
  }

  for (const departmentId of registered) {
    const pkg = registry.requireDepartmentPackage(departmentId);
    const dnaRef = (pkg.definition as { departmentDnaRef?: string }).departmentDnaRef;
    if (!dnaRef) {
      failures.push(`Package ${departmentId} missing departmentDnaRef (Genesis DNA bridge)`);
    }
  }

  if (failures.length > 0) {
    emitValidationFailed({
      registryInstanceId: registry.getSnapshot().instanceId,
      failures,
      registeredDepartmentIds: registered,
      timestamp: new Date().toISOString(),
    });
    throw new DepartmentPackageValidationError(failures, registry.getSnapshot().instanceId);
  }
}

export function collectExperienceLabMode2DepartmentIds(): string[] {
  return collectRenderBindingDepartmentIds();
}
