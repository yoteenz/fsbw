/** Studio OS Black Box Investigation™ — shared diagnostic types. Observe-only; never mutates runtime. */

export type FlightEventType =
  | 'RECORDER_ATTACHED'
  | 'RECORDER_READY'
  | 'RECORDER_STARTED'
  | 'RECORDER_PAUSED'
  | 'RECORDER_RESUMED'
  | 'RECORDER_CLEARED'
  | 'BOOT_STARTED'
  | 'BOOT_COMPLETED'
  | 'AUTH_STARTED'
  | 'AUTH_COMPLETED'
  | 'GENESIS_LOADED'
  | 'REGISTRY_LOADED'
  | 'DEPARTMENT_PACKAGE_REGISTRY_INITIALIZED'
  | 'DEPARTMENT_PACKAGE_REGISTERED'
  | 'DEPARTMENT_PACKAGE_LOOKUP_STARTED'
  | 'DEPARTMENT_PACKAGE_LOOKUP_RESOLVED'
  | 'DEPARTMENT_PACKAGE_LOOKUP_FAILED'
  | 'DEPARTMENT_PACKAGE_VALIDATION_FAILED'
  | 'SCENE_STACK_CREATED'
  | 'SCENE_STACK_UPDATED'
  | 'STATION_CREATED'
  | 'STATION_DESTROYED'
  | 'STATION_RESTORED'
  | 'SHELL_CREATED'
  | 'SHELL_LOADED'
  | 'SHELL_DESTROYED'
  | 'SHELL_INVALIDATED'
  | 'COMPILER_STARTED'
  | 'WORLD_COMPILER_STARTED'
  | 'WORLD_COMPILER_STOPPED'
  | 'COMPILER_STAGE_ENTER'
  | 'COMPILER_STAGE_CHANGED'
  | 'COMPILER_STAGE_COMPLETE'
  | 'COMPILER_FAILED'
  | 'COMPILER_RESET'
  | 'LANDMARK_GENERATED'
  | 'HEARTBEAT_STARTED'
  | 'HEARTBEAT_STOPPED'
  | 'HEARTBEAT_RESTARTED'
  | 'HEARTBEAT_TIMEOUT'
  | 'SESSION_CREATED'
  | 'SESSION_DESTROYED'
  | 'SESSION_RESTORED'
  | 'EXPERIENCE_LAB_STARTED'
  | 'EXPERIENCE_LAB_DESTROYED'
  | 'ROUTE_CHANGED'
  | 'VISIBILITY_CHANGED'
  | 'PAGE_HIDDEN'
  | 'PAGE_VISIBLE'
  | 'CONTEXT_UPDATED'
  | 'STORE_UPDATED'
  | 'PROVIDER_RENDER'
  | 'COMPONENT_MOUNT'
  | 'COMPONENT_UNMOUNT'
  | 'COMPONENT_REMOUNT'
  | 'ERROR'
  | 'WARNING'
  | 'RUNTIME_ERROR'
  | 'ERROR_BOUNDARY'
  | 'UNCAUGHT_EXCEPTION'
  | 'UNHANDLED_REJECTION'
  | 'SERVICE_WORKER_MESSAGE'
  | 'CACHE_UPDATED'
  | 'CACHE_READ'
  | 'CACHE_WRITE'
  | 'LOCAL_STORAGE_READ'
  | 'LOCAL_STORAGE_WRITE'
  | 'SESSION_STORAGE_READ'
  | 'SESSION_STORAGE_WRITE'
  | 'STORAGE_WRITE'
  | 'STORAGE_READ'
  | 'LONG_TASK'
  | 'ENV_SNAPSHOT'
  | 'SESSION_REPORT'
  | 'SUBSCRIPTION_ATTACHED'
  | 'SUBSCRIPTION_DETACHED'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_DESTROYED'
  | 'TIMER_REGISTERED'
  | 'TIMER_CLEARED'
  | 'REQUEST_ANIMATION_FRAME';

export type HeartbeatState = {
  heartbeat: number;
  rafCount: number;
  timeoutProbe: number;
  frozen: boolean;
  lastHeartbeatAt: number;
};

export type FlightContextOverlay = {
  company?: string | null;
  stationId?: string | null;
  shellId?: string | null;
  compileRunId?: string | null;
  registryVersion?: string | null;
  sceneStackVersion?: string | null;
  contextVersion?: string | null;
  conceptId?: string | null;
};

