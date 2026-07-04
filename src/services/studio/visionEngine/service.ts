import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_VISION_ENGINE_SUBTITLE,
  DEMO_VISION_ANALYTICS,
  VISION_ENGINE_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioVisionEngineDemo';
import { readVisionEngineStore } from '../../../studio-os-core/vision-engine/store';
import { getRuntimeActiveWorkspaceId } from '../../../studio-os-core/workspace/storage';

export type VisionEngineSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readVisionEngineStore>;
  analytics: typeof DEMO_VISION_ANALYTICS;
  inheritanceChain: readonly string[];
};

export const visionEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<VisionEngineSnapshot>>;
} = {
  id: 'vision-engine',
  label: 'VISION ENGINE',
  phase: 2,
  enabled: false,
  description: 'CINEMATIC PRESENTATION OS — BUILDER · RECORDER · SHARE · ANALYTICS · INTERNAL ONLY',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Vision Engine requires browser localStorage context.');
    }
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      ok: true,
      data: {
        workspaceId,
        store: readVisionEngineStore(),
        analytics: DEMO_VISION_ANALYTICS,
        inheritanceChain: VISION_ENGINE_INHERITANCE_CHAIN,
      },
    };
  },
};

export {
  ADMIN_STUDIO_VISION_ENGINE_SUBTITLE,
  DEMO_VISION_ANALYTICS,
  VISION_ENGINE_INHERITANCE_CHAIN,
};
