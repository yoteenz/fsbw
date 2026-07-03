import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from './types';

export type PublishingTarget = {
  channelId: string;
  packId: string;
};

export type PublishingJobOutput = {
  jobId: string;
  status: 'draft';
};

export const publishingStudioService: StudioServiceStub & {
  publishPack(_packId: string, _targets: PublishingTarget[]): Promise<StudioServiceResult<PublishingJobOutput>>;
  unpublishPack(_packId: string): Promise<StudioServiceResult<{ removed: boolean }>>;
} = {
  id: 'publishing',
  label: 'PUBLISHING',
  phase: 2,
  enabled: false,
  description: 'MULTI-CHANNEL PACK RELEASE · LOUNGE + EMAIL + SOCIAL',
  async publishPack() {
    return studioServiceNotConnected('Publishing is not connected. Wire publishing pipeline in Phase 2.');
  },
  async unpublishPack() {
    return studioServiceNotConnected('Unpublish is not connected. Wire publishing pipeline in Phase 2.');
  },
};
