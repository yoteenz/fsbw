import { summarizePresenceProfile } from './presence-builder';
import { ensureOrganizationPresenceProfile, getOrganizationPresenceProfile } from './store';
import type { PresenceEngineDockAdvice } from './types';

export function resolvePresenceEngineAdvice(
  input: string,
  organizationId: string
): PresenceEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationPresenceProfile(organizationId) ?? ensureOrganizationPresenceProfile(organizationId);

  if (/presence engine|executive presence|how does studio feel|organizational atmosphere|reassurance/i.test(trimmed)) {
    return {
      response: summarizePresenceProfile(profile),
      concierge: 'Chief Concierge',
      presenceScore: profile.presenceScore,
      atmosphere: profile.activeAtmosphere,
    };
  }

  if (/welcome|good morning|good afternoon|daily greeting/i.test(trimmed)) {
    const welcome = profile.presenceMoments.find((m) => m.type === 'daily-welcome');
    return {
      response: welcome?.message ?? profile.dockPresenceLine,
      concierge: 'Chief Concierge',
      presenceScore: profile.presenceScore,
    };
  }

  if (/celebrate|milestone|accomplish|achievement|anniversary/i.test(trimmed)) {
    const moment = profile.presenceMoments.find((m) =>
      ['celebrate-milestone', 'acknowledge-accomplishment', 'anniversary', 'employee-achievement', 'customer-milestone'].includes(
        m.type
      )
    );
    return {
      response: moment?.message ?? 'Every milestone matters — recognized professionally, never theatrically.',
      concierge: 'Chief Concierge',
      presenceScore: profile.presenceScore,
    };
  }

  if (/encourage|difficult|demanding|support/i.test(trimmed)) {
    const moment = profile.presenceMoments.find((m) =>
      ['encouragement', 'recognize-difficult-period'].includes(m.type)
    );
    return {
      response: moment?.message ?? "I'm here — steady progress matters more than perfect days.",
      concierge: 'Chief Concierge',
    };
  }

  if (/communication style|busy day|creative|strategic|learning mode|emergency/i.test(trimmed)) {
    const active = profile.communicationStyles.find((s) => s.active);
    return {
      response: active
        ? `${active.label}: ${active.styleDescription} ${active.examplePhrase}`
        : `Communication adjusted for ${profile.activeCommunicationContext.replace(/-/g, ' ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/atmosphere|headquarters feel|momentum|calm|energized|focused/i.test(trimmed)) {
    const atm = profile.organizationalAtmosphere;
    return {
      response: `${atm.label} — ${atm.description} ${atm.headquartersCue}`,
      concierge: 'Chief Concierge',
      atmosphere: atm.state,
    };
  }

  return null;
}

export function listPresenceEngineDockSuggestions(organizationId: string): string[] {
  ensureOrganizationPresenceProfile(organizationId);
  return [
    'How is organizational presence feeling today?',
    'What executive presence moments are active?',
    'What communication style are you using right now?',
    'Describe the Headquarters atmosphere',
  ].slice(0, 4);
}

export function buildProactivePresenceSuggestion(organizationId: string): string | null {
  const profile = getOrganizationPresenceProfile(organizationId);
  if (!profile) return null;
  return summarizePresenceProfile(profile);
}

export function buildQuietPresenceGreeting(organizationId: string): string {
  const profile = ensureOrganizationPresenceProfile(organizationId);
  return profile.dockPresenceLine;
}
