import { explainFinding, queryQaInspector } from './discovery-engine';
import { summarizeQaInspector } from './engine-profile-builder';
import {
  ensureOrganizationQaInspectorProfile,
  getOrganizationQaInspectorProfile,
  runFullInspectorAudit,
} from './store';
import type { QaInspectorDockAdvice } from './types';

export function resolveQaInspectorAdvice(input: string, organizationId: string): QaInspectorDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationQaInspectorProfile(organizationId) ?? ensureOrganizationQaInspectorProfile(organizationId);

  if (/qa inspector|inspector audit|continuous audit|inspect organization/i.test(trimmed)) {
    return {
      response: summarizeQaInspector(profile),
      concierge: 'Chief Concierge',
      openFindings: profile.openFindings,
    };
  }

  if (/run audit|full audit|scan organization/i.test(trimmed)) {
    runFullInspectorAudit(organizationId);
    return {
      response: 'Full QA Inspector audit complete — findings recommend only · organization decides.',
      concierge: 'Chief Concierge',
      openFindings: profile.openFindings,
    };
  }

  if (/critical findings|blocking issues|permission conflict/i.test(trimmed)) {
    const critical = profile.findings.filter((f) => f.severity === 'critical' && f.status !== 'resolved');
    if (critical.length === 0) {
      return { response: 'No critical findings open — inspector monitoring continuously.', concierge: 'Chief Concierge' };
    }
    return {
      response: critical.map((f) => `${f.issueLabel}: ${f.recommendedSolution}`).join(' · '),
      concierge: 'Chief Concierge',
      openFindings: profile.openFindings,
    };
  }

  const explainMatch = trimmed.match(/explain finding (.+)/i);
  if (explainMatch) {
    const hits = queryQaInspector(explainMatch[1], profile, 1);
    if (hits[0]) {
      return { response: explainFinding(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryQaInspector(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      openFindings: profile.openFindings,
    };
  }

  return null;
}

export function buildProactiveQaInspectorSuggestion(organizationId: string): string | null {
  const profile = getOrganizationQaInspectorProfile(organizationId);
  if (!profile) return null;
  return summarizeQaInspector(profile);
}

export function buildQaInspectorOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationQaInspectorProfile(organizationId);
  return profile.dockInspectorLine;
}
