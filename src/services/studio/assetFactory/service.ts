import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { ASSET_FACTORY_INHERITANCE_CHAIN } from '../../../utils/adminStudioAssetFactoryDemo';
import { exportAssetFactorySnapshot } from '../../../hooks/useAdminStudioAssetFactoryState';

export type AssetFactorySnapshot = ReturnType<typeof exportAssetFactorySnapshot>;

export type AssetFactorySummary = {
  jobCount: number;
  runningCount: number;
  inheritanceChain: readonly string[];
};

export const assetFactoryStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<AssetFactorySnapshot>>;
  getSummary(): Promise<StudioServiceResult<AssetFactorySummary>>;
} = {
  id: 'asset-factory',
  label: 'ASSET FACTORY',
  phase: 2,
  enabled: false,
  description: 'MANUFACTURING CREATIVE SYSTEMS FROM BLUEPRINTS · DEMO SIMULATION · PROVIDERS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Asset Factory requires browser context.');
    }
    return { ok: true, data: exportAssetFactorySnapshot() };
  },
  async getSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Asset Factory summary requires browser context.');
    }
    const snap = exportAssetFactorySnapshot();
    return {
      ok: true,
      data: {
        jobCount: snap.jobs.length,
        runningCount: snap.jobs.filter((j) => j.status === 'running').length,
        inheritanceChain: ASSET_FACTORY_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ASSET_FACTORY_INHERITANCE_CHAIN };
