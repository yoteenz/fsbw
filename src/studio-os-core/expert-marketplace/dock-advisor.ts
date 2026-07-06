import { discoverExperts, listDiscoverySuggestions } from './discovery-engine';
import {
  ensureOrganizationExpertMarketplaceProfile,
  listPublicExpertCatalog,
} from './store';
import type { ExpertMarketplaceDockAdvice } from './types';

export function resolveExpertMarketplaceAdvice(
  input: string,
  organizationId: string
): ExpertMarketplaceDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/expert marketplace|find an expert|trusted expert/i.test(trimmed)) {
    const catalog = listPublicExpertCatalog();
    return {
      response: `Expert Marketplace™ · ${catalog.length} published expert${catalog.length === 1 ? '' : 's'} · Share expertise. Expand your legacy.`,
      concierge: 'Chief Concierge',
    };
  }

  const profile = ensureOrganizationExpertMarketplaceProfile(organizationId);
  if (/publish.*expert|share expertise/i.test(trimmed) && profile) {
    return {
      response: `${profile.publishedCount} expert profile${profile.publishedCount === 1 ? '' : 's'} published · ${profile.pendingApprovalCount} awaiting approval. Private operational knowledge stays protected until you approve.`,
      concierge: 'Chief Concierge',
    };
  }

  const catalog = listPublicExpertCatalog();
  const matches = discoverExperts(catalog, {
    specialty: trimmed,
    topic: trimmed,
    profession: trimmed,
  });

  if (matches.length > 0 && /expert|consult|learn from/i.test(trimmed)) {
    const top = matches[0];
    return {
      response: `Discovered ${top.expertName} · ${top.organizationName} · ${top.trustDisclaimer}`,
      concierge: 'Chief Concierge',
      expertId: top.id,
    };
  }

  return null;
}

export function listExpertMarketplaceDockSuggestions(organizationId: string): string[] {
  const suggestions = listDiscoverySuggestions();
  const profile = ensureOrganizationExpertMarketplaceProfile(organizationId);
  if (profile && profile.publishedCount === 0) {
    return ['Publish an expert from Profession Brain.', ...suggestions.slice(0, 2)];
  }
  return suggestions;
}
