import { emitStudioOsRuntimeEvent } from '../../studio-os/diagnostics/runtime-emit';

const lookupEmitted = new Set<string>();

function currentRoute(): string {
  if (typeof window === 'undefined') return 'ssr';
  return window.location.pathname;
}

function callerHint(): string {
  try {
    const stack = new Error().stack ?? '';
    const line = stack.split('\n')[3]?.trim() ?? 'unknown';
    return line.slice(0, 160);
  } catch {
    return 'unknown';
  }
}

export function emitRegistryInitialized(detail: Record<string, unknown>): void {
  emitStudioOsRuntimeEvent('DEPARTMENT_PACKAGE_REGISTRY_INITIALIZED', 'department-package-registry', detail);
}

export function emitPackageRegistered(detail: Record<string, unknown>): void {
  emitStudioOsRuntimeEvent('DEPARTMENT_PACKAGE_REGISTERED', 'department-package-registry', detail);
}

export function emitLookupStarted(departmentId: string, detail: Record<string, unknown>): void {
  const key = `start:${departmentId}`;
  if (lookupEmitted.has(key)) return;
  lookupEmitted.add(key);
  emitStudioOsRuntimeEvent('DEPARTMENT_PACKAGE_LOOKUP_STARTED', 'department-package-registry', {
    departmentId,
    caller: callerHint(),
    route: currentRoute(),
    ...detail,
  });
}

export function emitLookupResolved(departmentId: string, detail: Record<string, unknown>): void {
  const key = `resolved:${departmentId}`;
  if (lookupEmitted.has(key)) return;
  lookupEmitted.add(key);
  emitStudioOsRuntimeEvent('DEPARTMENT_PACKAGE_LOOKUP_RESOLVED', 'department-package-registry', {
    departmentId,
    caller: callerHint(),
    route: currentRoute(),
    ...detail,
  });
}

export function emitLookupFailed(departmentId: string, detail: Record<string, unknown>): void {
  emitStudioOsRuntimeEvent('DEPARTMENT_PACKAGE_LOOKUP_FAILED', 'department-package-registry', {
    departmentId,
    caller: callerHint(),
    route: currentRoute(),
    ...detail,
  });
}

export function emitValidationFailed(detail: Record<string, unknown>): void {
  emitStudioOsRuntimeEvent('DEPARTMENT_PACKAGE_VALIDATION_FAILED', 'department-package-registry', detail);
}

export function publishDevRegistryDiagnostics(diagnostics: Record<string, unknown>): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  const win = window as unknown as { __STUDIO_OS_DEPARTMENT_PACKAGE_REGISTRY__?: Record<string, unknown> };
  win.__STUDIO_OS_DEPARTMENT_PACKAGE_REGISTRY__ = diagnostics;
}

/** Reset lookup dedupe — test-only. */
export function resetLookupDiagnosticsForTest(): void {
  lookupEmitted.clear();
}
