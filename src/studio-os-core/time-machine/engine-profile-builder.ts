import { getOrganizationExecutiveTrustDashboardProfile } from '../executive-trust-dashboard/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildReplayEvents, computeReplayScore } from './replay-engine';
import {
  buildDefaultFilter,
  buildDockTimeMachineLine,
  buildMomentComparison,
} from './playback-engine';
import type { OrganizationTimeMachineProfile } from './types';

export function buildOrganizationTimeMachineProfile(organizationId: string): OrganizationTimeMachineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const trust = getOrganizationExecutiveTrustDashboardProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const replayEvents = buildReplayEvents(now);
  let replayScore = computeReplayScore(replayEvents);

  if (trust && trust.overallTrustScore >= 85) {
    replayScore = Math.min(99, replayScore + 3);
  }

  const profile: OrganizationTimeMachineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    replayScore,
    totalReplayableEvents: replayEvents.length,
    eventsReconstructed: replayEvents.length,
    playbackState: 'idle',
    currentReplayId: replayEvents[0]?.id ?? null,
    currentStepIndex: 0,
    activeFilter: buildDefaultFilter(),
    replayEvents,
    momentComparison: buildMomentComparison(replayEvents),
    dockTimeMachineLine: '',
    understandWhyNotWhat: true,
    lastSyncedAt: now,
  };

  profile.dockTimeMachineLine = buildDockTimeMachineLine(profile);
  return profile;
}
