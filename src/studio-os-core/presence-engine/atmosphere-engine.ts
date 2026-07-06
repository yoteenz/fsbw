import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { ATMOSPHERE_STATE_DESCRIPTIONS, ATMOSPHERE_STATE_LABELS, ATMOSPHERE_STATES } from './constants';
import type { AtmosphereState, OrganizationalAtmosphereSnapshot } from './types';

function resolveAtmosphereState(organizationId: string): AtmosphereState {
  const pulse = getOrganizationPulseProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);

  if (cognitive?.loadState === 'critical') return 'focused';
  if (pulse?.pulseState === 'critical' || pulse?.pulseState === 'strained') return 'focused';
  if (blueprint && blueprint.overallProgressPct >= 80) return 'energized';
  if (blueprint && blueprint.milestonesCelebrated.length >= 2) return 'celebratory';
  if (health && health.executiveHealthScore >= 72 && pulse && pulse.overallPulseScore >= 70) return 'calm';
  if (pulse?.pulseState === 'thriving' || pulse?.pulseState === 'growing') return 'celebratory';
  return 'calm';
}

const HEADQUARTERS_CUES: Record<(typeof ATMOSPHERE_STATES)[number], string> = {
  calm: 'Soft ambient rhythm · steady organizational pulse · no urgency signals',
  celebratory: 'Subtle milestone warmth · professional recognition · never theatrical',
  energized: 'Launch momentum visible · departments aligned · forward motion felt',
  focused: 'Reduced ambient activity · priority signals only · calm under pressure',
};

export function buildOrganizationalAtmosphere(organizationId: string): OrganizationalAtmosphereSnapshot {
  const state = resolveAtmosphereState(organizationId);
  const pulse = getOrganizationPulseProfile(organizationId);

  const intensityPct =
    state === 'focused'
      ? 85
      : state === 'energized'
      ? 78
      : state === 'celebratory'
      ? 65
      : 45;

  return {
    state,
    label: ATMOSPHERE_STATE_LABELS[state],
    description: ATMOSPHERE_STATE_DESCRIPTIONS[state],
    headquartersCue: HEADQUARTERS_CUES[state],
    intensityPct: pulse ? Math.round((intensityPct + pulse.overallPulseScore) / 2) : intensityPct,
  };
}

export function atmosphereSummary(snapshot: OrganizationalAtmosphereSnapshot): string {
  return `${snapshot.label} atmosphere — ${snapshot.headquartersCue}`;
}
