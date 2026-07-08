import {
  ensureOrganizationInnovationConstellationsProfile,
  getOrganizationInnovationConstellationsProfile,
} from './store';
import { summarizeInnovationConstellations } from './constellations-builder';
import type { InnovationConstellationsDockAdvice } from './types';

export function resolveInnovationConstellationsAdvice(
  input: string,
  organizationId: string
): InnovationConstellationsDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationInnovationConstellationsProfile(organizationId) ??
    ensureOrganizationInnovationConstellationsProfile(organizationId);

  if (/innovation constellation|living universe|knowledge universe|celestial|galaxy|constellation/i.test(trimmed)) {
    return {
      response: summarizeInnovationConstellations(profile),
      concierge: 'Cosmic Guide',
      universeScore: profile.universeScore,
    };
  }

  if (/luxury customer|discover luxury|zoom into/i.test(trimmed)) {
    const cx = profile.universe.constellations.find((c) => c.id === 'customer-experience');
    return {
      response: cx
        ? `Zoom into ${cx.title} — ${cx.influentialStars.join(', ')} · ${cx.emergingStars.length} emerging · ${cx.marketplaceLeaders.length} leaders.`
        : profile.dockCosmicLine,
      concierge: 'Cosmic Guide',
    };
  }

  if (/gap|whitespace|opportunity|underserved|dark area/i.test(trimmed)) {
    const opp = profile.universe.opportunities[0];
    return {
      response: opp ? `${opp.label} — ${opp.reason}` : 'Opportunity Map™ reveals unexplored regions.',
      concierge: 'Cosmic Guide',
    };
  }

  if (/inspired|derivative|twelve|influence this sector/i.test(trimmed)) {
    const star = profile.universe.stars.find((s) => s.descendants >= 2) ?? profile.universe.stars[0];
    return {
      response: star
        ? `"${star.title}" has inspired ${star.descendants} derivative innovations — ${star.influenceLabel}.`
        : profile.dockCosmicLine,
      concierge: 'Cosmic Guide',
    };
  }

  if (/founder.*star|my star|visible mark/i.test(trimmed)) {
    const fs = profile.universe.foundersStar;
    return {
      response: `${fs.founderName}'s Star™ magnitude ${fs.magnitude} — ${fs.planetarySystems.join(', ')}.`,
      concierge: 'Cosmic Guide',
    };
  }

  return null;
}

export function buildProactiveConstellationSuggestion(organizationId: string): string | null {
  return getOrganizationInnovationConstellationsProfile(organizationId)?.dockCosmicLine ?? null;
}
