import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  EXPANSION_CENTER_CHAIN,
  EXPANSION_CENTER_SUBTITLE,
} from '../../../utils/adminStudioExpansionCenterDemo';
import {
  ensureOrganizationArchitectureProfile,
  readIndustryArchitectureStore,
} from '../../../studio-os-core/industry-architecture';
import { getRuntimeActiveWorkspaceId } from '../../../studio-os-core/workspace/storage';

export type ExpansionCenterSnapshot = {
  workspaceId: string;
  profile: ReturnType<typeof ensureOrganizationArchitectureProfile>;
  store: ReturnType<typeof readIndustryArchitectureStore>;
  chain: readonly string[];
};

export const expansionCenterStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ExpansionCenterSnapshot>>;
} = {
  id: 'expansion-center',
  label: 'EXPANSION CENTER',
  phase: 2,
  enabled: false,
  description: 'INDUSTRY ARCHITECTURE · DEPARTMENT PACKS · HEADQUARTERS EXPANSION · DEMO DATA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Expansion Center requires browser localStorage context.');
    }
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      ok: true,
      data: {
        workspaceId,
        profile: ensureOrganizationArchitectureProfile(workspaceId),
        store: readIndustryArchitectureStore(),
        chain: EXPANSION_CENTER_CHAIN,
      },
    };
  },
};

export { EXPANSION_CENTER_SUBTITLE, EXPANSION_CENTER_CHAIN };

export type ExpansionCenterStudioService = typeof expansionCenterStudioService;
