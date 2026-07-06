import { getOrganizationQaInspectorProfile } from '../qa-inspector/store';
import { getOrganizationQaSimulationEngineProfile } from '../qa-simulation-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildRecentChallenges } from './challenge-engine';
import {
  buildExposureMetrics,
  buildRedTeamFindings,
  computeRedTeamScore,
  countCriticalFindings,
  countOpenFindings,
} from './red-team-engine';
import type { OrganizationAiRedTeamProfile } from './types';

export function buildDockRedTeamLine(profile: OrganizationAiRedTeamProfile): string {
  return `AI Red Team™ ${profile.redTeamScore}% resilience · ${profile.openFindings} weaknesses exposed · ${profile.challengesRun} challenges run · assume wrong until proven.`;
}

export function buildOrganizationAiRedTeamProfile(organizationId: string): OrganizationAiRedTeamProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const inspector = getOrganizationQaInspectorProfile(organizationId);
  const simulation = getOrganizationQaSimulationEngineProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const findings = buildRedTeamFindings(now);

  if (inspector && inspector.criticalFindings > 0) {
    findings[0].severity = 'critical';
    findings[0].confidencePct = Math.min(99, findings[0].confidencePct + 2);
  }

  if (simulation && simulation.productionGateStatus === 'blocked') {
    const uxFinding = findings.find((f) => f.exposureTarget === 'poor-ux');
    if (uxFinding) uxFinding.severity = 'high';
  }

  const openFindings = countOpenFindings(findings);
  const criticalFindings = countCriticalFindings(findings);
  const recentChallenges = buildRecentChallenges(now);

  const profile: OrganizationAiRedTeamProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    redTeamScore: computeRedTeamScore(findings),
    openFindings,
    criticalFindings,
    challengesRun: recentChallenges.length,
    assumeWrongUntilProven: true,
    findings,
    exposureMetrics: buildExposureMetrics(findings, now),
    recentChallenges,
    dockRedTeamLine: '',
    lastSyncedAt: now,
  };

  profile.dockRedTeamLine = buildDockRedTeamLine(profile);
  return profile;
}

export function summarizeAiRedTeam(profile: OrganizationAiRedTeamProfile): string {
  return `${profile.dockRedTeamLine} Question everything — strengthen before users discover weaknesses.`;
}