/** Append-only flight recorder event — never mutated after write. */
export type FlightRecorderEvent = {
  /** Monotonic sequence id within session. */
  id: number;
  /** Unique event id (session + sequence). */
  eventId: string;
  timestamp: number;
  isoTime: string;
  type: FlightEventType;
  source: string;
  caller: string;
  route: string;
  browser: string;
  platform: string;
  company: string | null;
  stationId: string | null;
  shellId: string | null;
  compileRunId: string | null;
  heartbeatState: HeartbeatState | null;
  registryVersion: string | null;
  sceneStackVersion: string | null;
  reactRenderCount: number;
  activeSubscriptions: number;
  contextVersion: string | null;
  url: string;
  sessionId: string;
  bundleVersion: string | null;
  reactVersion: string | null;
  detail?: Record<string, unknown>;
};

export type EnvironmentSnapshot = {
  label: string;
  capturedAt: string;
  cookies: Record<string, string>;
  localStorageKeys: string[];
  localStorageSizes: Record<string, number>;
  sessionStorageKeys: string[];
  sessionStorageSizes: Record<string, number>;
  indexedDbNames: string[];
  cacheStorageKeys: string[];
  serviceWorkerRegistrations: number;
  navigator: Record<string, unknown>;
  featureFlags: Record<string, unknown>;
  registryVersion: string | null;
  genesisVersion: string | null;
  genesisBytes: number;
  shellId: string | null;
  stationId: string | null;
  compileRunId: string | null;
  heartbeatId: string | null;
  authState: Record<string, unknown>;
  hydrationState: Record<string, unknown>;
  bootDurationMs: number | null;
  reactVersion: string | null;
  bundleVersion: string | null;
  contextVersions: Record<string, unknown>;
  url: string;
  userAgent: string;
};

export type TimelineAnalysis = {
  events: Array<{ isoTime: string; type: FlightEventType; source: string; caller: string }>;
  finalSuccessfulEvent: FlightRecorderEvent | null;
  firstMissingEvent: string | null;
  firstAbnormalEvent: FlightRecorderEvent | null;
  gapDescription: string | null;
};

export type SessionForensicReport = {
  sessionId: string;
  generatedAt: string;
  bootCompleted: boolean;
  heartbeatDurationMs: number | null;
  compilerDurationMs: number | null;
  registryUpdateCount: number;
  sceneStackUpdateCount: number;
  reactRemountCount: number;
  errorCount: number;
  warningCount: number;
  finalSuccessfulEvent: FlightRecorderEvent | null;
  firstAbnormalEvent: FlightRecorderEvent | null;
  firstIrreversibleFailure: FlightRecorderEvent | null;
  failureClassification: FailureClassification | null;
  timeline: TimelineAnalysis;
  environmentDiff: EnvironmentDiffResult | null;
  ownershipConflicts: OwnershipConflict[];
  timerInventory: TimerRecord[];
  subscriptionGraph: SubscriptionEdge[];
  subscriptionLoops: SubscriptionLoop[];
  evidenceOnly: true;
};

export type FailureClassification =
  | 'component_remount'
  | 'state_mutation'
  | 'subscription_loop'
  | 'registry_invalidation'
  | 'timer'
  | 'cache'
  | 'browser_storage'
  | 'hydration'
  | 'service_worker'
  | 'routing'
  | 'ownership_conflict'
  | 'main_thread_block'
  | 'unknown';

export type EnvironmentDiffResult = {
  baselineLabel: string;
  compareLabel: string;
  differingKeys: Array<{ path: string; baseline: unknown; compare: unknown }>;
};

export type OwnershipConflict = {
  stateKey: string;
  owners: string[];
  writers: string[];
  readers: string[];
  mutationCount: number;
};

export type TimerRecord = {
  timerId: number;
  kind: 'timeout' | 'interval' | 'raf';
  intervalMs: number | null;
  caller: string;
  purpose: string | null;
  registeredAt: number;
  stateModified: string | null;
  canRestartEngine: boolean;
};

export type SubscriptionEdge = {
  publisher: string;
  subscribers: string[];
  sideEffects: string[];
  furtherEvents: string[];
};

export type SubscriptionLoop = {
  cycle: string[];
  evidence: string;
};
