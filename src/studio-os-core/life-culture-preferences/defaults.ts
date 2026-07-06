import type { LayerPreferences, LifeCulturePreferencesStore, PreferenceLayer } from './types';

export function emptyLayerPreferences(): LayerPreferences {
  return {
    communicationStyle: 'professional',
    emotionalTone: '',
    recognitionStyle: '',
    motivationStyle: '',
    humorPreference: 'light',
    seasonalCelebrationsEnabled: false,
    animationPreference: 'full',
    ambientSoundEnabled: false,
    holidayResponses: {},
    sensitiveEventResponses: {},
    personalDates: [],
    categoryNotes: {},
  };
}

export function emptyLifeCultureStore(userScopeId: string, organizationId: string): LifeCulturePreferencesStore {
  const layers = {} as Record<PreferenceLayer, LayerPreferences>;
  (['personal', 'household', 'organization', 'department', 'workspace'] as PreferenceLayer[]).forEach((layer) => {
    layers[layer] = emptyLayerPreferences();
  });
  return {
    version: '1.0.0',
    userScopeId,
    organizationId,
    updatedAt: new Date().toISOString(),
    introCompleted: false,
    layers,
    customTraditions: [],
    discoveryDismissedIds: [],
  };
}
