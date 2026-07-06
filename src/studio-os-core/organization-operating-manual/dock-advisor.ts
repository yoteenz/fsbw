import { summarizeOperatingManualProfile } from './operating-manual-builder';
import { summarizeManualDocuments } from './documentation-generator';
import { summarizeLiveSynchronization } from './live-synchronization';
import {
  resolveNaturalLanguageQuery,
  summarizeSearchableOrganization,
} from './searchable-organization';
import {
  ensureOrganizationOperatingManualProfile,
  getOrganizationOperatingManualProfile,
} from './store';
import type { OrganizationOperatingManualDockAdvice } from './types';

export function resolveOrganizationOperatingManualAdvice(
  input: string,
  organizationId: string
): OrganizationOperatingManualDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationOperatingManualProfile(organizationId) ??
    ensureOrganizationOperatingManualProfile(organizationId);

  if (
    /operating manual|organization handbook|single source|operational truth|always current/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeOperatingManualProfile(profile),
      concierge: 'Chief Concierge',
      manualCompletenessScore: profile.manualCompletenessScore,
      documentsGenerated: profile.documentsGenerated,
    };
  }

  if (/updated.*approval|approval workflow|new approval/i.test(trimmed)) {
    return {
      response:
        "I've updated the Operating Manual to reflect your new approval workflow. Approval Workflows and SOP sections synchronized.",
      concierge: 'Chief Concierge',
    };
  }

  if (/regulation|operating procedure|three procedure/i.test(trimmed)) {
    return {
      response:
        'A new regulation required updates to three operating procedures — Policy Library and SOP sections regenerated automatically.',
      concierge: 'Chief Concierge',
    };
  }

  if (/employee handbook|handbook.*synchron/i.test(trimmed)) {
    return {
      response: 'The employee handbook has been synchronized — Employee Handbook, Mission, and Values sections are current.',
      concierge: 'Chief Concierge',
    };
  }

  if (/onboard.*client|refund|approval|customer service|mission|vision|emergency|training/i.test(trimmed)) {
    const answer = resolveNaturalLanguageQuery(trimmed, organizationId, profile.documents, profile.searchableQa, profile.companyName);
    return {
      response: answer?.answer ?? summarizeSearchableOrganization(profile.searchableQa),
      concierge: 'Chief Concierge',
      manualCompletenessScore: profile.manualCompletenessScore,
    };
  }

  if (/sync|synchron|live sync|outdated|duplicate/i.test(trimmed)) {
    return {
      response: summarizeLiveSynchronization(profile.syncEvents),
      concierge: 'Chief Concierge',
    };
  }

  if (/document|charter|sop|policy|glossary|genome|blueprint|brain summary/i.test(trimmed)) {
    return {
      response: summarizeManualDocuments(profile.documents),
      concierge: 'Chief Concierge',
      documentsGenerated: profile.documentsGenerated,
    };
  }

  const nlAnswer = resolveNaturalLanguageQuery(trimmed, organizationId, profile.documents, profile.searchableQa, profile.companyName);
  if (nlAnswer && nlAnswer.confidencePct >= 60) {
    return {
      response: nlAnswer.answer,
      concierge: 'Chief Concierge',
      manualCompletenessScore: profile.manualCompletenessScore,
    };
  }

  return null;
}

export function listOrganizationOperatingManualDockSuggestions(organizationId: string): string[] {
  ensureOrganizationOperatingManualProfile(organizationId);
  return [
    'How do we onboard clients?',
    'What is our refund policy?',
    'How do approvals work?',
    "What's our customer service philosophy?",
  ].slice(0, 4);
}

export function buildProactiveOrganizationOperatingManualSuggestion(organizationId: string): string | null {
  const profile = getOrganizationOperatingManualProfile(organizationId);
  if (!profile) return null;
  return summarizeOperatingManualProfile(profile);
}

export function buildOperatingManualOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationOperatingManualProfile(organizationId);
  return profile.dockManualLine;
}
