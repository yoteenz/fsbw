import { HOLIDAY_CATALOG } from './constants';
import type {
  EventResponse,
  LifeCulturePreferencesStore,
  PreferenceLayer,
  ResolvedEventHandling,
  SensitiveEventResponse,
} from './types';

const LAYER_PRIORITY: PreferenceLayer[] = ['personal', 'household', 'organization', 'department', 'workspace'];

function resolveHolidayResponse(
  store: LifeCulturePreferencesStore,
  holidayId: string
): EventResponse {
  for (const layer of LAYER_PRIORITY) {
    const response = store.layers[layer].holidayResponses[holidayId];
    if (response && response !== 'unset') return response;
  }
  return 'unset';
}

function resolveSensitiveResponse(
  store: LifeCulturePreferencesStore,
  eventId: string
): SensitiveEventResponse {
  for (const layer of LAYER_PRIORITY) {
    const response = store.layers[layer].sensitiveEventResponses[eventId];
    if (response && response !== 'unset') return response;
  }
  return 'unset';
}

function handlingFromEventResponse(response: EventResponse, message: string): ResolvedEventHandling {
  switch (response) {
    case 'celebrate':
      return { shouldMention: true, shouldCelebrateEnvironmentally: true, tone: 'celebration', message };
    case 'acknowledge-quietly':
      return { shouldMention: true, shouldCelebrateEnvironmentally: false, tone: 'quiet', message };
    case 'ignore':
      return { shouldMention: false, shouldCelebrateEnvironmentally: false, tone: 'silent', message: null };
    case 'ask-each-time':
      return { shouldMention: false, shouldCelebrateEnvironmentally: false, tone: 'silent', message: null };
    default:
      return { shouldMention: false, shouldCelebrateEnvironmentally: false, tone: 'silent', message: null };
  }
}

function handlingFromSensitiveResponse(
  response: SensitiveEventResponse,
  message: string
): ResolvedEventHandling {
  switch (response) {
    case 'celebrate':
      return { shouldMention: true, shouldCelebrateEnvironmentally: true, tone: 'celebration', message };
    case 'acknowledge-quietly':
      return { shouldMention: true, shouldCelebrateEnvironmentally: false, tone: 'quiet', message };
    case 'supportive-resources':
      return {
        shouldMention: true,
        shouldCelebrateEnvironmentally: false,
        tone: 'quiet',
        message: `${message} Support is available whenever you need it.`,
      };
    case 'silent':
    case 'ask-before':
    case 'unset':
    default:
      return { shouldMention: false, shouldCelebrateEnvironmentally: false, tone: 'silent', message: null };
  }
}

/** Whether generic holiday-season HQ atmosphere is allowed — never assumed. */
export function shouldApplyHolidaySeasonAtmosphere(store: LifeCulturePreferencesStore): boolean {
  const orgEnabled = store.layers.organization.seasonalCelebrationsEnabled;
  const personalEnabled = store.layers.personal.seasonalCelebrationsEnabled;
  if (personalEnabled === false) return false;
  if (orgEnabled) return true;
  return Object.values(store.layers.personal.holidayResponses).some((r) => r === 'celebrate');
}

export function shouldApplySeasonalEnvironment(store: LifeCulturePreferencesStore): boolean {
  if (!store.layers.personal.seasonalCelebrationsEnabled && !store.layers.organization.seasonalCelebrationsEnabled) {
    return false;
  }
  return true;
}

export function resolveOrganizationAnniversaryHandling(
  store: LifeCulturePreferencesStore,
  message: string
): ResolvedEventHandling {
  const orgResponse = resolveHolidayResponse(store, 'org-anniversary');
  if (orgResponse !== 'unset') return handlingFromEventResponse(orgResponse, message);
  const orgLayer = store.layers.organization;
  if (orgLayer.seasonalCelebrationsEnabled) {
    return handlingFromEventResponse('acknowledge-quietly', message);
  }
  return handlingFromEventResponse('unset', message);
}

export function resolveLivingMemoryWithPreferences(
  store: LifeCulturePreferencesStore,
  message: string,
  context: 'organization' | 'personal' | 'milestone'
): string | null {
  if (context === 'organization') {
    const handling = resolveOrganizationAnniversaryHandling(store, message);
    return handling.shouldMention ? handling.message : null;
  }
  if (context === 'milestone') {
    return handlingFromEventResponse(resolveHolidayResponse(store, 'org-anniversary'), message).message;
  }
  return message;
}

export function isHolidayCatalogMatch(now: Date, holidayId: string): boolean {
  const entry = HOLIDAY_CATALOG.find((h) => h.id === holidayId);
  if (!entry || entry.month < 0) return false;
  if (entry.id.includes('season')) {
    return now.getMonth() === entry.month;
  }
  return now.getMonth() === entry.month && now.getDate() === entry.day;
}

export function resolveActiveHolidayAtmosphere(
  store: LifeCulturePreferencesStore,
  now = new Date()
): ResolvedEventHandling | null {
  if (!shouldApplyHolidaySeasonAtmosphere(store)) return null;

  for (const holiday of HOLIDAY_CATALOG) {
    if (holiday.month < 0) continue;
    if (!isHolidayCatalogMatch(now, holiday.id)) continue;
    const response = resolveHolidayResponse(store, holiday.id);
    if (response === 'unset' || response === 'ignore' || response === 'ask-each-time') continue;
    return handlingFromEventResponse(response, `${holiday.label} — recognized with respect.`);
  }
  return null;
}

export function resolveSensitiveEventHandling(
  store: LifeCulturePreferencesStore,
  eventId: string,
  message: string
): ResolvedEventHandling {
  return handlingFromSensitiveResponse(resolveSensitiveResponse(store, eventId), message);
}
