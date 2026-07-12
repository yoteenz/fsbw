import { BUNDLED_DEPARTMENT_PACKAGES } from './bundled-packages';
import {
  ensureDepartmentPackageRegistry,
  getDepartmentPackageRegistry,
} from './department-package-registry';
import { validateDepartmentPackageRegistry } from './registry-validation';
import { isWorldCompilerDiagnosticMode } from '../../studio-os/diagnostics/world-compiler-investigation/diagnostic-mode';
import {
  recordGspuMicroMarker,
  recordGspuPackageRegistryForensic,
} from '../../studio-os/diagnostics/world-compiler-investigation/generate-shell-package-micro-trace';

const REGISTRATION_SOURCE = 'bundled-packages:createDepartmentPackageRegistry';

let bootstrapped = false;

/** Initialize the canonical Department Package Registry exactly once. */
export function ensureDepartmentPackageRegistryInitialized() {
  const diag = isWorldCompilerDiagnosticMode();
  if (diag) {
    recordGspuPackageRegistryForensic({
      bootReady: bootstrapped,
      registryReady: bootstrapped,
      initializationPromiseState: bootstrapped ? 'settled' : 'pending',
      lockState: bootstrapped ? 'released' : 'bootstrapping',
      lockOwner: 'ensureDepartmentPackageRegistryInitialized',
    });
    recordGspuMicroMarker('GSPU-03d-registry-ready-check', 'running');
  }

  if (bootstrapped) {
    if (diag) {
      const registry = getDepartmentPackageRegistry();
      recordGspuMicroMarker('GSPU-03d-registry-ready-check', 'success', { resultSummary: 'already-bootstrapped' });
      recordGspuPackageRegistryForensic({
        bootReady: true,
        registryReady: true,
        registrySize: registry.listRegisteredDepartmentIds().length,
        matchingRegisteredKeys: registry.listRegisteredDepartmentIds(),
        initSettled: true,
        initializationPromiseState: 'settled',
      });
      recordGspuMicroMarker('GSPU-03c-after-registry-init', 'success', { resultSummary: 'cache-hit' });
    }
    return getDepartmentPackageRegistry();
  }

  const registry = ensureDepartmentPackageRegistry(BUNDLED_DEPARTMENT_PACKAGES, REGISTRATION_SOURCE);
  validateDepartmentPackageRegistry(registry);
  bootstrapped = true;

  if (diag) {
    recordGspuMicroMarker('GSPU-03c-after-registry-init', 'success', {
      resultSummary: `registered=${registry.listRegisteredDepartmentIds().length}`,
    });
    recordGspuMicroMarker('GSPU-03d-registry-ready-check', 'success', { resultSummary: 'bootstrapped' });
    recordGspuPackageRegistryForensic({
      bootReady: true,
      registryReady: true,
      registrySize: registry.listRegisteredDepartmentIds().length,
      matchingRegisteredKeys: registry.listRegisteredDepartmentIds(),
      initSettled: true,
      initializationPromiseState: 'settled',
      lockState: 'released',
    });
  }

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
