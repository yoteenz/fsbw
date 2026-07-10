/**
 * Static timer inventory for World Compiler / Experience Lab / Scene Stack paths.
 * Evidence from codebase scan — no ~3000ms timer in compile path; BOOT_MODULE_TIMEOUT_MS = 3000 in kernel.
 */
export type CompilerPathTimer = {
  file: string;
  function: string;
  intervalMs: number | null;
  kind: 'timeout' | 'interval' | 'raf' | 'idle';
  callbackPurpose: string;
  stateModified: string;
  canRestartCompile: boolean;
};

export const COMPILER_PATH_TIMERS: CompilerPathTimer[] = [
  {
    file: 'src/hooks/useCreativeStudioRenderPreview.ts',
    function: 'useEffect clock tick',
    intervalMs: 1000,
    kind: 'interval',
    callbackPurpose: 'Elapsed time / stall UI clock',
    stateModified: 'clockTick',
    canRestartCompile: false,
  },
  {
    file: 'src/studio-os-core/creative-studio-preview/render-pipeline-progress.ts',
    function: 'RENDER_PIPELINE_STALL_MS',
    intervalMs: 90000,
    kind: 'timeout',
    callbackPurpose: 'Stall warning threshold (not auto-retry)',
    stateModified: 'isStalled UI flag',
    canRestartCompile: false,
  },
  {
    file: 'src/studio-os-core/kernel/types.ts',
    function: 'BOOT_MODULE_TIMEOUT_MS',
    intervalMs: 3000,
    kind: 'timeout',
    callbackPurpose: 'Studio boot module timeout — rejects boot promise',
    stateModified: 'studio-kernel boot state',
    canRestartCompile: true,
  },
  {
    file: 'src/platform-stabilization/main-thread-diagnostics.ts',
    function: 'startHeartbeat',
    intervalMs: 250,
    kind: 'interval',
    callbackPurpose: 'MTD heartbeat overlay',
    stateModified: 'heartbeat counters',
    canRestartCompile: false,
  },
  {
    file: 'src/platform-stabilization/loadingTerminalRegistry.ts',
    function: 'watchdogTimer',
    intervalMs: 12000,
    kind: 'interval',
    callbackPurpose: 'Loading screen terminal watchdog',
    stateModified: 'loading lock / overlay',
    canRestartCompile: false,
  },
  {
    file: 'src/platform-stabilization/post-load-render-guard.ts',
    function: 'audit timeouts',
    intervalMs: 4000,
    kind: 'timeout',
    callbackPurpose: 'Post-load render audits at 4/8/12/20s',
    stateModified: 'trace only',
    canRestartCompile: false,
  },
  {
    file: 'src/components/admin/studio/studio-orb/StudioOrbProvider.tsx',
    function: 'voiceTick interval',
    intervalMs: 280,
    kind: 'interval',
    callbackPurpose: 'Orb voice animation tick',
    stateModified: 'voiceTick',
    canRestartCompile: false,
  },
  {
    file: 'src/studio-os-core/scene-stack/ephemeral-validation-registry.ts',
    function: 'EPHEMERAL_VALIDATION_TTL_MS',
    intervalMs: 1800000,
    kind: 'timeout',
    callbackPurpose: 'Ephemeral shell session expiry on read',
    stateModified: 'clears ephemeral shell session',
    canRestartCompile: true,
  },
];

export function findTimersNearThreeSeconds(): CompilerPathTimer[] {
  return COMPILER_PATH_TIMERS.filter(
    (t) => t.intervalMs != null && t.intervalMs >= 2500 && t.intervalMs <= 3500
  );
}

export function getRuntimeTimersNearThreeSeconds(): Array<{
  timerId: number;
  intervalMs: number | null;
  caller: string;
  purpose: string | null;
}> {
  try {
    const win = window as unknown as {
      __STUDIO_OS_TIMER_INVENTORY__?: Array<{
        timerId: number;
        intervalMs: number | null;
        caller: string;
        purpose: string | null;
      }>;
    };
    const all = win.__STUDIO_OS_TIMER_INVENTORY__ ?? [];
    return all.filter((t) => t.intervalMs != null && t.intervalMs >= 2500 && t.intervalMs <= 3500);
  } catch {
    return [];
  }
}
