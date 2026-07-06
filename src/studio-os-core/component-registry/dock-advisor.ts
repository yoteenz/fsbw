import { explainComponent, queryComponentRegistry, listComponentsUsedOn } from './discovery-engine';
import { summarizeComponentRegistry } from './registry-profile-builder';
import { listComponentsByCategory } from './registry-builder';
import {
  ensureOrganizationComponentRegistryProfile,
  getOrganizationComponentRegistryProfile,
} from './store';
import type { ComponentRegistryDockAdvice } from './types';

export function resolveComponentRegistryAdvice(input: string, organizationId: string): ComponentRegistryDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationComponentRegistryProfile(organizationId) ??
    ensureOrganizationComponentRegistryProfile(organizationId);

  if (/component registry|reusable component|design system|assemble interfaces/i.test(trimmed)) {
    return {
      response: summarizeComponentRegistry(profile),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  if (/which card|which panel|reusable card|reusable panel/i.test(trimmed)) {
    const cards = listComponentsByCategory('card').slice(0, 4).map((c) => c.officialName).join(', ');
    const panels = listComponentsByCategory('panel').slice(0, 3).map((c) => c.officialName).join(', ');
    return {
      response: `Cards: ${cards}. Panels: ${panels}. Use Executive IA primitives — never recreate.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/mission control widget|legacy wing panel/i.test(trimmed)) {
    const widgets = listComponentsByCategory('mission-control-widget').slice(0, 4).map((c) => c.officialName).join(', ');
    return {
      response: `Mission Control widgets: ${widgets}. Pattern: ExecutiveSecondaryCard + HealthRing + eiaActionBtn.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainMatch = trimmed.match(/explain component\s+(.+)/i);
  if (explainMatch) {
    const hits = queryComponentRegistry(explainMatch[1], 1);
    if (hits[0]) {
      return {
        response: explainComponent(hits[0].entry.componentId) ?? hits[0].entry.description,
        concierge: 'Chief Concierge',
      };
    }
  }

  if (/used on mission control|components for/i.test(trimmed)) {
    const used = listComponentsUsedOn('mission-control').slice(0, 5).map((c) => c.officialName).join(', ');
    return { response: `Mission Control uses: ${used}.`, concierge: 'Chief Concierge' };
  }

  const hits = queryComponentRegistry(trimmed, 3);
  if (hits.length > 0 && /find|search|list|show|what component/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.entry.officialName} (${h.entry.category}, reuse ${h.entry.reuseScore}%)`).join(' · '),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  return null;
}

export function listComponentRegistryDockSuggestions(_organizationId: string): string[] {
  return [
    'Show Component Registry status.',
    'Which reusable cards should I use?',
    'Explain component ExecutiveHeroCard.',
    'List Mission Control widgets.',
  ].slice(0, 4);
}

export function buildProactiveComponentRegistrySuggestion(organizationId: string): string | null {
  const profile = getOrganizationComponentRegistryProfile(organizationId);
  if (!profile) return null;
  return summarizeComponentRegistry(profile);
}

export function buildComponentRegistryOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationComponentRegistryProfile(organizationId);
  return profile.dockRegistryLine;
}
