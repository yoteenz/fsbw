import { registerAllStudioBootModules } from './register-boot-modules';
import {
  runStudioKernelBoot,
  getStudioBootReport,
  resetStudioKernelBoot,
  STUDIO_BOOT_ORDER,
  STUDIO_BOOT_EVENT,
  type StudioBootPhase,
  type StudioBootReport,
} from '../kernel';

let modulesRegistered = false;

function ensureBootModulesRegistered(): void {
  if (modulesRegistered) return;
  registerAllStudioBootModules();
  modulesRegistered = true;
}

/** StudioBootstrap™ — public entry for deterministic Studio OS startup. */
export async function runStudioBootstrap(options?: {
  through?: StudioBootPhase;
  force?: boolean;
}): Promise<StudioBootReport> {
  ensureBootModulesRegistered();
  return runStudioKernelBoot(options);
}

export function getStudioBootstrapReport(): StudioBootReport | null {
  return getStudioBootReport();
}

export function resetStudioBootstrap(): void {
  resetStudioKernelBoot();
}

export { STUDIO_BOOT_ORDER, STUDIO_BOOT_EVENT, type StudioBootPhase, type StudioBootReport };

export { STUDIO_DEFAULT_FALLBACK_CONTRACT } from './default-fallback-contract';
