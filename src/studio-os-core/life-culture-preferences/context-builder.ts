import { resolveCommunicationStyle } from './communication-style';
import {
  resolveOrganizationAnniversaryHandling,
  shouldApplyHolidaySeasonAtmosphere,
  shouldApplySeasonalEnvironment,
} from './event-resolver';
import { readLifeCulturePreferencesStore } from './store';
import type { LifeCultureContext, LifeCulturePreferencesStore } from './types';

export function buildLifeCultureContext(organizationId: string): LifeCultureContext {
  const store = readLifeCulturePreferencesStore(organizationId);
  const communicationStyle = resolveCommunicationStyle([
    store.layers.personal,
    store.layers.organization,
    store.layers.workspace,
  ]);

  return {
    store,
    communicationStyle,
    allowSeasonalEnvironment: shouldApplySeasonalEnvironment(store),
    allowHolidayEnvironment: shouldApplyHolidaySeasonAtmosphere(store),
  };
}

export function applyPreferencesToLivingMemory(
  ctx: LifeCultureContext,
  message: string | null,
  isOrganizationFounding: boolean
): string | null {
  if (!message) return null;
  if (isOrganizationFounding) {
    const handling = resolveOrganizationAnniversaryHandling(ctx.store, message);
    return handling.shouldMention ? handling.message : null;
  }
  return message;
}

export function applyPreferencesToCelebrationMessage(
  ctx: LifeCultureContext,
  message: string | null
): string | null {
  if (!message) return null;
  if (!ctx.allowHolidayEnvironment && message.toLowerCase().includes('holiday')) return null;
  return message;
}

export function filterLivingHeadquartersEffects(
  ctx: LifeCultureContext,
  effects: {
    crystalIllumination: boolean;
    floralAccent: boolean;
    frostAccent: boolean;
    goldenHour: boolean;
    commemorativeDisplay: boolean;
  },
  atmosphereMode: string
): typeof effects {
  if (!ctx.allowSeasonalEnvironment) {
    return {
      crystalIllumination: false,
      floralAccent: false,
      frostAccent: effects.frostAccent,
      goldenHour: false,
      commemorativeDisplay: false,
    };
  }

  if (!ctx.allowHolidayEnvironment && atmosphereMode === 'holiday') {
    return {
      ...effects,
      crystalIllumination: false,
      floralAccent: false,
      commemorativeDisplay: false,
    };
  }

  if (atmosphereMode === 'anniversary') {
    const handling = resolveOrganizationAnniversaryHandling(ctx.store, '');
    if (!handling.shouldCelebrateEnvironmentally) {
      return { ...effects, commemorativeDisplay: false, crystalIllumination: false };
    }
  }

  return effects;
}

export type { LifeCulturePreferencesStore };
