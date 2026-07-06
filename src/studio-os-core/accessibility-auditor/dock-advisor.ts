import { explainFindingById, queryAccessibilityAuditor } from './discovery-engine';
import { explainAccessibilityFinding, summarizeAccessibilityAuditor } from './report-engine';
import {
  ensureOrganizationAccessibilityAuditorProfile,
  getOrganizationAccessibilityAuditorProfile,
  selectAccessibilityPage,
} from './store';
import type { AccessibilityAuditorDockAdvice } from './types';

export function resolveAccessibilityAuditorAdvice(
  input: string,
  organizationId: string
): AccessibilityAuditorDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationAccessibilityAuditorProfile(organizationId) ??
    ensureOrganizationAccessibilityAuditorProfile(organizationId);

  if (/accessibility|wcag|inclusive|screen reader|keyboard|contrast/i.test(trimmed)) {
    return {
      response: summarizeAccessibilityAuditor(profile),
      concierge: 'Chief Concierge',
      overallAccessibilityScore: profile.overallAccessibilityScore,
      issuesOpen: profile.issuesOpen,
    };
  }

  if (/blind|low vision|color blind|motor|hearing|cognitive|temporary/i.test(trimmed)) {
    const sim = profile.simulations.find((s) => !s.passed) ?? profile.simulations[0];
    if (sim) {
      return { response: sim.summary, concierge: 'Chief Concierge' };
    }
  }

  if (/focus|aria|alt text|touch target|reduced motion/i.test(trimmed)) {
    const match = profile.findings.find((f) => trimmed.toLowerCase().includes(f.issueType.replace(/-/g, ' ').split(' ')[0]));
    if (match) {
      return { response: explainAccessibilityFinding(match), concierge: 'Chief Concierge', issuesOpen: profile.issuesOpen };
    }
  }

  if (/inclusive design|regardless of ability|feels invisible/i.test(trimmed)) {
    const report = profile.pageReports.find((p) => !p.inclusivelyUsable) ?? profile.pageReports[0];
    if (report) {
      selectAccessibilityPage(organizationId, report.pageId);
      return { response: report.accessibilityVerdict, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryAccessibilityAuditor(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|audit|accessibility/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallAccessibilityScore: profile.overallAccessibilityScore,
    };
  }

  const explainMatch = trimmed.match(/explain (?:finding|issue) (.+)/i);
  if (explainMatch) {
    const found = queryAccessibilityAuditor(explainMatch[1], profile, 1);
    if (found[0]?.type === 'finding') {
      return { response: explainFindingById(found[0].id, profile) ?? found[0].label, concierge: 'Chief Concierge' };
    }
  }

  return null;
}

export function buildProactiveAccessibilitySuggestion(organizationId: string): string | null {
  const profile = getOrganizationAccessibilityAuditorProfile(organizationId);
  if (!profile) return null;
  return summarizeAccessibilityAuditor(profile);
}

export function buildAccessibilityAuditorOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationAccessibilityAuditorProfile(organizationId);
  return profile.dockAccessibilityLine;
}
