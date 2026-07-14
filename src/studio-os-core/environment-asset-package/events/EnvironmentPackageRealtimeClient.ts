import type { EnvironmentPackageEvent, EnvironmentPackageEventCursor } from './EnvironmentPackageEvent';
import { mapAuditRowToEnvironmentPackageEvent } from './mapAuditRowToEvent';
import { subscribeLocalEnvironmentPackageEvents } from './EnvironmentPackageLocalEventBus';

export type FetchPackageEventsFn = (input: {
  packageId: string;
  afterSequence: number;
}) => Promise<{ ok: boolean; events: EnvironmentPackageEvent[]; latestSequence?: number; error?: string }>;

export type RealtimeClientOptions = {
  packageId: string | null;
  fetchEvents: FetchPackageEventsFn;
  onEvent: (event: EnvironmentPackageEvent) => void;
  onConnectionStateChange?: (state: EnvironmentPackageEventCursor['connectionState']) => void;
  subscribeSupabase?: (packageId: string, onRow: (row: Record<string, unknown>) => void) => () => void;
};

const PROGRESS_THROTTLE_MS = 250;
let lastProgressEmitAt = 0;
let pendingProgress: EnvironmentPackageEvent | null = null;
let progressTimer: ReturnType<typeof setTimeout> | null = null;

function shouldThrottle(event: EnvironmentPackageEvent): boolean {
  return event.eventType === 'GENERATION_JOB_PROGRESS' || event.eventType === 'OUTPUT_GENERATING';
}

function flushProgress(onEvent: (event: EnvironmentPackageEvent) => void): void {
  if (pendingProgress) {
    onEvent(pendingProgress);
    pendingProgress = null;
  }
  progressTimer = null;
}

function deliverEvent(event: EnvironmentPackageEvent, onEvent: (event: EnvironmentPackageEvent) => void): void {
  if (!shouldThrottle(event)) {
    flushProgress(onEvent);
    onEvent(event);
    return;
  }
  pendingProgress = event;
  const now = Date.now();
  if (now - lastProgressEmitAt >= PROGRESS_THROTTLE_MS) {
    lastProgressEmitAt = now;
    flushProgress(onEvent);
    return;
  }
  if (!progressTimer) {
    progressTimer = setTimeout(() => {
      lastProgressEmitAt = Date.now();
      flushProgress(onEvent);
    }, PROGRESS_THROTTLE_MS - (now - lastProgressEmitAt));
  }
}

/** Scoped realtime + local event subscription for one active package. */
export function createEnvironmentPackageRealtimeClient(options: RealtimeClientOptions): {
  reconnect: () => Promise<void>;
  dispose: () => void;
} {
  let activePackageId = options.packageId;
  const unsubscribers: Array<() => void> = [];

  const emitConnection = (state: EnvironmentPackageEventCursor['connectionState']) => {
    options.onConnectionStateChange?.(state);
  };

  const handleRow = (row: Record<string, unknown>) => {
    const event = mapAuditRowToEnvironmentPackageEvent(row);
    if (activePackageId && event.packageId !== activePackageId) return;
    deliverEvent(event, options.onEvent);
  };

  if (activePackageId) {
    emitConnection('connecting');
    lastProgressEmitAt = Date.now();

    unsubscribers.push(
      subscribeLocalEnvironmentPackageEvents(activePackageId, (event) => {
        deliverEvent(event, options.onEvent);
      })
    );

    if (options.subscribeSupabase) {
      unsubscribers.push(options.subscribeSupabase(activePackageId, handleRow));
      emitConnection('connected');
    } else {
      emitConnection('local-only');
    }
  } else {
    emitConnection('disconnected');
  }

  const reconnect = async () => {
    if (!activePackageId) return;
    emitConnection('recovering');
    const result = await options.fetchEvents({ packageId: activePackageId, afterSequence: 0 });
    if (result.ok) {
      for (const event of result.events) {
        deliverEvent(event, options.onEvent);
      }
      emitConnection(options.subscribeSupabase ? 'connected' : 'local-only');
    } else {
      emitConnection('degraded');
    }
  };

  const dispose = () => {
    if (progressTimer) clearTimeout(progressTimer);
    unsubscribers.forEach((fn) => fn());
    unsubscribers.length = 0;
    emitConnection('disconnected');
  };

  return { reconnect, dispose };
}

export function resetEnvironmentPackageRealtimeThrottle(): void {
  lastProgressEmitAt = 0;
  pendingProgress = null;
  if (progressTimer) clearTimeout(progressTimer);
  progressTimer = null;
}
