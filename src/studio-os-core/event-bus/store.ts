import { readFirstEnsure } from '../sync/profile-cache';
import {
  EVENT_BUS_STORAGE_KEY,
  EVENT_BUS_VERSION,
  STUDIO_OS_EVENT_BUS_UPDATED,
} from './constants';
import { buildOrganizationEventBusProfile } from './engine-profile-builder';
import { buildInspectorMetrics } from './inspector-engine';
import { publishEvent, replayEvent } from './bus-runtime';
import type { EventBusStore, EventHistoryEntry, OrganizationEventBusProfile, PublishEventInput } from './types';

function emptyStore(): EventBusStore {
  return { version: EVENT_BUS_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_EVENT_BUS_UPDATED));
  }
}

export function readEventBusStore(): EventBusStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EVENT_BUS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as EventBusStore;
    return { ...emptyStore(), ...parsed, version: EVENT_BUS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeEventBusStore(store: EventBusStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(EVENT_BUS_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationEventBusProfile(organizationId: string): OrganizationEventBusProfile | null {
  return readEventBusStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationEventBusProfile): OrganizationEventBusProfile {
  const store = readEventBusStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeEventBusStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild event catalog, subscriptions, history, and governance from platform sources */
export function syncEventBusFromSources(organizationId: string): OrganizationEventBusProfile {
  const existing = getOrganizationEventBusProfile(organizationId);
  const rebuilt = buildOrganizationEventBusProfile(organizationId);
  if (existing?.eventHistory?.length) {
    rebuilt.eventHistory = existing.eventHistory;
    rebuilt.inspectorMetrics = buildInspectorMetrics(existing.eventHistory);
    rebuilt.avgLatencyMs =
      existing.eventHistory.length === 0
        ? 0
        : Math.round(existing.eventHistory.reduce((s, e) => s + e.latencyMs, 0) / existing.eventHistory.length);
  }
  const profile = upsertProfile(rebuilt);
  return profile;
}

export function ensureOrganizationEventBusProfile(organizationId: string): OrganizationEventBusProfile {
  return readFirstEnsure(organizationId, getOrganizationEventBusProfile, syncEventBusFromSources);
}

export function publishOrganizationEvent(
  organizationId: string,
  input: PublishEventInput
): OrganizationEventBusProfile {
  const profile = getOrganizationEventBusProfile(organizationId) ?? syncEventBusFromSources(organizationId);
  const { history } = publishEvent(organizationId, input, profile.eventHistory);
  return upsertProfile({
    ...profile,
    eventHistory: history,
    inspectorMetrics: buildInspectorMetrics(history),
    avgLatencyMs: Math.round(history.reduce((s, e) => s + e.latencyMs, 0) / Math.max(1, history.length)),
    updatedAt: new Date().toISOString(),
  });
}

export function replayOrganizationEvent(
  organizationId: string,
  entry: EventHistoryEntry
): OrganizationEventBusProfile {
  const profile = getOrganizationEventBusProfile(organizationId) ?? syncEventBusFromSources(organizationId);
  const { history } = replayEvent(organizationId, entry, profile.eventHistory);
  return upsertProfile({
    ...profile,
    eventHistory: history,
    inspectorMetrics: buildInspectorMetrics(history),
    updatedAt: new Date().toISOString(),
  });
}
