/** Boot module lifecycle status — IDLE → STARTING → RUNNING → READY. */
export type BootModuleStatus =
  | 'idle'
  | 'starting'
  | 'running'
  | 'ready'
  | 'failed'
  | 'fallback'
  | 'skipped';

export type BootModuleSnapshot = {
  id: string;
  name: string;
  label: string;
  status: BootModuleStatus;
  dependencies: string[];
  required: boolean;
  errors: string[];
  warnings: string[];
  fallback?: string;
  startedAt?: number;
  finishedAt?: number;
};

export type BootModuleContract = {
  id: string;
  name: string;
  label: string;
  dependencies: string[];
  required: boolean;
  initialize: () => Promise<void>;
  isReady: () => boolean;
  errors: string[];
  warnings: string[];
  fallback?: string;
  status: BootModuleStatus;
};

export type StudioBootReport = {
  ready: boolean;
  modules: BootModuleSnapshot[];
  errors: string[];
  warnings: string[];
  fallbacksUsed: string[];
  startedAt: number;
  finishedAt?: number;
  currentModuleId?: string | null;
  elapsedMs?: number;
  safeMode?: boolean;
};

export type StudioBootEventLogEntry = {
  ts: number;
  kind: 'info' | 'warn' | 'error' | 'module';
  message: string;
};

export type StudioBootLiveState = {
  modules: BootModuleSnapshot[];
  currentModuleId: string | null;
  elapsedMs: number;
  complete: boolean;
  ready: boolean;
  started: boolean;
  waitingForManualStart: boolean;
  eventLog: StudioBootEventLogEntry[];
  errors: string[];
  warnings: string[];
  fallbacksUsed: string[];
  safeMode: boolean;
};

export const STUDIO_BOOT_EVENT = 'studio-os-boot-updated';

export const BOOT_MODULE_TIMEOUT_MS = 3000;

/** Visible labels for boot diagnostics. */
export const BOOT_MODULE_DISPLAY_LABELS: Record<string, string> = {
  storage: 'storage',
  'auth-session': 'auth',
  'admin-context': 'user-context',
  'platform-dna': 'platform-dna',
  'brand-registry': 'brand-registry',
  'department-registry': 'genesis-department-dna-registry',
  'department-package-registry': 'department-package-registry',
  'scene-registry': 'scene-registry',
  'state-dna': 'state-dna',
  'design-dna-resolver': 'design-dna-resolver',
  'experience-runtime': 'experience-runtime',
  'workspace-runtime': 'workspace-runtime',
  'ui-render': 'ui-render',
};
