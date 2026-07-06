import { summarizeCrossOrgProfile } from './intelligence-builder';
import {
  ensureOrganizationCrossOrgIntelligenceProfile,
  getOrganizationCrossOrgIntelligenceProfile,
} from './store';
import type { CrossOrgIntelligenceDockAdvice } from './types';

export function resolveCrossOrgIntelligenceAdvice(
  input: string,
  organizationId: string
): CrossOrgIntelligenceDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationCrossOrgIntelligenceProfile(organizationId) ??
    ensureOrganizationCrossOrgIntelligenceProfile(organizationId);

  if (
    /cross.?org|collaboration|founder network|intelligent connection|partner organization/i.test(trimmed)
  ) {
    return {
      response: summarizeCrossOrgProfile(profile),
      concierge: 'Chief Concierge',
      collaborationScore: profile.collaborationScore,
      connectionsSuggested: profile.connectionsSuggested,
    };
  }

  if (/design agency|branding|creative capacity|available capacity/i.test(trimmed)) {
    const conn = profile.connectionSuggestions.find((c) => /branding|creative|marketing/i.test(c.title));
    return {
      response: conn
        ? `${conn.needSummary} ${conn.offerSummary} Permission required before connecting.`
        : 'No branding collaboration suggested — expand founder network or enable discoverability.',
      concierge: 'Chief Concierge',
      connectionsSuggested: profile.connectionsSuggested,
    };
  }

  if (/bookkeeping|expert|trusted expert|trucking|supplier/i.test(trimmed)) {
    const conn = profile.connectionSuggestions.find((c) =>
      /bookkeeping|operations|supplier/i.test(c.title)
    );
    return {
      response: conn
        ? `${conn.offerSummary} ${conn.needSummary} Everything permission-based.`
        : 'Scanning trusted network for expertise matches — no automatic sharing.',
      concierge: 'Chief Concierge',
    };
  }

  if (/privacy|permission|visibility|shared resource|never shared/i.test(trimmed)) {
    const privateCount = profile.privacySettings.filter((s) => s.level === 'private').length;
    return {
      response: [
        'Privacy first — private operational knowledge never shared automatically.',
        `${privateCount} control(s) set to private · ${profile.privacySettings.filter((s) => s.level === 'network-only').length} network-only.`,
        'Every organization controls visibility, permissions, published expertise, and collaboration settings.',
      ].join(' '),
      concierge: 'Chief Concierge',
    };
  }

  if (/discoverable|resource|department|profession brain|marketplace/i.test(trimmed)) {
    const resources = profile.discoverableResources.slice(0, 3);
    return {
      response: resources
        .map((r) => `${r.label}: ${r.discoverable ? 'discoverable (authorized)' : 'private'} — ${r.summary.slice(0, 60)}`)
        .join('\n'),
      concierge: 'Chief Concierge',
    };
  }

  if (/network|partner|client|agency|family business|internal compan/i.test(trimmed)) {
    const members = profile.founderNetwork.slice(0, 3);
    return {
      response: members.length
        ? members.map((m) => `${m.organizationName} (${m.networkType.replace(/-/g, ' ')}) — ${m.trustLevel}`).join('\n')
        : 'Founder network empty — add trusted organizations to enable collaboration.',
      concierge: 'Chief Concierge',
      collaborationScore: profile.collaborationScore,
    };
  }

  return null;
}

export function listCrossOrgIntelligenceDockSuggestions(organizationId: string): string[] {
  ensureOrganizationCrossOrgIntelligenceProfile(organizationId);
  return [
    'What cross-organization collaboration opportunities exist?',
    'Who is in my founder network?',
    'What resources are discoverable to partners?',
    'How is my organization\'s privacy protected?',
  ].slice(0, 4);
}

export function buildProactiveCrossOrgSuggestion(organizationId: string): string | null {
  const profile = getOrganizationCrossOrgIntelligenceProfile(organizationId);
  if (!profile) return null;
  return summarizeCrossOrgProfile(profile);
}
