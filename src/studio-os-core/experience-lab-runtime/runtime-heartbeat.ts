/**
 * Experience Lab heartbeat — owned exclusively by the runtime, not the World Compiler.
 * Survives compiler unmounts; stops only when no active sessions remain.
 */

type HeartbeatListener = (tick: number) => void;

let heartbeatTick = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;
let activeSessionCount = 0;
const listeners = new Set<HeartbeatListener>();

function emitTick(): void {
  heartbeatTick += 1;
  for (const listener of listeners) {
    try {
      listener(heartbeatTick);
    } catch (err) {
      console.warn('[ExperienceLabHeartbeat] listener error', err);
    }
  }
}

export function startExperienceLabHeartbeat(): void {
  activeSessionCount += 1;
  if (intervalId !== null) return;
  intervalId = setInterval(emitTick, 1000);
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.experienceLabHeartbeat = 'active';
  }
}

export function stopExperienceLabHeartbeat(): void {
  activeSessionCount = Math.max(0, activeSessionCount - 1);
  if (activeSessionCount > 0 || intervalId === null) return;
  clearInterval(intervalId);
  intervalId = null;
  if (typeof document !== 'undefined') {
    delete document.documentElement.dataset.experienceLabHeartbeat;
  }
}

export function getExperienceLabHeartbeatTick(): number {
  return heartbeatTick;
}

export function isExperienceLabHeartbeatActive(): boolean {
  return intervalId !== null;
}

export function subscribeExperienceLabHeartbeat(listener: HeartbeatListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Test / diagnostics — force-reset heartbeat state. */
export function resetExperienceLabHeartbeatForTests(): void {
  if (intervalId !== null) clearInterval(intervalId);
  intervalId = null;
  activeSessionCount = 0;
  heartbeatTick = 0;
  listeners.clear();
}
