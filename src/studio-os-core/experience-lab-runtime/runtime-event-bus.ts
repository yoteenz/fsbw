import type { RuntimeEventPayload, RuntimeEventType } from './runtime-events';

export type RuntimeEventListener = (event: RuntimeEventPayload) => void;

export type RuntimeSnapshotListener<T> = (snapshot: T) => void;

/**
 * Canonical Runtime Event Bus — Experience Lab publishes, World Compiler subscribes.
 * Module-scoped singleton survives React unmounts.
 */
class RuntimeEventBusImpl {
  private eventListeners = new Set<RuntimeEventListener>();
  private sessionListeners = new Map<string, Set<RuntimeSnapshotListener<unknown>>>();
  private globalSessionListeners = new Set<RuntimeSnapshotListener<unknown>>();
  private eventLog: RuntimeEventPayload[] = [];
  private readonly maxLogSize = 200;

  subscribeEvents(listener: RuntimeEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  subscribeSession<T>(sessionId: string, listener: RuntimeSnapshotListener<T>): () => void {
    let set = this.sessionListeners.get(sessionId);
    if (!set) {
      set = new Set();
      this.sessionListeners.set(sessionId, set);
    }
    set.add(listener as RuntimeSnapshotListener<unknown>);
    return () => {
      set?.delete(listener as RuntimeSnapshotListener<unknown>);
      if (set && set.size === 0) this.sessionListeners.delete(sessionId);
    };
  }

  subscribeAllSessions<T>(listener: RuntimeSnapshotListener<T>): () => void {
    this.globalSessionListeners.add(listener as RuntimeSnapshotListener<unknown>);
    return () => this.globalSessionListeners.delete(listener as RuntimeSnapshotListener<unknown>);
  }

  publish(event: RuntimeEventPayload): void {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.splice(0, this.eventLog.length - this.maxLogSize);
    }
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (err) {
        console.warn('[RuntimeEventBus] listener error', err);
      }
    }
  }

  notifySnapshot<T>(sessionId: string, snapshot: T): void {
    const listeners = this.sessionListeners.get(sessionId);
    if (listeners) {
      for (const listener of listeners) {
        try {
          (listener as RuntimeSnapshotListener<T>)(snapshot);
        } catch (err) {
          console.warn('[RuntimeEventBus] snapshot listener error', err);
        }
      }
    }
    for (const listener of this.globalSessionListeners) {
      try {
        (listener as RuntimeSnapshotListener<T>)(snapshot);
      } catch (err) {
        console.warn('[RuntimeEventBus] global snapshot listener error', err);
      }
    }
  }

  getRecentEvents(sessionId?: string, limit = 50): RuntimeEventPayload[] {
    const slice = this.eventLog.slice(-limit);
    if (!sessionId) return slice;
    return slice.filter((e) => e.sessionId === sessionId);
  }

  getEventCount(type?: RuntimeEventType): number {
    if (!type) return this.eventLog.length;
    return this.eventLog.filter((e) => e.type === type).length;
  }
}

export const runtimeEventBus = new RuntimeEventBusImpl();
