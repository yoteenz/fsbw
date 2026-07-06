import { explainFindingById, queryExperienceQa } from './discovery-engine';
import { explainExperienceFinding, summarizeExperienceQa } from './report-engine';
import {
  ensureOrganizationExperienceQaProfile,
  getOrganizationExperienceQaProfile,
  selectExperiencePage,
} from './store';
import type { ExperienceQaDockAdvice } from './types';

export function resolveExperienceQaAdvice(input: string, organizationId: string): ExperienceQaDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationExperienceQaProfile(organizationId) ?? ensureOrganizationExperienceQaProfile(organizationId);

  if (/experience qa|emotional quality|experience score|feels effortless|confidence not clicks/i.test(trimmed)) {
    return {
      response: summarizeExperienceQa(profile),
      concierge: 'Chief Concierge',
      overallExperienceScore: profile.overallExperienceScore,
      findingsOpen: profile.findingsOpen,
    };
  }

  if (/overwhelm|friction|calm|premium|confusion|decision fatigue/i.test(trimmed)) {
    const match = profile.findings.find((f) => trimmed.toLowerCase().includes(f.issueType.replace(/-/g, ' ').split(' ')[0]));
    if (match) {
      return { response: explainExperienceFinding(match), concierge: 'Chief Concierge', findingsOpen: profile.findingsOpen };
    }
  }

  if (/simulate|first.?time|executive|mobile|accessibility user/i.test(trimmed)) {
    const sim = profile.simulations.find((s) => !s.passed) ?? profile.simulations[0];
    if (sim) {
      return { response: sim.summary, concierge: 'Chief Concierge' };
    }
  }

  if (/feel like studio os|emotionally calm|build confidence/i.test(trimmed)) {
    const page = profile.pageReports.find((p) => !p.feelsEffortless) ?? profile.pageReports[0];
    if (page) {
      selectExperiencePage(organizationId, page.pageId);
      return { response: page.experienceVerdict, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryExperienceQa(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|audit|experience/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallExperienceScore: profile.overallExperienceScore,
    };
  }

  const explainMatch = trimmed.match(/explain (?:finding|issue) (.+)/i);
  if (explainMatch) {
    const found = queryExperienceQa(explainMatch[1], profile, 1);
    if (found[0]?.type === 'finding') {
      return { response: explainFindingById(found[0].id, profile) ?? found[0].label, concierge: 'Chief Concierge' };
    }
  }

  return null;
}

export function buildProactiveExperienceQaSuggestion(organizationId: string): string | null {
  const profile = getOrganizationExperienceQaProfile(organizationId);
  if (!profile) return null;
  return summarizeExperienceQa(profile);
}

export function buildExperienceQaOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationExperienceQaProfile(organizationId);
  return profile.dockExperienceLine;
}
