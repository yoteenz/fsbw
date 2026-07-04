import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { PRODUCTION_BUILDER_INHERITANCE_CHAIN } from '../../../utils/adminStudioProductionBuilderDemo';
import { exportProductionBuilderSnapshot } from '../../../hooks/useAdminStudioProductionBuilderState';

export type ProductionBuilderSnapshot = ReturnType<typeof exportProductionBuilderSnapshot>;

export type ProductionBuilderSummary = {
  draftCount: number;
  inheritanceChain: readonly string[];
};

export const productionBuilderStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ProductionBuilderSnapshot>>;
  getSummary(): Promise<StudioServiceResult<ProductionBuilderSummary>>;
} = {
  id: 'production-builder',
  label: 'PRODUCTION BUILDER',
  phase: 2,
  enabled: false,
  description:
    'VISUAL PRODUCTION ASSEMBLY — SCENE BUILDER · PROMPT ASSEMBLY · CONTENT PACK BRIDGE · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Production Builder requires browser context.');
    }
    return { ok: true, data: exportProductionBuilderSnapshot() };
  },
  async getSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Production Builder summary requires browser context.');
    }
    const snap = exportProductionBuilderSnapshot();
    return {
      ok: true,
      data: {
        draftCount: Object.keys(snap.drafts).length,
        inheritanceChain: PRODUCTION_BUILDER_INHERITANCE_CHAIN,
      },
    };
  },
};

export { PRODUCTION_BUILDER_INHERITANCE_CHAIN };
