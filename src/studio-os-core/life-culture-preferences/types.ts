/** Life & Culture Preferences™ — respectful personalization layers for Studio Intelligence™. */

export type PreferenceLayer = 'personal' | 'household' | 'organization' | 'department' | 'workspace';

export type EventResponse = 'unset' | 'celebrate' | 'acknowledge-quietly' | 'ignore' | 'ask-each-time';

export type SensitiveEventResponse =
  | 'unset'
  | 'celebrate'
  | 'acknowledge-quietly'
  | 'silent'
  | 'ask-before'
  | 'supportive-resources';

export type CommunicationStyle =
  | 'executive'
  | 'professional'
  | 'teacher'
  | 'coach'
  | 'advisor'
  | 'encouraging'
  | 'minimal'
  | 'friendly'
  | 'collaborative';

export type PreferenceCategory =
  | 'religious-spiritual'
  | 'cultural-traditions'
  | 'family-traditions'
  | 'personal-milestones'
  | 'organization-milestones'
  | 'company-traditions'
  | 'holiday-preferences'
  | 'celebration-preferences'
  | 'recognition-style'
  | 'motivation-style'
  | 'communication-style'
  | 'humor-preference'
  | 'emotional-tone'
  | 'visual-theme'
  | 'animation'
  | 'ambient-sound'
  | 'accessibility';

export type PersonalDateEntry = {
  id: string;
  label: string;
  month: number;
  day: number;
  response: SensitiveEventResponse;
  notes?: string;
};

export type LayerPreferences = {
  communicationStyle: CommunicationStyle;
  emotionalTone: string;
  recognitionStyle: string;
  motivationStyle: string;
  humorPreference: 'none' | 'light' | 'warm';
  seasonalCelebrationsEnabled: boolean;
  animationPreference: 'full' | 'reduced' | 'none';
  ambientSoundEnabled: boolean;
  holidayResponses: Record<string, EventResponse>;
  sensitiveEventResponses: Record<string, SensitiveEventResponse>;
  personalDates: PersonalDateEntry[];
  categoryNotes: Partial<Record<PreferenceCategory, string>>;
};

export type LifeCulturePreferencesStore = {
  version: string;
  userScopeId: string;
  organizationId: string;
  updatedAt: string;
  introCompleted: boolean;
  layers: Record<PreferenceLayer, LayerPreferences>;
  customTraditions: Array<{
    id: string;
    label: string;
    month?: number;
    day?: number;
    response: EventResponse;
    layer: PreferenceLayer;
  }>;
  discoveryDismissedIds: string[];
};

export type ResolvedEventHandling = {
  shouldMention: boolean;
  shouldCelebrateEnvironmentally: boolean;
  tone: 'celebration' | 'quiet' | 'silent';
  message: string | null;
};

export type LifeCultureContext = {
  store: LifeCulturePreferencesStore;
  communicationStyle: CommunicationStyle;
  allowSeasonalEnvironment: boolean;
  allowHolidayEnvironment: boolean;
};
