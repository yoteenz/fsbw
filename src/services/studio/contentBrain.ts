import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from './types';
import { exportContentBrainSnapshot } from '../../hooks/useAdminStudioContentBrainState';

export type ContentBrainQueryInput = {
  section?: string;
  topic?: string;
};

export type ContentBrainQueryOutput = {
  snapshot: ReturnType<typeof exportContentBrainSnapshot>;
  source: 'content-brain-local';
};

export const contentBrainStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ContentBrainQueryOutput>>;
  query(_input: ContentBrainQueryInput): Promise<StudioServiceResult<ContentBrainQueryOutput>>;
} = {
  id: 'content-brain',
  label: 'CONTENT BRAIN',
  phase: 2,
  enabled: false,
  description: 'BRAND BIBLE · SHOW BIBLE · EDITORIAL BRAIN — SINGLE SOURCE OF TRUTH FOR AI GENERATION',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Content Brain snapshot requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        snapshot: exportContentBrainSnapshot(),
        source: 'content-brain-local',
      },
    };
  },
  async query() {
    return studioServiceNotConnected(
      'Content Brain AI query is not connected. Future providers will read snapshot before generation.'
    );
  },
};
