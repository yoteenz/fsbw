import type { StudioBootLiveState } from '../kernel/types';
import { STUDIO_BOOT_EVENT } from '../kernel/types';
import {
  getStudioBootLiveState,
  isStudioKernelBootInProgress,
  startStudioKernelBoot,
  type StudioBootPhase,
  type StudioBootReport,
} from '../kernel';
import { registerAllStudioBootModules } from './register-boot-modules';
import {
  traceSync,
} from '../../platform-stabilization/main-thread-diagnostics';

export type StudioBootListener = (state: StudioBootLiveState) => void;

let modulesRegistered = false;
let orchestratorStartPromise: Promise<StudioBootReport> | null = null;

function ensureBootModulesRegistered(): void {
  if (modulesRegistered) return;
  registerAllStudioBootModules();
  modulesRegistered = true;
}

/** Subscribe to live boot state — hydrates from kernel snapshot on attach. */
export function subscribeStudioBoot(listener: StudioBootListener): () => void {
  return traceSync('subscribeStudioBoot', () => {
    if (typeof window === 'undefined') return () => undefined;

    ensureBootModulesRegistered();

    const onBoot = (event: Event) => {
      const detail = (event as CustomEvent<StudioBootLiveState>).detail;
      if (detail) listener(detail);
    };

    window.addEventListener(STUDIO_BOOT_EVENT, onBoot);
    const cached = getStudioBootLiveState();
    if (cached) listener(cached);

    return () => window.removeEventListener(STUDIO_BOOT_EVENT, onBoot);
  });
}

/** Clears orchestrator guard so a forced retry can start a new run. */
export function clearStudioBootstrapOrchestrator(): void {
  orchestratorStartPromise = null;
}

/**
 * Deterministic Studio Bootstrap entry — idempotent, safe under StrictMode remount.
 * Called once from main.tsx before React mounts; hooks may call again with a narrower `through`.
 */
export function ensureStudioBootstrapStarted(options?: {
  through?: StudioBootPhase;
}): Promise<StudioBootReport | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  ensureBootModulesRegistered();

  const through = options?.through ?? 'ui-render';
  const live = getStudioBootLiveState();
  if (live?.complete) {
    return Promise.resolve(
      orchestratorStartPromise ?? {
        ready: live.ready,
        modules: live.modules,
        errors: live.errors,
        warnings: live.warnings,
        fallbacksUsed: live.fallbacksUsed,
        startedAt: Date.now() - live.elapsedMs,
        finishedAt: Date.now(),
        safeMode: live.safeMode,
      }
    );
  }

  if (orchestratorStartPromise) {
    return orchestratorStartPromise;
  }

  if (isStudioKernelBootInProgress()) {
    orchestratorStartPromise = startStudioKernelBoot({
      through,
      force: false,
      allowReset: false,
    }).catch((err) => {
      orchestratorStartPromise = null;
      throw err;
    });
    return orchestratorStartPromise;
  }

  orchestratorStartPromise = startStudioKernelBoot({
    through,
    force: false,
    allowReset: false,
  }).catch((err) => {
    orchestratorStartPromise = null;
    throw err;
  });

  return orchestratorStartPromise;
}
