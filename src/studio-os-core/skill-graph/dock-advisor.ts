import { explainSkillById, querySkillGraph } from './discovery-engine';
import { summarizeSkillGraph } from './graph-builder';
import {
  ensureOrganizationSkillGraphProfile,
  getOrganizationSkillGraphProfile,
  selectSkill,
} from './store';
import type { SkillGraphDockAdvice } from './types';

export function resolveSkillGraphAdvice(input: string, organizationId: string): SkillGraphDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationSkillGraphProfile(organizationId) ?? ensureOrganizationSkillGraphProfile(organizationId);

  if (/skill graph|who knows|who can teach|organizational skill|searchable asset|invisible knowledge/i.test(trimmed)) {
    return {
      response: summarizeSkillGraph(profile),
      concierge: 'Chief Concierge',
      graphScore: profile.graphScore,
      skillsTracked: profile.skillsTracked,
    };
  }

  if (/lacks|no certified|could mentor|department lacks/i.test(trimmed)) {
    const match = profile.insights.find((i) => trimmed.toLowerCase().includes(i.insight.toLowerCase().slice(0, 20)));
    if (match) {
      return { response: `${match.insight} Action: ${match.recommendedAction}`, concierge: 'Chief Concierge' };
    }
    return {
      response: profile.insights.map((i) => i.insight).join(' · '),
      concierge: 'Chief Concierge',
      skillsTracked: profile.skillsTracked,
    };
  }

  const explainMatch = trimmed.match(/explain skill (.+)/i);
  if (explainMatch) {
    const hits = querySkillGraph(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'skill') {
      selectSkill(organizationId, hits[0].id);
      return { response: explainSkillById(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = querySkillGraph(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|skill|mentor|expertise|who/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      graphScore: profile.graphScore,
      skillsTracked: profile.skillsTracked,
    };
  }

  return null;
}

export function buildProactiveSkillGraphSuggestion(organizationId: string): string | null {
  const profile = getOrganizationSkillGraphProfile(organizationId);
  if (!profile) return null;
  return summarizeSkillGraph(profile);
}

export function buildSkillGraphOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationSkillGraphProfile(organizationId);
  return profile.dockSkillLine;
}
