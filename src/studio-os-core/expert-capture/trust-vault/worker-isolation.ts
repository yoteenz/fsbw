import type { ExpertCaptureProfile } from '../profiles/profile-types';
import type { WorkerIsolationManifest } from './types';

export function resolveWorkerDisplayName(profile: ExpertCaptureProfile, organizationLabel: string): string {
  if (profile.workerDefinition?.workerDisplayName) {
    return profile.workerDefinition.workerDisplayName.replace('{organization}', organizationLabel);
  }
  return `${organizationLabel} ${profile.branding.profession} Professional`;
}

export function buildWorkerIsolationManifest(
  profile: ExpertCaptureProfile,
  organizationLabel: string
): WorkerIsolationManifest {
  const workerName = resolveWorkerDisplayName(profile, organizationLabel);
  return {
    organizationId: profile.companyId,
    organizationLabel,
    workerName,
    workerScope: `${organizationLabel} knowledge only`,
    learnsFrom: `Approved knowledge captured from ${organizationLabel} experts`,
    neverMixesWith: 'Another organization\'s proprietary knowledge — ever',
    publicRegulationSharing: 'intentional_public_sources_only',
    proprietaryIsolation: true,
  };
}

/** Enterprise-ready: professions extend via profile.workerDefinition, never hardcoded profession logic here */
export function assertWorkerIsolation(profileId: string, organizationId: string, targetOrganizationId: string): boolean {
  return organizationId === targetOrganizationId && Boolean(profileId);
}
