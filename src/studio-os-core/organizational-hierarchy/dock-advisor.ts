import {
  explainHierarchyNode,
  getApprovalRoutingSummary,
  getManagerGapSummary,
  getMatrixSummary,
  getSelectedNodeSummary,
  queryOrganizationalHierarchy,
} from './discovery-engine';
import { summarizeOrganizationalHierarchy } from './hierarchy-builder';
import {
  ensureOrganizationHierarchyProfile,
  getOrganizationHierarchyProfile,
  selectHierarchyNode,
} from './store';
import type { OrganizationalHierarchyDockAdvice } from './types';

export function resolveOrganizationalHierarchyAdvice(
  input: string,
  organizationId: string
): OrganizationalHierarchyDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationHierarchyProfile(organizationId) ?? ensureOrganizationHierarchyProfile(organizationId);

  if (
    /organizational hierarchy|org hierarchy|how.*function|not just.*org chart|matrix organization|holding company|family business|franchise|multi-location/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeOrganizationalHierarchy(profile),
      concierge: 'Chief Concierge',
      hierarchyScore: profile.hierarchyScore,
      nodesMapped: profile.nodesMapped,
    };
  }

  if (/approval.*route|route through|operations before finance/i.test(trimmed)) {
    return {
      response: getApprovalRoutingSummary(profile),
      concierge: 'Chief Concierge',
      hierarchyScore: profile.hierarchyScore,
    };
  }

  if (/supports three departments|matrix support|cross-department/i.test(trimmed)) {
    return {
      response: getMatrixSummary(profile),
      concierge: 'Chief Concierge',
      nodesMapped: profile.nodesMapped,
    };
  }

  if (/no active manager|team has no manager|unmanaged team/i.test(trimmed)) {
    return {
      response: getManagerGapSummary(profile),
      concierge: 'Chief Concierge',
    };
  }

  const explainMatch = trimmed.match(/explain (?:node|team|department|person) (.+)/i);
  if (explainMatch) {
    const hits = queryOrganizationalHierarchy(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'node') {
      selectHierarchyNode(organizationId, hits[0].id);
      return {
        response: explainHierarchyNode(hits[0].id, profile) ?? hits[0].label,
        concierge: 'Chief Concierge',
      };
    }
  }

  const selectedSummary = getSelectedNodeSummary(profile);
  if (selectedSummary && /selected node|current node/i.test(trimmed)) {
    return { response: selectedSummary, concierge: 'Chief Concierge' };
  }

  const hits = queryOrganizationalHierarchy(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|department|team|manager|hierarchy|matrix/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      hierarchyScore: profile.hierarchyScore,
      nodesMapped: profile.nodesMapped,
    };
  }

  const insight = profile.insights.find((i) => trimmed.toLowerCase().includes(i.insight.toLowerCase().slice(0, 24)));
  if (insight) {
    return {
      response: `${insight.insight} Action: ${insight.recommendedAction}`,
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function buildProactiveOrganizationalHierarchySuggestion(organizationId: string): string | null {
  const profile = getOrganizationHierarchyProfile(organizationId);
  if (!profile) return null;
  return summarizeOrganizationalHierarchy(profile);
}

export function buildOrganizationalHierarchyOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationHierarchyProfile(organizationId);
  return profile.dockHierarchyLine;
}
