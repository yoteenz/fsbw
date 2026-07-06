import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildExecutiveCoachingInsights, summarizeCoachingInsights } from './coaching-engine';
import { buildFocusProtectionActions, summarizeFocusActions } from './focus-management';
import { buildFounderIntelligenceSnapshots, summarizeFounderIntelligence } from './founder-intelligence';
import { buildPersonalDashboardMetrics, summarizePersonalDashboard } from './personal-dashboard';
import type { OrganizationFounderOperatingSystemProfile } from './types';

export function computeFounderEffectivenessScore(
  focusScore: number,
  leadershipGrowth: number,
  executiveHealth: number,
  burnoutRisk: number
): number {
  return Math.min(
    99,
    Math.round(focusScore * 0.3 + leadershipGrowth * 0.25 + executiveHealth * 0.25 + (100 - burnoutRisk) * 0.2)
  );
}

export function buildDockFounderLine(profile: OrganizationFounderOperatingSystemProfile): string {
  const strategic = profile.founderIntelligence.find((s) => s.dimension === 'strategic-time');
  const decisions = profile.founderIntelligence.find((s) => s.dimension === 'decision-fatigue');
  const creative = profile.founderIntelligence.find((s) => s.dimension === 'creative-cycles');
  const topCoach = profile.coachingInsights[0];

  if (strategic && strategic.scorePct < 55) {
    return "You've spent 78% of your week in operations. I recommend scheduling strategic planning time.";
  }
  if (decisions && decisions.scorePct >= 70) {
    return "You've made many executive decisions today. I'll postpone non-critical approvals until tomorrow.";
  }
  if (creative) {
    return "I've noticed your most productive creative sessions occur between 9 PM and midnight.";
  }
  if (topCoach) return topCoach.recommendation;
  return 'Founder Operating System™ active — calmer, wiser, more focused leadership.';
}

export function buildOrganizationFounderOperatingSystemProfile(
  organizationId: string
): OrganizationFounderOperatingSystemProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const founderIntelligence = buildFounderIntelligenceSnapshots(organizationId);
  const coachingInsights = buildExecutiveCoachingInsights(organizationId, founderIntelligence);
  const focusActions = buildFocusProtectionActions(organizationId);
  const personalDashboard = buildPersonalDashboardMetrics(organizationId, founderIntelligence);

  const profile: OrganizationFounderOperatingSystemProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    founderEffectivenessScore: 0,
    founderIntelligence,
    coachingInsights,
    focusActions,
    personalDashboard,
    dockFounderLine: '',
    operatesTheFounder: true,
    syncedSources: [
      'founder-cognitive-load',
      'relationship-memory',
      'presence-engine',
      'company-health-index',
      'world-knowledge-engine',
      'executive-timeline-history',
      'studio-institute',
      'command-dock',
    ],
  };

  profile.founderEffectivenessScore = computeFounderEffectivenessScore(
    profile.personalDashboard.focusScorePct,
    profile.personalDashboard.leadershipGrowthPct,
    profile.personalDashboard.executiveHealthPct,
    profile.personalDashboard.burnoutRiskPct
  );
  profile.dockFounderLine = buildDockFounderLine(profile);
  return profile;
}

export function summarizeFounderOperatingSystemProfile(
  profile: OrganizationFounderOperatingSystemProfile
): string {
  return [
    profile.dockFounderLine,
    `Founder effectiveness ${profile.founderEffectivenessScore}% · ${summarizePersonalDashboard(profile.personalDashboard)}`,
    summarizeFounderIntelligence(profile.founderIntelligence),
    summarizeCoachingInsights(profile.coachingInsights),
    summarizeFocusActions(profile.focusActions),
    'Founders grow first. Organizations follow. EMPOWER VISIONARIES.',
  ].join(' ');
}
