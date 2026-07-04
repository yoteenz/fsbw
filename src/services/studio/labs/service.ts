import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_LABS_SUBTITLE,
  LABS_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioLabsDemo';
import { getLabsExecutivesForWorkspace } from '../../../studio-os-core/labs/labsExecutives';
import { readLabsStore } from '../../../studio-os-core/labs/store';
import { getRuntimeActiveWorkspaceId } from '../../../studio-os-core/workspace/storage';

export type LabsSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readLabsStore>;
  inheritanceChain: readonly string[];
};

export const labsStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<LabsSnapshot>>;
} = {
  id: 'labs',
  label: 'STUDIO OS LABS',
  phase: 2,
  enabled: false,
  description:
    'EXPERIMENT ENGINE · LEARNING ENGINE · HOOK/THUMBNAIL/CAPTION INTEL · DEMO DATA · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Studio OS Labs requires browser localStorage context.');
    }
    const workspaceId = getRuntimeActiveWorkspaceId() ?? 'ai-media';
    return {
      ok: true,
      data: {
        workspaceId,
        store: readLabsStore(),
        inheritanceChain: LABS_INHERITANCE_CHAIN,
      },
    };
  },
};

export {
  ADMIN_STUDIO_LABS_SUBTITLE,
  LABS_INHERITANCE_CHAIN,
  getLabsExecutivesForWorkspace,
};

export type LabsStudioService = typeof labsStudioService;
