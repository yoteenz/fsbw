import { getOrganizationQaHeadquartersProfile } from '../qa-headquarters/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildInspectorFindings,
  computeInspectorScore,
  countCriticalFindings,
  countOpenFindings,
} from './inspector-engine';
import type { InspectorAuditRun, OrganizationQaInspectorProfile } from './types';

export function buildDockInspectorLine(profile: OrganizationQaInspectorProfile): string {
  return `QA Inspector™ ${profile.inspectorScore}% · ${profile.openFindings} open findings · ${profile.criticalFindings} critical · recommends only — organization decides.`;
}

function buildRecentAudits(now: string, findingsCount: number, criticalCount: number): InspectorAuditRun[] {
  const iso = (offsetHours: number) => new Date(Date.parse(now) - offsetHours * 3600000).toISOString();
  return [
    {
      id: 'audit-1',
      startedAt: iso(2),
      completedAt: iso(1.8),
      domainsScanned: 10,
      findingsCount,
      criticalCount,
      summary: `Full organization audit complete · ${findingsCount} findings · no silent modifications.`,
    },
    {
      id: 'audit-2',
      startedAt: iso(26),
      completedAt: iso(25.7),
      domainsScanned: 10,
      findingsCount: findingsCount - 2,
      criticalCount: Math.max(0, criticalCount - 1),
      summary: 'Scheduled nightly audit · 2 findings resolved since last run.',
    },
  ];
}

export function buildOrganizationQaInspectorProfile(organizationId: string): OrganizationQaInspectorProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const qaHq = getOrganizationQaHeadquartersProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const findings = buildInspectorFindings(now);
  const openFindings = countOpenFindings(findings);
  const criticalFindings = countCriticalFindings(findings);
  const inspectorScore = computeInspectorScore(findings);

  const profile: OrganizationQaInspectorProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    inspectorScore,
    openFindings,
    criticalFindings,
    lastAuditAt: now,
    findings,
    recentAudits: buildRecentAudits(now, openFindings, criticalFindings),
    dockInspectorLine: '',
    inspectorActive: true,
    neverModifiesSilently: true,
    lastSyncedAt: now,
  };

  if (qaHq && qaHq.activeIssues > 0) {
    profile.inspectorScore = Math.min(profile.inspectorScore, qaHq.overallTrustScore + 5);
  }

  profile.dockInspectorLine = buildDockInspectorLine(profile);
  return profile;
}

export function summarizeQaInspector(profile: OrganizationQaInspectorProfile): string {
  return `${profile.dockInspectorLine} Continuous audit without human intervention.`;
}
