import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_SIMULATION_ENGINE_SUBTITLE,
  SIMULATION_ENGINE_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioSimulationEngineDemo';
import { readSimulationEngineStore } from '../../../studio-os-core/simulation-engine/store';
import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';

export type SimulationEngineSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readSimulationEngineStore>;
  inheritanceChain: readonly string[];
};

export const simulationEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<SimulationEngineSnapshot>>;
} = {
  id: 'simulation-engine',
  label: 'SIMULATION ENGINE',
  phase: 2,
  enabled: false,
  description:
    'MODEL DECISIONS BEFORE COMMITTING · SCENARIO COMPARISON · NOT PREDICTIONS · DEMO DATA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Simulation Engine requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        workspaceId: AI_MEDIA_WORKSPACE_ID,
        store: readSimulationEngineStore(),
        inheritanceChain: SIMULATION_ENGINE_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ADMIN_STUDIO_SIMULATION_ENGINE_SUBTITLE, SIMULATION_ENGINE_INHERITANCE_CHAIN };

export type SimulationEngineStudioService = typeof simulationEngineStudioService;
