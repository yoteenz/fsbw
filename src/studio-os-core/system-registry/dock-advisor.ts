import { findImpactRadius } from './dependency-graph';
import { explainSystem, querySystemRegistry } from './discovery-engine';
import { summarizeSystemRegistry } from './registry-profile-builder';
import { getAllRegisteredSystems } from './registration';
import { listSystemsByCategory } from './registry-builder';
import {
  ensureOrganizationSystemRegistryProfile,
  getOrganizationSystemRegistryProfile,
} from './store';
import type { SystemRegistryDockAdvice } from './types';

export function resolveSystemRegistryAdvice(input: string, organizationId: string): SystemRegistryDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationSystemRegistryProfile(organizationId) ??
    ensureOrganizationSystemRegistryProfile(organizationId);

  if (/system registry|master directory|master index|master registry|what exists in studio os/i.test(trimmed)) {
    return {
      response: summarizeSystemRegistry(profile),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  if (/what depends on|dependencies of|impact of/i.test(trimmed)) {
    const match = trimmed.match(/(?:depends on|dependencies of|impact of)\s+(.+)/i);
    const hits = querySystemRegistry(match?.[1] ?? trimmed, 1);
    if (hits[0]) {
      const impact = findImpactRadius(hits[0].entry.uniqueId);
      return {
        response: `${hits[0].entry.officialName}: upstream ${impact.upstream.length} · downstream ${impact.downstream.length}. ${impact.downstream.slice(0, 3).join(', ') || 'No dependents'}.`,
        concierge: 'Chief Concierge',
      };
    }
  }

  if (/how many systems|how many modules|what categories/i.test(trimmed)) {
    const cats = Object.entries(profile.categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return {
      response: `${profile.totalSystems} systems registered. Categories: ${cats}.`,
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  const explainMatch = trimmed.match(/explain system\s+(.+)/i);
  if (explainMatch) {
    const hits = querySystemRegistry(explainMatch[1], 1);
    if (hits[0]) {
      return {
        response: explainSystem(hits[0].entry.uniqueId) ?? hits[0].entry.description,
        concierge: 'Chief Concierge',
      };
    }
  }

  const hits = querySystemRegistry(trimmed, 3);
  if (hits.length > 0 && /find|search|where is|what is|list|show/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.entry.officialName} (${h.entry.category}): ${h.entry.description.slice(0, 80)}`).join(' '),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  const categoryMatch = trimmed.match(/list\s+(modules|pages|services|concierges|workflows)/i);
  if (categoryMatch) {
    const catMap: Record<string, Parameters<typeof listSystemsByCategory>[0]> = {
      modules: 'module',
      pages: 'page',
      services: 'service',
      concierges: 'concierge',
      workflows: 'workflow',
    };
    const cat = catMap[categoryMatch[1].toLowerCase()];
    if (cat) {
      const list = listSystemsByCategory(cat).slice(0, 5).map((s) => s.officialName).join(', ');
      return { response: `${cat} systems: ${list}…`, concierge: 'Chief Concierge' };
    }
  }

  if (/everything registered|full registry|all systems/i.test(trimmed)) {
    return {
      response: `${getAllRegisteredSystems().length} systems in master directory. Top: ${profile.systems.slice(0, 5).map((s) => s.officialName).join(', ')}.`,
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  return null;
}

export function listSystemRegistryDockSuggestions(_organizationId: string): string[] {
  return [
    'What exists in Studio OS?',
    'Explain system Profession Brain.',
    'What depends on Command Dock?',
    'List all modules in the System Registry.',
  ].slice(0, 4);
}

export function buildProactiveSystemRegistrySuggestion(organizationId: string): string | null {
  const profile = getOrganizationSystemRegistryProfile(organizationId);
  if (!profile) return null;
  return summarizeSystemRegistry(profile);
}

export function buildSystemRegistryOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationSystemRegistryProfile(organizationId);
  return profile.dockRegistryLine;
}
