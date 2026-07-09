import { registerAllStudioBootModules } from './register-boot-modules';
import {
  runStudioKernelBoot,
  getStudioBootReport,
  getStudioBootLiveState,
  getInitialBootLiveState,
  resetStudioKernelBoot,
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
