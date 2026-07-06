import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import {
  LIFE_CULTURE_PREFERENCES_STORAGE_KEY,
  LIFE_CULTURE_PREFERENCES_VERSION,
} from './constants';
import { emptyLayerPreferences, emptyLifeCultureStore } from './defaults';
import type {
  EventResponse,
  LayerPreferences,
  LifeCulturePreferencesStore,
  PreferenceLayer,
  SensitiveEventResponse,
} from './types';

function resolveUserScopeId(): string {
  if (typeof window === 'undefined') return 'local-user';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: string; email?: string };
      if (parsed.id) return parsed.id;
      if (parsed.email) return parsed.email.trim().toLowerCase();
    }
  } catch {
    /* ignore */
  }
  return 'local-user';
}

function storageSuffix(userScopeId: string): string {
  return `${LIFE_CULTURE_PREFERENCES_STORAGE_KEY}__${userScopeId}`;
}

export function readLifeCulturePreferencesStore(organizationId: string): LifeCulturePreferencesStore {
  const userScopeId = resolveUserScopeId();
  const store = readScopedStore(
    storageSuffix(userScopeId),
    () => emptyLifeCultureStore(userScopeId, organizationId),
    organizationId
  );
  return { ...store, userScopeId, organizationId };
}

export function writeLifeCulturePreferencesStore(store: LifeCulturePreferencesStore): void {
  writeScopedStore(
    storageSuffix(store.userScopeId),
    { ...store, version: LIFE_CULTURE_PREFERENCES_VERSION, updatedAt: new Date().toISOString() },
    store.organizationId
  );
}

export function updateLayerPreferences(
  organizationId: string,
  layer: PreferenceLayer,
  patch: Partial<LayerPreferences>
): LifeCulturePreferencesStore {
  const store = readLifeCulturePreferencesStore(organizationId);
  const next: LifeCulturePreferencesStore = {
    ...store,
    layers: {
      ...store.layers,
      [layer]: { ...store.layers[layer], ...patch },
    },
  };
  writeLifeCulturePreferencesStore(next);
  return next;
}

export function setHolidayResponse(
  organizationId: string,
  layer: PreferenceLayer,
  holidayId: string,
  response: EventResponse
): LifeCulturePreferencesStore {
  const store = readLifeCulturePreferencesStore(organizationId);
  const layerPrefs = store.layers[layer];
  return updateLayerPreferences(organizationId, layer, {
    holidayResponses: { ...layerPrefs.holidayResponses, [holidayId]: response },
  });
}

export function setSensitiveEventResponse(
  organizationId: string,
  layer: PreferenceLayer,
  eventId: string,
  response: SensitiveEventResponse
): LifeCulturePreferencesStore {
  const store = readLifeCulturePreferencesStore(organizationId);
  const layerPrefs = store.layers[layer];
  return updateLayerPreferences(organizationId, layer, {
    sensitiveEventResponses: { ...layerPrefs.sensitiveEventResponses, [eventId]: response },
  });
}

export function markLifeCultureIntroComplete(organizationId: string): LifeCulturePreferencesStore {
  const store = readLifeCulturePreferencesStore(organizationId);
  const next = { ...store, introCompleted: true };
  writeLifeCulturePreferencesStore(next);
  return next;
}

export function dismissDiscoveryPrompt(organizationId: string, promptId: string): void {
  const store = readLifeCulturePreferencesStore(organizationId);
  if (store.discoveryDismissedIds.includes(promptId)) return;
  writeLifeCulturePreferencesStore({
    ...store,
    discoveryDismissedIds: [...store.discoveryDismissedIds, promptId].slice(-32),
  });
}

export function exportLifeCulturePreferences(organizationId: string): string {
  return JSON.stringify(readLifeCulturePreferencesStore(organizationId), null, 2);
}

export function deleteLifeCulturePreferences(organizationId: string): void {
  const userScopeId = resolveUserScopeId();
  const empty = emptyLifeCultureStore(userScopeId, organizationId);
  writeLifeCulturePreferencesStore(empty);
}

export function hasAnyLifeCultureConfiguration(store: LifeCulturePreferencesStore): boolean {
  for (const layer of Object.values(store.layers)) {
    if (layer.seasonalCelebrationsEnabled) return true;
    if (Object.values(layer.holidayResponses).some((r) => r !== 'unset')) return true;
    if (Object.values(layer.sensitiveEventResponses).some((r) => r !== 'unset')) return true;
    if (layer.personalDates.length > 0) return true;
    if (layer.categoryNotes && Object.keys(layer.categoryNotes).length > 0) return true;
  }
  return store.introCompleted;
}

export function resetLayerPreferences(organizationId: string, layer: PreferenceLayer): LifeCulturePreferencesStore {
  return updateLayerPreferences(organizationId, layer, emptyLayerPreferences());
}
