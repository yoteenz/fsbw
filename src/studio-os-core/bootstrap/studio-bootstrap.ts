import { registerAllStudioBootModules } from './register-boot-modules';
import {
  runStudioKernelBoot,
  startStudioKernelBoot,
  getStudioBootReport,
  getStudioBootLiveState,
  getInitialBootLiveState,
  resetStudioKernelBoot,
  isStudioKernelBootInProgress,
  appendStudioBootDiagnosticsEvent,
  STUDIO_BOOT_ORDER,
  STUDIO_BOOT_EVENT,
  BOOT_MODULE_TIMEOUT_MS,
  type StudioBootPhase,
  type StudioBootReport,
  type StudioBootLiveState,
  type StudioKernelBootOptions,
} from '../kernel';

let modulesRegistered = false;

function ensureBootModulesRegistered(): void {
  if (modulesRegistered) return;
  registerAllStudioBootModules();
  modulesRegistered = true;
}

/** StudioBootstrap™ — public entry for deterministic Studio OS startup. */
export async function runStudioBootstrap(options?: StudioKernelBootOptions & {
  through?: StudioBootPhase;
}): Promise<StudioBootReport> {
  ensureBootModulesRegistered();
  return runStudioKernelBoot(options);
}

/** Explicit start — primes elapsed timer and dispatches before first module runs. */
export function startStudioBootstrap(options?: StudioKernelBootOptions & {
  through?: StudioBootPhase;
}): Promise<StudioBootReport> {
  ensureBootModulesRegistered();
  return startStudioKernelBoot(options);
}

export const StudioBootstrap = {
  start: startStudioBootstrap,
  run: runStudioBootstrap,
  reset: resetStudioBootstrap,
  getLiveState: getStudioBootstrapLiveState,
  isInProgress: isStudioKernelBootInProgress,
  log: appendStudioBootDiagnosticsEvent,
};

export function getStudioBootstrapReport(): StudioBootReport | null {
  return getStudioBootReport();
}

export function getStudioBootstrapLiveState(): StudioBootLiveState | null {
  return getStudioBootLiveState();
}

export function getInitialStudioBootstrapLiveState(): StudioBootLiveState {
  ensureBootModulesRegistered();
  return getInitialBootLiveState(STUDIO_BOOT_ORDER);
}

export function resetStudioBootstrap(): void {
  resetStudioKernelBoot();
}

export function isStudioBootstrapInProgress(): boolean {
  return isStudioKernelBootInProgress();
}

export function appendStudioBootstrapEvent(message: string): void {
  appendStudioBootDiagnosticsEvent(message);
}

export {
  STUDIO_BOOT_ORDER,
  STUDIO_BOOT_EVENT,
  BOOT_MODULE_TIMEOUT_MS,
  type StudioBootPhase,
  type StudioBootReport,
  type StudioBootLiveState,
  type StudioKernelBootOptions,
};

export { STUDIO_DEFAULT_FALLBACK_CONTRACT } from './default-fallback-contract';
