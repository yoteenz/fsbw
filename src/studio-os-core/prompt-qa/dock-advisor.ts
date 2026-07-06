import { explainFindingById, queryPromptQa } from './discovery-engine';
import { explainPromptFinding, explainVersionChange, summarizePromptQa } from './report-engine';
import {
  ensureOrganizationPromptQaProfile,
  getOrganizationPromptQaProfile,
  selectPromptAudit,
} from './store';
import type { PromptQaDockAdvice } from './types';

export function resolvePromptQaAdvice(input: string, organizationId: string): PromptQaDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationPromptQaProfile(organizationId) ?? ensureOrganizationPromptQaProfile(organizationId);

  if (/prompt qa|prompt quality|production.?ready|maintainability|prompt audit/i.test(trimmed)) {
    return {
      response: summarizePromptQa(profile),
      concierge: 'Chief Concierge',
      overallQaScore: profile.overallQaScore,
      findingsOpen: profile.findingsOpen,
    };
  }

  if (/ambiguous|hallucination|circular|conflict|contradict|duplicate prompt/i.test(trimmed)) {
    const match = profile.findings.find((f) => trimmed.toLowerCase().includes(f.issueType.replace(/-/g, ' ').split(' ')[0]));
    if (match) {
      return { response: explainPromptFinding(match), concierge: 'Chief Concierge', findingsOpen: profile.findingsOpen };
    }
  }

  if (/version history|what changed|rollback|who approved|prompt versioning/i.test(trimmed)) {
    const version = profile.versionHistory[0];
    if (version) {
      return { response: explainVersionChange(version), concierge: 'Chief Concierge' };
    }
  }

  if (/profession brain.*prompt|mission.?critical.*prompt|organizational asset/i.test(trimmed)) {
    const brainAudit = profile.auditReports.find((r) => r.source === 'profession-brain') ?? profile.auditReports[0];
    if (brainAudit) {
      selectPromptAudit(organizationId, brainAudit.promptId);
      return { response: brainAudit.qaVerdict, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryPromptQa(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|audit|prompt/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallQaScore: profile.overallQaScore,
    };
  }

  const explainMatch = trimmed.match(/explain (?:finding|issue) (.+)/i);
  if (explainMatch) {
    const found = queryPromptQa(explainMatch[1], profile, 1);
    if (found[0]?.type === 'finding') {
      return { response: explainFindingById(found[0].id, profile) ?? found[0].label, concierge: 'Chief Concierge' };
    }
  }

  return null;
}

export function buildProactivePromptQaSuggestion(organizationId: string): string | null {
  const profile = getOrganizationPromptQaProfile(organizationId);
  if (!profile) return null;
  return summarizePromptQa(profile);
}

export function buildPromptQaOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationPromptQaProfile(organizationId);
  return profile.dockQaLine;
}
