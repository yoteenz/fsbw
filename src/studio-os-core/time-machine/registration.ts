import { getOrganizationTimeMachineProfile } from './store';

export function canReplayEvents(organizationId: string): boolean {
  return (getOrganizationTimeMachineProfile(organizationId)?.totalReplayableEvents ?? 0) > 0;
}
