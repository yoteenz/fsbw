import { explainFindingById, queryDesignComplianceEngine } from './discovery-engine';
import { explainFinding, summarizeDesignCompliance } from './report-engine';
import {
  ensureOrganizationDesignComplianceEngineProfile,
  getOrganizationDesignComplianceEngineProfile,
  selectCompliancePage,
} from './store';
import type { DesignComplianceEngineDockAdvice } from './types';

export function resolveDesignComplianceEngineAdvice(
  input: string,
  organizationId: string
): DesignComplianceEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationDesignComplianceEngineProfile(organizationId) ??
    ensureOrganizationDesignComplianceEngineProfile(organizationId);

  if (/design compliance|creative director|feel like studio os|design score|luxury score/i.test(trimmed)) {
    return {
      response: summarizeDesignCompliance(profile),
      concierge: 'Chief Concierge',
      creativeDirectorScore: profile.creativeDirectorScore,
      findingsOpen: profile.findingsOpen,
    };
  }

  if (/spacing|typography|glass|hierarchy|wrong color|visual clutter/i.test(trimmed)) {
    const match = profile.findings.find((f) => trimmed.toLowerCase().includes(f.issueType.replace(/-/g, ' ').split(' ')[0]));
    if (match) {
      return { response: explainFinding(match), concierge: 'Chief Concierge', findingsOpen: profile.findingsOpen };
    }
  }

  if (/recognize.*studio os|apple.*pixar|luxury design/i.test(trimmed)) {
    const page = profile.pageReports.find((p) => !p.recognizedAsStudioOs) ?? profile.pageReports[0];
    if (page) {
      selectCompliancePage(organizationId, page.pageId);
      return { response: page.creativeDirectorVerdict, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryDesignComplianceEngine(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|audit|design/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      creativeDirectorScore: profile.creativeDirectorScore,
    };
  }

  const explainMatch = trimmed.match(/explain (?:finding|issue) (.+)/i);
  if (explainMatch) {
    const found = queryDesignComplianceEngine(explainMatch[1], profile, 1);
    if (found[0]?.type === 'finding') {
      return { response: explainFindingById(found[0].id, profile) ?? found[0].label, concierge: 'Chief Concierge' };
    }
  }

  return null;
}

export function buildProactiveDesignComplianceSuggestion(organizationId: string): string | null {
  const profile = getOrganizationDesignComplianceEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeDesignCompliance(profile);
}

export function buildDesignComplianceOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationDesignComplianceEngineProfile(organizationId);
  return profile.dockComplianceLine;
}
