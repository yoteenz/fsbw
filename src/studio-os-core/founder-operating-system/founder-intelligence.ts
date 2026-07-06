import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { getOrganizationRelationshipMemoryProfile } from '../relationship-memory/store';
import { getOrganizationPresenceProfile } from '../presence-engine/store';
import { FOUNDER_INTELLIGENCE_LABELS } from './constants';
import type { FounderIntelligenceDimension, FounderIntelligenceSnapshot } from './types';

function snap(
  dimension: FounderIntelligenceDimension,
  insight: string,
  scorePct: number,
  trend: FounderIntelligenceSnapshot['trend']
): FounderIntelligenceSnapshot {
  return {
    dimension,
    label: FOUNDER_INTELLIGENCE_LABELS[dimension],
    insight,
    scorePct,
    trend,
  };
}

export function buildFounderIntelligenceSnapshots(organizationId: string): FounderIntelligenceSnapshot[] {
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const relationship = getOrganizationRelationshipMemoryProfile(organizationId);
  const presence = getOrganizationPresenceProfile(organizationId);
  const hour = new Date().getHours();

  const cognitiveDemand = cognitive?.cognitiveDemandPct ?? 55;
  const focusProtection = cognitive?.focusProtectionPct ?? 60;
  const pendingDecisions = cognitive?.factorSnapshots.find((f) => f.factor === 'decision-fatigue')?.demandPct ?? 45;
  const meetingLoad = cognitive?.factorSnapshots.find((f) => f.factor === 'meeting-load')?.demandPct ?? 50;
  const creativeLoad = cognitive?.factorSnapshots.find((f) => f.factor === 'creative-workload')?.demandPct ?? 40;

  const creativePref = relationship?.founderPreferences.find((p) => p.type === 'creative-workflow');
  const meetingPref = relationship?.founderPreferences.find((p) => p.type === 'meeting-preferences');
  const workingHours = relationship?.founderPreferences.find((p) => p.type === 'working-hours');

  const creativePeak =
    hour >= 21 || hour <= 1
      ? 'Most productive creative sessions occur between 9 PM and midnight.'
      : creativePref?.learnedPreference.slice(0, 100) ??
        'Creative cycles peak during uninterrupted evening blocks — protect them.';

  return [
    snap(
      'focus-patterns',
      cognitive?.activeAttentionMode === 'strategic-deep-work'
        ? 'Strategic deep work mode detected — operational interruptions filtered.'
        : 'Focus patterns show alternating strategic and operational blocks — batch similar work.',
      focusProtection,
      focusProtection >= 70 ? 'rising' : 'stable'
    ),
    snap(
      'decision-fatigue',
      pendingDecisions >= 70
        ? `High decision load today — ${Math.round(pendingDecisions * 0.45)} executive decisions estimated.`
        : 'Decision load within sustainable range — quality maintained.',
      pendingDecisions,
      pendingDecisions >= 75 ? 'declining' : 'stable'
    ),
    snap(
      'creative-cycles',
      creativePeak,
      100 - creativeLoad,
      creativeLoad < 50 ? 'rising' : 'stable'
    ),
    snap(
      'energy-levels',
      hour >= 6 && hour <= 11
        ? 'Morning energy strong — reserve for highest-leverage decisions.'
        : hour >= 14 && hour <= 17
          ? 'Afternoon energy moderate — delegate operational follow-ups.'
          : 'Evening energy suited to creative and strategic reflection.',
      hour >= 6 && hour <= 11 ? 82 : hour >= 21 ? 78 : 65,
      'stable'
    ),
    snap(
      'meeting-load',
      meetingLoad >= 65
        ? `Meeting load elevated (${meetingLoad}%) — consider consolidating status meetings.`
        : meetingPref?.learnedPreference.slice(0, 100) ?? 'Meeting load balanced — effectiveness maintained.',
      100 - meetingLoad,
      meetingLoad >= 70 ? 'declining' : 'stable'
    ),
    snap(
      'strategic-time',
      cognitiveDemand >= 70
        ? "You've spent significant time in operations — schedule strategic planning blocks."
        : 'Strategic time protected this week — leadership capacity preserved.',
      Math.max(35, 100 - Math.round(cognitiveDemand * 0.6)),
      cognitiveDemand >= 70 ? 'declining' : 'rising'
    ),
    snap(
      'deep-work-sessions',
      cognitive?.activeFilters.some((f) => f.active && f.action === 'protect-focus')
        ? 'Deep work blocks protected — non-critical notifications batched.'
        : 'Recommend two 90-minute deep work sessions this week.',
      focusProtection,
      'stable'
    ),
    snap(
      'learning-goals',
      'Leadership development aligned with Studio Institute™ — one learning goal active.',
      68,
      'rising'
    ),
    snap(
      'leadership-development',
      presence?.dockPresenceLine?.slice(0, 100) ??
        'Continuous leadership development through observation and coaching — not courses alone.',
      72,
      'rising'
    ),
    snap(
      'communication-habits',
      relationship?.founderPreferences.find((p) => p.type === 'communication-style')?.learnedPreference.slice(0, 100) ??
        'Executive summaries preferred — detail available on request.',
      relationship?.familiarityScore ?? 65,
      'stable'
    ),
    snap(
      'stress-indicators',
      cognitive?.loadState === 'critical' || cognitive?.loadState === 'elevated'
        ? 'Stress indicators elevated — recovery time recommended.'
        : 'Stress indicators within healthy range.',
      cognitive?.loadState === 'critical' ? 35 : cognitive?.loadState === 'elevated' ? 55 : 78,
      cognitive?.loadState === 'light' ? 'rising' : 'stable'
    ),
    snap(
      'growth-areas',
      workingHours
        ? `Growth area: ${workingHours.learnedPreference.slice(0, 80)}…`
        : 'Growth areas: delegation · strategic time · meeting effectiveness.',
      70,
      'rising'
    ),
  ];
}

export function summarizeFounderIntelligence(snapshots: FounderIntelligenceSnapshot[]): string {
  const top = snapshots.sort((a, b) => b.scorePct - a.scorePct)[0];
  const concern = snapshots.find((s) => s.scorePct < 55);
  return [
    top ? `${top.label}: ${top.insight.slice(0, 80)}…` : '',
    concern ? `Watch: ${concern.label} (${concern.scorePct}%).` : '',
  ]
    .filter(Boolean)
    .join(' ');
}
