import { explainFindingById, queryVisualDiffEngine } from './discovery-engine';
import { explainVisualDiffFinding, summarizeVisualDiff } from './report-engine';
import {
  ensureOrganizationVisualDiffEngineProfile,
  getOrganizationVisualDiffEngineProfile,
  selectVisualDiffScreen,
} from './store';
import type { VisualDiffEngineDockAdvice } from './types';

export function resolveVisualDiffEngineAdvice(
  input: string,
  organizationId: string
): VisualDiffEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationVisualDiffEngineProfile(organizationId) ??
    ensureOrganizationVisualDiffEngineProfile(organizationId);

  if (/visual diff|visual regression|golden reference|visual memory|looks like studio os/i.test(trimmed)) {
    return {
      response: summarizeVisualDiff(profile),
      concierge: 'Chief Concierge',
      visualMemoryScore: profile.visualMemoryScore,
      diffsDetected: profile.diffsDetected,
    };
  }

  if (/spacing|typography|glass|color drift|shadow|alignment|responsive/i.test(trimmed)) {
    const match = profile.findings.find((f) => trimmed.toLowerCase().includes(f.issueType.replace(/-/g, ' ').split(' ')[0]));
    if (match) {
      return { response: explainVisualDiffFinding(match), concierge: 'Chief Concierge', diffsDetected: profile.diffsDetected };
    }
  }

  if (/screenshot|compare|current build|production|previous build/i.test(trimmed)) {
    const report = profile.visualReports.find((r) => !r.matchesGoldenReference) ?? profile.visualReports[0];
    const comparison = report?.screenshotComparisons[0];
    if (comparison) {
      return { response: comparison.summary, concierge: 'Chief Concierge' };
    }
  }

  if (/no longer looks like studio os|visual identity|brand drift/i.test(trimmed)) {
    const report = profile.visualReports.find((r) => !r.matchesGoldenReference) ?? profile.visualReports[0];
    if (report) {
      selectVisualDiffScreen(organizationId, report.screenId);
      return { response: report.visualIdentityVerdict, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryVisualDiffEngine(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|diff|visual/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      visualMemoryScore: profile.visualMemoryScore,
    };
  }

  const explainMatch = trimmed.match(/explain (?:finding|diff) (.+)/i);
  if (explainMatch) {
    const found = queryVisualDiffEngine(explainMatch[1], profile, 1);
    if (found[0]?.type === 'finding') {
      return { response: explainFindingById(found[0].id, profile) ?? found[0].label, concierge: 'Chief Concierge' };
    }
  }

  return null;
}

export function buildProactiveVisualDiffSuggestion(organizationId: string): string | null {
  const profile = getOrganizationVisualDiffEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeVisualDiff(profile);
}

export function buildVisualDiffOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationVisualDiffEngineProfile(organizationId);
  return profile.dockVisualDiffLine;
}
