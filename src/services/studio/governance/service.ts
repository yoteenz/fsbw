import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_GOVERNANCE_SUBTITLE,
  GOVERNANCE_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioGovernanceDemo';
import { readGovernanceStore } from '../../../studio-os-core/governance/store';
import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';

export type GovernanceSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readGovernanceStore>;
  inheritanceChain: readonly string[];
};

export const governanceStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<GovernanceSnapshot>>;
} = {
  id: 'governance',
  label: 'STUDIO OS GOVERNANCE',
  phase: 2,
  enabled: false,
  description:
    'TRUST · QUALITY · COMPLIANCE · MODERATION · VERIFICATION · ECOSYSTEM HEALTH · DEMO DATA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Governance requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        workspaceId: AI_MEDIA_WORKSPACE_ID,
        store: readGovernanceStore(),
        inheritanceChain: GOVERNANCE_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ADMIN_STUDIO_GOVERNANCE_SUBTITLE, GOVERNANCE_INHERITANCE_CHAIN };

export type GovernanceStudioService = typeof governanceStudioService;
