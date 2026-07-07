import {
  DEFAULT_ORGANIZATION_RELEASE_CHANNELS,
  MODULE_MINIMUM_RELEASE_CHANNELS,
  RELEASE_CHANNEL_ORDER,
  type ReleaseChannelId,
} from './constants';
import type { ReleaseChannelAssignment, ReleaseChannelEligibilityResult } from './types';

const DEFAULT_CHANNEL: ReleaseChannelId = 'stable';

export function resolveOrganizationReleaseChannel(
  organizationId: string,
  profileChannel?: ReleaseChannelId | null
): ReleaseChannelAssignment {
  const now = new Date().toISOString();
  if (profileChannel) {
    return {
      organizationId,
      releaseChannel: profileChannel,
      source: 'profile',
      assignedAt: now,
    };
  }
  const defaultChannel = DEFAULT_ORGANIZATION_RELEASE_CHANNELS[organizationId] ?? DEFAULT_CHANNEL;
  return {
    organizationId,
    releaseChannel: defaultChannel,
    source: 'default',
    assignedAt: now,
  };
}

export function getMinimumReleaseChannelForModule(moduleId: string): ReleaseChannelId {
  return MODULE_MINIMUM_RELEASE_CHANNELS[moduleId] ?? DEFAULT_CHANNEL;
}

export function isChannelAtLeast(
  organizationChannel: ReleaseChannelId,
  requiredChannel: ReleaseChannelId
): boolean {
  return RELEASE_CHANNEL_ORDER[organizationChannel] >= RELEASE_CHANNEL_ORDER[requiredChannel];
}

export function checkModuleReleaseChannelEligibility(
  organizationId: string,
  moduleId: string,
  profileChannel?: ReleaseChannelId | null
): ReleaseChannelEligibilityResult {
  const assignment = resolveOrganizationReleaseChannel(organizationId, profileChannel);
  const requiredChannel = getMinimumReleaseChannelForModule(moduleId);
  const eligible = isChannelAtLeast(assignment.releaseChannel, requiredChannel);
  return {
    eligible,
    organizationChannel: assignment.releaseChannel,
    requiredChannel,
    moduleId,
    reason: eligible
      ? `${moduleId} eligible on ${assignment.releaseChannel} channel.`
      : `${moduleId} requires ${requiredChannel}; organization is on ${assignment.releaseChannel}.`,
  };
}
