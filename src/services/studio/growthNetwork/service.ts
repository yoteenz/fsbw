import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_GROWTH_NETWORK_SUBTITLE,
  DEMO_GROWTH_ANALYTICS,
  GROWTH_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioGrowthNetworkDemo';
import { GROWTH_ROADMAP_LABELS } from '../../../studio-os-core/growth-network/constants';
import { roadmapPriorities } from '../../../studio-os-core/growth-network/growthEngine';
import { getGrowthExecutivesForWorkspace } from '../../../studio-os-core/growth-network/growthExecutives';
import { getGrowthProfile, readGrowthNetworkStore } from '../../../studio-os-core/growth-network/store';
import { getRuntimeActiveWorkspaceId } from '../../../studio-os-core/workspace/storage';

export type GrowthNetworkSnapshot = {
  workspaceId: string;
  profile: ReturnType<typeof getGrowthProfile>;
  store: ReturnType<typeof readGrowthNetworkStore>;
  analytics: typeof DEMO_GROWTH_ANALYTICS;
  inheritanceChain: readonly string[];
};

export const growthNetworkStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<GrowthNetworkSnapshot>>;
  getRoadmapPriorities(): Promise<StudioServiceResult<string[]>>;
} = {
  id: 'growth-network',
  label: 'GROWTH NETWORK',
  phase: 2,
  enabled: false,
  description:
    'INTELLIGENT BUSINESS GROWTH — OPPORTUNITIES · PARTNERSHIPS · REVENUE · DEMO DATA · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Growth Network requires browser localStorage context.');
    }
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      ok: true,
      data: {
        workspaceId,
        profile: getGrowthProfile(workspaceId),
        store: readGrowthNetworkStore(),
        analytics: DEMO_GROWTH_ANALYTICS,
        inheritanceChain: GROWTH_INHERITANCE_CHAIN,
      },
    };
  },
  async getRoadmapPriorities() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Growth Network requires browser context.');
    }
    const profile = getGrowthProfile(getRuntimeActiveWorkspaceId());
    if (!profile) {
      return { ok: true, data: [] };
    }
    return { ok: true, data: roadmapPriorities(profile.roadmapStage) };
  },
};

export {
  ADMIN_STUDIO_GROWTH_NETWORK_SUBTITLE,
  DEMO_GROWTH_ANALYTICS,
  GROWTH_INHERITANCE_CHAIN,
  GROWTH_ROADMAP_LABELS,
  getGrowthExecutivesForWorkspace,
  roadmapPriorities,
};

export type GrowthNetworkStudioService = typeof growthNetworkStudioService;
