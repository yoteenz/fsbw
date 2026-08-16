/**
 * Sprint 23 — correlation IDs for support tracing.
 */

let counter = 0;

export function generateCorrelationId(prefix = 'aio'): string {
  counter += 1;
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${ts}-${counter}-${rand}`;
}

const correlationStore = new Map<string, string>();

export function setRequestCorrelationId(id: string): void {
  if (typeof window !== 'undefined') {
    correlationStore.set('current', id);
  }
}

export function getRequestCorrelationId(): string {
  return correlationStore.get('current') ?? generateCorrelationId();
}
