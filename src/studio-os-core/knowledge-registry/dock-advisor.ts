import { summarizeDocumentationRegistry } from './registry-profile-builder';
import { queryDocumentationRegistry, explainRegistryFeature } from './smart-search';
import { getAllRegistryEntries } from './registration';
import { buildVersionHistory, listUpcomingFeatures } from './version-history';
import { computeDocumentationHealthMetrics } from './health-dashboard';
import { summarizeWalkthroughSync } from './walkthrough-sync';
import { summarizeAcademySync } from './academy-sync';
import {
  ensureOrganizationDocumentationRegistryProfile,
  getOrganizationDocumentationRegistryProfile,
} from './store';
import type { DocumentationRegistryDockAdvice } from './types';

export function resolveDocumentationRegistryAdvice(
  input: string,
  organizationId: string
): DocumentationRegistryDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationDocumentationRegistryProfile(organizationId) ??
    ensureOrganizationDocumentationRegistryProfile(organizationId);

  if (/documentation registry|registry™|one source|register once|feature registry/i.test(trimmed)) {
    return {
      response: summarizeDocumentationRegistry(profile),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  if (/explain profession brain|how does executive council|teach me knowledge commerce|how does .+ work/i.test(trimmed)) {
    const hits = queryDocumentationRegistry(trimmed, 1);
    if (hits[0]) {
      const explained = explainRegistryFeature(hits[0].entry.internalId);
      return {
        response: explained ?? hits[0].entry.purpose,
        concierge: 'Chief Concierge',
        registryScore: profile.registryScore,
      };
    }
  }

  if (/what changed|latest release|release notes|version history/i.test(trimmed)) {
    const recent = getAllRegistryEntries()
      .filter((e) => e.milestone?.startsWith('M12'))
      .slice(-5)
      .map((e) => `${e.milestone} — ${e.officialName}`)
      .join(' · ');
    const upcoming = listUpcomingFeatures();
    return {
      response: `Recent: ${recent}. ${upcoming.length ? `Upcoming: ${upcoming.join(', ')}` : 'Documentation Registry synchronized.'}`,
      concierge: 'Chief Concierge',
    };
  }

  if (/documentation health|coverage|outdated|broken reference|walkthrough complete/i.test(trimmed)) {
    const metrics = computeDocumentationHealthMetrics();
    return {
      response: metrics.map((m) => `${m.label}: ${m.scorePct}% — ${m.detail}`).join(' '),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  if (/walkthrough sync|academy sync|auto sync/i.test(trimmed)) {
    return {
      response: `${summarizeWalkthroughSync()} ${summarizeAcademySync()}`,
      concierge: 'Chief Concierge',
    };
  }

  const explainMatch = trimmed.match(/explain\s+(.+)/i);
  if (explainMatch) {
    const hits = queryDocumentationRegistry(explainMatch[1], 1);
    if (hits[0]) {
      return {
        response: explainRegistryFeature(hits[0].entry.internalId) ?? hits[0].entry.purpose,
        concierge: 'Chief Concierge',
      };
    }
  }

  const genericHits = queryDocumentationRegistry(trimmed, 3);
  if (genericHits.length > 0 && /how|what|explain|teach|documentation|help/i.test(trimmed)) {
    return {
      response: genericHits.map((h) => `${h.entry.officialName}: ${h.entry.purpose.slice(0, 100)}`).join(' '),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  return null;
}

export function listDocumentationRegistryDockSuggestions(_organizationId: string): string[] {
  return [
    'Explain Profession Brain™.',
    'How does Executive Council™ work?',
    'What changed in the latest release?',
    'Show Documentation Registry health.',
  ].slice(0, 4);
}

export function buildProactiveDocumentationRegistrySuggestion(organizationId: string): string | null {
  const profile = getOrganizationDocumentationRegistryProfile(organizationId);
  if (!profile) return null;
  return summarizeDocumentationRegistry(profile);
}

export function buildDocumentationRegistryOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationDocumentationRegistryProfile(organizationId);
  return profile.dockRegistryLine;
}

export function getFeatureVersionHistoryForDock(internalId: string): string {
  const history = buildVersionHistory(internalId);
  return history.map((v) => `${v.version}: ${v.summary}`).join(' · ');
}
