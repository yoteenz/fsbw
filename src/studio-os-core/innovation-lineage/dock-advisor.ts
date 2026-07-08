import {
  ensureOrganizationInnovationLineageProfile,
  getOrganizationInnovationLineageProfile,
} from './store';
import { summarizeInnovationLineage } from './lineage-builder';
import type { InnovationLineageDockAdvice } from './types';

export function resolveInnovationLineageAdvice(
  input: string,
  organizationId: string
): InnovationLineageDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationInnovationLineageProfile(organizationId) ??
    ensureOrganizationInnovationLineageProfile(organizationId);

  if (/innovation lineage|innovation graph|family tree|how it evolved|intellectual equity/i.test(trimmed)) {
    return {
      response: summarizeInnovationLineage(profile),
      concierge: 'Innovation Historian',
      lineageScore: profile.lineageScore,
      influenceScore: profile.founderLegacy.marketplaceInfluence,
    };
  }

  if (/traces back|generations|lineage gallery|museum/i.test(trimmed)) {
    const exhibit = profile.galleryExhibits[0];
    return {
      response: exhibit
        ? `"${exhibit.title}" traces back through ${exhibit.graph.nodes.length} generations. ${exhibit.currentEvolution}`
        : profile.dockLineageLine,
      concierge: 'Innovation Historian',
      lineageScore: profile.lineageScore,
    };
  }

  if (/influenced|companies using|7,000|workflow has/i.test(trimmed)) {
    const listing = profile.marketplaceInventions[0];
    return {
      response: listing
        ? `This invention has influenced ${listing.companiesUsing.toLocaleString()} companies — ${listing.innovationStory}`
        : profile.dockLineageLine,
      concierge: 'Innovation Historian',
      influenceScore: profile.founderLegacy.marketplaceInfluence,
    };
  }

  if (/fork|merge|republish|lineage preserved/i.test(trimmed)) {
    return {
      response: `${profile.forkRecords.length} fork actions recorded — nothing disconnected from history.`,
      concierge: 'Innovation Historian',
    };
  }

  if (/leading contributor|legacy|creative equity|innovation score/i.test(trimmed)) {
    const l = profile.founderLegacy;
    return {
      response: `You've become a leading contributor — Innovation Score ${l.innovationScore}, Creative Equity ${l.creativeEquity}, ${l.companiesHelped.toLocaleString()} companies helped.`,
      concierge: 'Innovation Historian',
      influenceScore: l.marketplaceInfluence,
    };
  }

  return null;
}

export function buildProactiveLineageSuggestion(organizationId: string): string | null {
  const profile = getOrganizationInnovationLineageProfile(organizationId);
  return profile?.dockLineageLine ?? null;
}
