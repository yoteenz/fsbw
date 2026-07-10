export type ExperienceEngineStartupStage =
  | 'route-match'
  | 'lazy-chunk'
  | 'module-eval'
  | 'provider-mount'
  | 'persisted-hydration'
  | 'auth-hydration'
  | 'workspace-hydration'
  | 'engine-init'
  | 'scene-compile'
  | 'terminal-render';

export type ExperienceEngineStartupTraceEntry = {
  stage: ExperienceEngineStartupStage;
  status: 'started' | 'completed' | 'failed';
  at: string;
  durationMs?: number;
  source?: string;
  schemaVersion?: string;
  error?: string;
};

declare global {
  interface Window {
    __STUDIO_EE_STARTUP_TRACE__?: ExperienceEngineStartupTraceEntry[];
  }
}

const stageStartedAt = new Map<ExperienceEngineStartupStage, number>();

function pushEntry(entry: ExperienceEngineStartupTraceEntry): void {
  if (typeof window === 'undefined') return;
  const list = window.__STUDIO_EE_STARTUP_TRACE__ ?? [];
  list.push(entry);
  window.__STUDIO_EE_STARTUP_TRACE__ = list.slice(-40);
}

export function clearExperienceEngineStartupTrace(): void {
  stageStartedAt.clear();
  if (typeof window !== 'undefined') {
    window.__STUDIO_EE_STARTUP_TRACE__ = [];
  }
}

export function traceExperienceEngineStage(
  stage: ExperienceEngineStartupStage,
  status: 'started' | 'completed' | 'failed',
  detail?: {
    source?: string;
    schemaVersion?: string;
    error?: string;
  }
): void {
  const now = Date.now();
  let durationMs: number | undefined;

  if (status === 'started') {
    stageStartedAt.set(stage, now);
  } else {
    const started = stageStartedAt.get(stage);
    if (started) durationMs = now - started;
  }

  pushEntry({
    stage,
    status,
    at: new Date().toISOString(),
    durationMs,
    source: detail?.source,
    schemaVersion: detail?.schemaVersion,
    error: detail?.error,
  });
}

export function readExperienceEngineStartupTrace(): ExperienceEngineStartupTraceEntry[] {
  if (typeof window === 'undefined') return [];
  return window.__STUDIO_EE_STARTUP_TRACE__ ?? [];
}
