/** Milestone 131 — Event Bus™ V1.0 */

export const EVENT_BUS_STORAGE_KEY = 'studioOsEventBus_v1';
export const EVENT_BUS_VERSION = '1.0.0';
export const STUDIO_OS_EVENT_BUS_UPDATED = 'studio-os-event-bus-updated';

export const EVENT_BUS_ACCENT = '#EA580C';

export const EVENT_BUS_PHILOSOPHY = [
  'Systems should not communicate directly — they publish events.',
  'Other systems decide whether to respond — loosely coupled, scalable architecture.',
  'The Event Bus™ is the nervous system of Studio OS.',
  'One event. Many intelligent reactions. No fragile dependencies.',
] as const;

/** Standard event verbs — every future module publishes these */
export const STANDARD_EVENT_VERBS = [
  'created',
  'updated',
  'deleted',
  'approved',
  'rejected',
  'published',
  'archived',
  'completed',
  'started',
  'stopped',
  'assigned',
  'transferred',
  'scheduled',
  'cancelled',
  'paid',
  'failed',
  'succeeded',
  'imported',
  'exported',
  'connected',
  'disconnected',
] as const;

/** Event domain categories */
export const EVENT_DOMAINS = [
  'organization',
  'customer',
  'module',
  'documentation',
  'automation',
  'intelligence',
  'notification',
  'analytics',
  'search',
  'registry',
  'timeline',
  'memory',
  'pulse',
  'command',
  'system',
] as const;

/** Max demo event history entries per organization */
export const EVENT_HISTORY_MAX_ENTRIES = 200;

/** Demo latency baseline for inspector metrics (ms) */
export const EVENT_LATENCY_BASELINE_MS = 12;
