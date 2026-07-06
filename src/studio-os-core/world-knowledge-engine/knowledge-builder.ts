import { ensureOrganizationArchitectureProfile } from '../industry-architecture/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { MONITORING_CATEGORIES } from './constants';
import { buildExecutiveBriefings, summarizeBriefings } from './briefings-engine';
import {
  buildMonitoredSignals,
  filterSignalsForOrganization,
  summarizeFilteredSignals,
} from './monitoring-feed';
import { getIndustryFilterProfile } from './org-filter';
import type { OrganizationWorldKnowledgeProfile } from './types';

export function computeWorldKnowledgeScore(
  signalsSurfaced: number,
  briefingsReady: number,
  avgRelevance: number
): number {
  return Math.min(99, Math.round(signalsSurfaced * 3 + briefingsReady * 5 + avgRelevance * 0.35));
}

export function buildDockWorldLine(profile: OrganizationWorldKnowledgeProfile): string {
  const risk = profile.briefings.find((b) => b.type === 'risk-alert');
  const opp = profile.briefings.find((b) => b.type === 'opportunity-alert');
  const daily = profile.briefings.find((b) => b.type === 'daily');
  const top = profile.filteredSignals[0];

  if (risk) return `A regulation affecting your industry was announced — ${risk.summary.slice(0, 100)}…`;
  if (opp) return `Opportunity detected: ${opp.summary.slice(0, 100)}…`;
  if (top?.category === 'artificial-intelligence') {
    return 'A new AI technology could automate part of your current workflow — review before competitors adopt.';
  }
  if (top?.category === 'competitor-activity') {
    return 'A competitor launched a similar service — differentiation review recommended.';
  }
  if (daily) return daily.summary.slice(0, 140);
  return `${profile.signalsSurfaced} relevant signals filtered — information finds you, not the reverse.`;
}

export function buildOrganizationWorldKnowledgeProfile(
  organizationId: string
): OrganizationWorldKnowledgeProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const arch = ensureOrganizationArchitectureProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = arch.industryId ?? brain?.industryId ?? organizationId;

  const allSignals = buildMonitoredSignals(organizationId, companyName, industryId);
  const filteredSignals = filterSignalsForOrganization(allSignals);
  const briefings = buildExecutiveBriefings(organizationId, companyName, industryId, filteredSignals);
  const industryFilter = getIndustryFilterProfile(industryId);

  const avgRelevance =
    filteredSignals.reduce((sum, s) => sum + s.relevancePct, 0) / Math.max(1, filteredSignals.length);

  const profile: OrganizationWorldKnowledgeProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    worldKnowledgeScore: 0,
    signalsMonitored: MONITORING_CATEGORIES.length,
    signalsSurfaced: filteredSignals.length,
    filteredSignals,
    briefings,
    industryFilterSummary: industryFilter.summary,
    dockWorldLine: '',
    intelligentResearchPartner: true,
    syncedSources: [
      'industry-architecture',
      'profession-brain',
      'business-discovery-blueprint',
      'predictive-organization',
      'executive-timeline-history',
      'organizational-consciousness',
      'command-dock',
    ],
  };

  profile.worldKnowledgeScore = computeWorldKnowledgeScore(
    profile.signalsSurfaced,
    profile.briefings.length,
    avgRelevance
  );
  profile.dockWorldLine = buildDockWorldLine(profile);
  return profile;
}

export function summarizeWorldKnowledgeProfile(profile: OrganizationWorldKnowledgeProfile): string {
  return [
    profile.dockWorldLine,
    `${profile.signalsSurfaced}/${profile.signalsMonitored} categories filtered · world knowledge ${profile.worldKnowledgeScore}%.`,
    profile.industryFilterSummary,
    summarizeFilteredSignals(profile.filteredSignals),
    summarizeBriefings(profile.briefings),
    'World Knowledge Engine™ — your trusted window into the outside world.',
  ].join(' ');
}
