import type { ReleaseChannelId } from './constants';

export type ReleaseChannelAssignment = {
  organizationId: string;
  releaseChannel: ReleaseChannelId;
  source: 'default' | 'profile' | 'governance-override';
  assignedAt: string;
};

export type ReleaseChannelEligibilityResult = {
  eligible: boolean;
  organizationChannel: ReleaseChannelId;
  requiredChannel: ReleaseChannelId;
  moduleId: string;
  reason: string;
};

export type ReleaseChannelEngineId = 'qa-engine' | 'update-engine' | 'deployment-engine';

export type ReleaseChannelEngineDescriptor = {
  id: ReleaseChannelEngineId;
  title: string;
  moduleIds: string[];
};
