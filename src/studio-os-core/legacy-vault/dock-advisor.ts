import { listProactivePreserveMessages, detectPreserveMoments } from './moment-detector';
import { categoryLabel } from './vault-builder';
import {
  dismissPreserveSuggestion,
  ensureOrganizationLegacyVaultProfile,
  getOrganizationLegacyVaultProfile,
  preserveLegacyMoment,
  queuePreserveMomentSuggestion,
} from './store';
import type { LegacyVaultDockAdvice } from './types';

export function resolveLegacyVaultAdvice(
  input: string,
  organizationId: string
): LegacyVaultDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationLegacyVaultProfile(organizationId) ?? ensureOrganizationLegacyVaultProfile(organizationId);

  const moment = detectPreserveMoments(trimmed);
  if (moment) {
    queuePreserveMomentSuggestion(organizationId, trimmed);
    return {
      response: `${moment.message}\n\nWould you like to preserve "${moment.suggestedTitle}" in the Legacy Vault™? Reply "preserve legacy" to archive this moment permanently.`,
      concierge: 'Chief Concierge',
      preserveSuggestion: moment,
      legacyDepthScore: profile.legacyDepthScore,
    };
  }

  if (/preserve legacy|save to vault|archive this moment|add to legacy vault/i.test(trimmed)) {
    const pending = profile.pendingPreserveSuggestions[0];
    if (pending) {
      preserveLegacyMoment(organizationId, pending.suggestedTitle, pending.message, pending.category);
      dismissPreserveSuggestion(organizationId, pending.id);
      return {
        response: `Preserved in Legacy Vault™: "${pending.suggestedTitle}" — ${categoryLabel(pending.category)}. History never overwritten; versions preserved forever. PRESERVE EXPERTISE. BUILD LEGACY.`,
        concierge: 'Chief Concierge',
        legacyDepthScore: profile.legacyDepthScore + 3,
      };
    }
    return {
      response: 'Describe the moment to preserve — milestones, launches, firsts, founder reflections. Studio OS recognizes history worth keeping.',
      concierge: 'Chief Concierge',
      legacyDepthScore: profile.legacyDepthScore,
    };
  }

  if (/legacy vault|organizational history|founder archive|time capsule|version history/i.test(trimmed)) {
    return {
      response:
        `Legacy Vault™ — ${profile.totalArchiveEntries} archive entries · ${profile.versionHistoryCount} versions · ${profile.timeCapsulesSealed} sealed time capsules · ${profile.founderArchiveCount} founder reflections. Legacy depth ${profile.legacyDepthScore}%. The permanent memory of your organization.`,
      concierge: 'Chief Concierge',
      legacyDepthScore: profile.legacyDepthScore,
    };
  }

  if (/what.*preserved|show archive|organization story|company history/i.test(trimmed)) {
    const recent = profile.archiveEntries[0];
    return {
      response: recent
        ? `Latest: ${recent.title} — ${recent.summary.slice(0, 120)}. ${profile.totalArchiveEntries} moments preserved. Experience the journey in Legacy Vault™.`
        : 'Legacy Vault building — preserve founding blueprint, milestones, and founder reflections.',
      concierge: 'Chief Concierge',
      legacyDepthScore: profile.legacyDepthScore,
    };
  }

  return null;
}

export function listLegacyVaultDockSuggestions(organizationId: string): string[] {
  ensureOrganizationLegacyVaultProfile(organizationId);
  return [
    "Today's milestone may be worth preserving — open Legacy Vault™",
    'Show what is preserved in our organizational history',
    'Create a time capsule for our 10th anniversary',
    'Add a founder reflection to the archive',
  ].slice(0, 4);
}

export function buildProactiveLegacyVaultSuggestion(organizationId: string): string | null {
  const profile = getOrganizationLegacyVaultProfile(organizationId);
  if (!profile) return null;

  const pending = profile.pendingPreserveSuggestions[0];
  if (pending) {
    return pending.message;
  }

  const messages = listProactivePreserveMessages(profile.legacyDepthScore);
  if (profile.totalArchiveEntries < 5) {
    return messages[2];
  }

  return messages[0];
}
