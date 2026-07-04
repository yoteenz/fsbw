import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { ASSET_DIRECTOR_INHERITANCE_CHAIN, ASSET_DIRECTOR_SECTIONS } from '../../../utils/adminStudioAssetDirectorDemo';
import { exportAssetDirectorSnapshot } from '../../../hooks/useAdminStudioAssetDirectorState';

export type AssetDirectorSnapshot = ReturnType<typeof exportAssetDirectorSnapshot>;

export type AssetDirectorSummary = {
  sectionCount: number;
  inheritanceChain: readonly string[];
};

export const assetDirectorStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<AssetDirectorSnapshot>>;
  getSummary(): Promise<StudioServiceResult<AssetDirectorSummary>>;
} = {
  id: 'asset-director',
  label: 'ASSET DIRECTOR',
  phase: 2,
  enabled: false,
  description:
    'VISUAL SOURCE OF TRUTH — STUDIOS · TALENT · MATERIALS · MOODBOARDS · USAGE MAPS · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Asset Director requires browser context.');
    }
    return { ok: true, data: exportAssetDirectorSnapshot() };
  },
  async getSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Asset Director summary requires browser context.');
    }
    return {
      ok: true,
      data: {
        sectionCount: ASSET_DIRECTOR_SECTIONS.length,
        inheritanceChain: ASSET_DIRECTOR_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ASSET_DIRECTOR_INHERITANCE_CHAIN };
