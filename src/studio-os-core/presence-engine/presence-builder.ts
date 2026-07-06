import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { atmosphereSummary, buildOrganizationalAtmosphere } from './atmosphere-engine';
import { buildCommunicationStyles } from './communication-style';
import { buildExecutivePresenceMoments } from './presence-moments';
import type { OrganizationPresenceProfile } from './types';

export function computePresenceScore(
  momentsCount: number,
  reassuranceLevel: number,
  atmosphereIntensity: number
): number {
  const momentBoost = Math.min(20, momentsCount * 2);
  return Math.min(98, Math.round(reassuranceLevel * 0.6 + momentBoost + (100 - atmosphereIntensity) * 0.15));
}

export function computeReassuranceLevel(
  cognitiveLoadState: string | undefined,
  pulseScore: number | undefined
): number {
  let base = 72;
  if (cognitiveLoadState === 'light') base += 12;
  if (cognitiveLoadState === 'moderate') base += 6;
  if (cognitiveLoadState === 'elevated') base -= 8;
  if (cognitiveLoadState === 'critical') base -= 15;
  if (pulseScore && pulseScore >= 75) base += 8;
  return Math.min(95, Math.max(40, base));
}

export function buildDockPresenceLine(profile: OrganizationPresenceProfile): string {
  const welcome = profile.presenceMoments.find((m) => m.type === 'daily-welcome');
  const top = profile.presenceMoments.find((m) => m.type !== 'daily-welcome');
  if (top) return `${welcome?.message.split('.')[0] ?? 'Welcome'}. ${top.message}`;
  return welcome?.message ?? "I'm here when you need me — quiet when you don't.";
}

export function buildOrganizationPresenceProfile(organizationId: string): OrganizationPresenceProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const pulse = getOrganizationPulseProfile(organizationId);

  const presenceMoments = buildExecutivePresenceMoments(organizationId, companyName);
  const { styles: communicationStyles, activeContext: activeCommunicationContext } =
    buildCommunicationStyles(organizationId);
  const organizationalAtmosphere = buildOrganizationalAtmosphere(organizationId);
  const reassuranceLevel = computeReassuranceLevel(cognitive?.loadState, pulse?.overallPulseScore);
  const presenceScore = computePresenceScore(
    presenceMoments.length,
    reassuranceLevel,
    organizationalAtmosphere.intensityPct
  );

  const profile: OrganizationPresenceProfile = {
    organizationId,
    companyName,
    industryId: brain?.industryId ?? organizationId,
    updatedAt: new Date().toISOString(),
    presenceScore,
    reassuranceLevel,
    activeCommunicationContext,
    activeAtmosphere: organizationalAtmosphere.state,
    presenceMoments,
    communicationStyles,
    organizationalAtmosphere,
    dockPresenceLine: '',
    neverNoisy: true,
    syncedSources: [
      'founder-cognitive-load',
      'ambient-awareness',
      'organization-pulse',
      'company-health-index',
      'business-discovery-blueprint',
      'profession-brain',
      'living-headquarters-presence',
      'command-dock',
    ],
  };

  profile.dockPresenceLine = buildDockPresenceLine(profile);
  return profile;
}

export function summarizePresenceProfile(profile: OrganizationPresenceProfile): string {
  return [
    profile.dockPresenceLine,
    `Presence ${profile.presenceScore}% · Reassurance ${profile.reassuranceLevel}% · ${profile.organizationalAtmosphere.label} atmosphere.`,
    atmosphereSummary(profile.organizationalAtmosphere),
    `Communication: ${profile.activeCommunicationContext.replace(/-/g, ' ')} — intentional, never noisy.`,
  ].join(' ');
}
