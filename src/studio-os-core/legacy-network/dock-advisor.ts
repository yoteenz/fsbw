import { summarizeLegacyNetworkProfile } from './legacy-network-builder';
import { summarizeDiscovery } from './discovery-engine';
import { summarizePublishableAssets } from './shareable-assets';
import { summarizeReputation } from './reputation-system';
import { summarizeCommunity } from './community-engine';
import {
  ensureOrganizationLegacyNetworkProfile,
  getOrganizationLegacyNetworkProfile,
} from './store';
import type { LegacyNetworkDockAdvice } from './types';

export function resolveLegacyNetworkAdvice(
  input: string,
  organizationId: string
): LegacyNetworkDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationLegacyNetworkProfile(organizationId) ??
    ensureOrganizationLegacyNetworkProfile(organizationId);

  if (/legacy network|global ecosystem|share expertise|movement|not a marketplace/i.test(trimmed)) {
    return {
      response: summarizeLegacyNetworkProfile(profile),
      concierge: 'Chief Concierge',
      networkMovementScore: profile.networkMovementScore,
      legacyScorePct: profile.legacyScorePct,
    };
  }

  if (/publish|share|contribute|ip ownership|optional|permission/i.test(trimmed)) {
    return {
      response: summarizePublishableAssets(profile.publishableAssetsList),
      concierge: 'Chief Concierge',
      legacyScorePct: profile.legacyScorePct,
    };
  }

  if (/discover|industry|verified|highest rated|newest|popularity/i.test(trimmed)) {
    return {
      response: summarizeDiscovery(profile.discoveredResourcesList),
      concierge: 'Chief Concierge',
    };
  }

  if (/attribution|original organization|founder|license|usage rights|downloads|reviews|adoption/i.test(trimmed)) {
    const asset = profile.publishableAssetsList[0];
    const attr = asset?.attribution;
    return {
      response: attr
        ? `Attribution: ${attr.originalOrganization} · Founder ${attr.founder} · v${attr.version} · ${attr.license} · ${attr.downloads} downloads · ${attr.adoptions} adoptions · ${attr.averageRating}★`
        : 'Every contribution permanently displays attribution — organizations always receive recognition.',
      concierge: 'Chief Concierge',
    };
  }

  if (/community|forum|founder profile|partnership|challenge|award|research/i.test(trimmed)) {
    return {
      response: summarizeCommunity(profile.communityHighlights),
      concierge: 'Chief Concierge',
    };
  }

  if (/reputation|contribution score|legacy score|teaching|trust|impact/i.test(trimmed)) {
    return {
      response: summarizeReputation(profile.reputation),
      concierge: 'Chief Concierge',
      legacyScorePct: profile.legacyScorePct,
    };
  }

  if (/preserve expertise|build legacy|future generation|inherit knowledge/i.test(trimmed)) {
    return {
      response:
        'Organizations preserve knowledge. Communities expand knowledge. Future generations inherit knowledge. Together: PRESERVE EXPERTISE. BUILD LEGACY.',
      concierge: 'Chief Concierge',
      legacyScorePct: profile.legacyScorePct,
    };
  }

  return null;
}

export function listLegacyNetworkDockSuggestions(organizationId: string): string[] {
  ensureOrganizationLegacyNetworkProfile(organizationId);
  return [
    'What can our organization publish to Legacy Network?',
    'Show verified resources in our industry.',
    'How is our Legacy Score and reputation?',
    'Explain Legacy Network attribution and IP ownership.',
  ].slice(0, 4);
}

export function buildProactiveLegacyNetworkSuggestion(organizationId: string): string | null {
  const profile = getOrganizationLegacyNetworkProfile(organizationId);
  if (!profile) return null;
  return summarizeLegacyNetworkProfile(profile);
}

export function buildLegacyNetworkOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationLegacyNetworkProfile(organizationId);
  return profile.dockLegacyLine;
}
