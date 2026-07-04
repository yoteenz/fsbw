import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { BLUEPRINT_MANAGER_INHERITANCE_CHAIN } from '../../../utils/adminStudioBlueprintManagerDemo';
import { exportBlueprintManagerSnapshot } from '../../../hooks/useAdminStudioBlueprintManagerState';
import { computeBlueprintFactoryStats } from '../../../utils/adminStudioBlueprintManagerDemo';

export type BlueprintManagerSnapshot = ReturnType<typeof exportBlueprintManagerSnapshot>;

export type BlueprintManagerSummary = {
  blueprintCount: number;
  factoryStats: ReturnType<typeof computeBlueprintFactoryStats>;
  inheritanceChain: readonly string[];
};

export const blueprintManagerStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<BlueprintManagerSnapshot>>;
  getSummary(): Promise<StudioServiceResult<BlueprintManagerSummary>>;
} = {
  id: 'blueprint-manager',
  label: 'BLUEPRINT MANAGER',
  phase: 2,
  enabled: false,
  description: 'ASSET FACTORY FOUNDATION — BLUEPRINT SPECIFICATIONS · NO GENERATION · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Blueprint Manager requires browser context.');
    }
    return { ok: true, data: exportBlueprintManagerSnapshot() };
  },
  async getSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Blueprint Manager summary requires browser context.');
    }
    const snap = exportBlueprintManagerSnapshot();
    return {
      ok: true,
      data: {
        blueprintCount: snap.blueprints.length,
        factoryStats: computeBlueprintFactoryStats(snap.blueprints),
        inheritanceChain: BLUEPRINT_MANAGER_INHERITANCE_CHAIN,
      },
    };
  },
};

export { BLUEPRINT_MANAGER_INHERITANCE_CHAIN } from '../../../utils/adminStudioBlueprintManagerDemo';
