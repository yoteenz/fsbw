import { useCallback, useMemo, useState } from 'react';
import {
  buildGentleDiscoveryPrompts,
  deleteLifeCulturePreferences,
  exportLifeCulturePreferences,
  markLifeCultureIntroComplete,
  readLifeCulturePreferencesStore,
  setHolidayResponse,
  setSensitiveEventResponse,
  updateLayerPreferences,
  type CommunicationStyle,
  type EventResponse,
  type LifeCulturePreferencesStore,
  type PreferenceLayer,
  type SensitiveEventResponse,
  COMMUNICATION_STYLE_LABELS,
  EVENT_RESPONSE_LABELS,
  HOLIDAY_CATALOG,
  LAYER_LABELS,
  LIFE_CULTURE_INTRO_FOOTER,
  PRIVACY_NOTICE,
  SENSITIVE_EVENT_CATALOG,
  SENSITIVE_EVENT_RESPONSE_LABELS,
} from '../studio-os-core/life-culture-preferences';

export function useLifeCulturePreferencesState(organizationId: string) {
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((r) => r + 1), []);

  const store = useMemo(
    () => readLifeCulturePreferencesStore(organizationId),
    [organizationId, revision]
  );

  const discoveryPrompts = useMemo(() => buildGentleDiscoveryPrompts(store), [store]);

  const patchLayer = useCallback(
    (layer: PreferenceLayer, patch: Parameters<typeof updateLayerPreferences>[2]) => {
      updateLayerPreferences(organizationId, layer, patch);
      refresh();
    },
    [organizationId, refresh]
  );

  const setHoliday = useCallback(
    (layer: PreferenceLayer, holidayId: string, response: EventResponse) => {
      setHolidayResponse(organizationId, layer, holidayId, response);
      refresh();
    },
    [organizationId, refresh]
  );

  const setSensitive = useCallback(
    (layer: PreferenceLayer, eventId: string, response: SensitiveEventResponse) => {
      setSensitiveEventResponse(organizationId, layer, eventId, response);
      refresh();
    },
    [organizationId, refresh]
  );

  const completeIntro = useCallback(() => {
    markLifeCultureIntroComplete(organizationId);
    refresh();
  }, [organizationId, refresh]);

  const exportPreferences = useCallback(() => exportLifeCulturePreferences(organizationId), [organizationId]);

  const deletePreferences = useCallback(() => {
    deleteLifeCulturePreferences(organizationId);
    refresh();
  }, [organizationId, refresh]);

  return {
    store,
    discoveryPrompts,
    patchLayer,
    setHoliday,
    setSensitive,
    completeIntro,
    exportPreferences,
    deletePreferences,
    refresh,
  };
}

export type LifeCulturePreferencesController = ReturnType<typeof useLifeCulturePreferencesState>;

export {
  COMMUNICATION_STYLE_LABELS,
  EVENT_RESPONSE_LABELS,
  HOLIDAY_CATALOG,
  LAYER_LABELS,
  LIFE_CULTURE_INTRO_FOOTER,
  PRIVACY_NOTICE,
  SENSITIVE_EVENT_CATALOG,
  SENSITIVE_EVENT_RESPONSE_LABELS,
};
export type { CommunicationStyle, LifeCulturePreferencesStore, PreferenceLayer, EventResponse, SensitiveEventResponse };
