import { studioServiceNotConnected, studioServicePhase2, type StudioServiceStub, type StudioServiceResult } from '../types';
import { exportProductionSnapshot, getProductionPackById } from '../../../hooks/useAdminStudioProductionState';
import {
  PRODUCTION_INHERITANCE_CHAIN,
  PRODUCTION_QA_ITEMS,
  getQaCompletionPercent,
  stageIndex,
} from '../../../utils/adminStudioProductionDemo';

export type ProductionSnapshot = ReturnType<typeof exportProductionSnapshot>;

export type ProductionReadiness = {
  packId: string;
  title: string;
  stage: string;
  qaPercent: number;
  qaComplete: boolean;
  postReviewsComplete: boolean;
  readyForPublishing: boolean;
  inheritanceChain: readonly string[];
};

export type ProductionPackContext = {
  packId: string;
  pack: NonNullable<ReturnType<typeof getProductionPackById>>;
  inheritanceChain: readonly string[];
  references: {
    show: string;
    studio: string;
    talent: string;
    campaign: string;
  };
  bypassBlocked: true;
};

export function validateProductionReadiness(packId: string): ProductionReadiness | null {
  const pack = getProductionPackById(packId);
  if (!pack) return null;
  const qaPercent = getQaCompletionPercent(pack.qaChecklist);
  const qaComplete = qaPercent === 100;
  const postReviewsComplete = [
    pack.postCaptions,
    pack.postColor,
    pack.postAudio,
    pack.postBrand,
    pack.postEditorial,
    pack.postThumbnail,
    pack.postJournal,
    pack.postEmail,
    pack.postSeo,
  ].every((s) => s === 'APPROVED' || s === 'COMPLETE');
  const readyForPublishing =
    qaComplete && postReviewsComplete && stageIndex(pack.stage) >= stageIndex('approval');
  return {
    packId: pack.id,
    title: pack.title,
    stage: pack.stage,
    qaPercent,
    qaComplete,
    postReviewsComplete,
    readyForPublishing,
    inheritanceChain: PRODUCTION_INHERITANCE_CHAIN,
  };
}

export function getPackContext(packId: string): ProductionPackContext | null {
  const pack = getProductionPackById(packId);
  if (!pack) return null;
  return {
    packId: pack.id,
    pack,
    inheritanceChain: PRODUCTION_INHERITANCE_CHAIN,
    references: {
      show: pack.showName,
      studio: pack.studioName,
      talent: pack.talentName,
      campaign: pack.campaignName,
    },
    bypassBlocked: true,
  };
}

export const productionStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ProductionSnapshot>>;
  validateReadiness(packId: string): Promise<StudioServiceResult<ProductionReadiness>>;
  getPackContext(packId: string): Promise<StudioServiceResult<ProductionPackContext>>;
} = {
  id: 'production',
  label: 'PRODUCTION PIPELINE',
  phase: 2,
  enabled: false,
  description:
    'CONTENT PACK LIFECYCLE — EVERY ASSET PASSES THROUGH PRODUCTION BEFORE PUBLISHING · PROVIDERS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Production snapshot requires browser localStorage context.');
    }
    return { ok: true, data: exportProductionSnapshot() };
  },
  async validateReadiness(packId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Production validation requires browser context.');
    }
    const result = validateProductionReadiness(packId);
    if (!result) return studioServicePhase2(`Production pack not found: ${packId}`);
    return { ok: true, data: result };
  },
  async getPackContext(packId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Production context requires browser context.');
    }
    const ctx = getPackContext(packId);
    if (!ctx) return studioServicePhase2(`Production pack not found: ${packId}`);
    return { ok: true, data: ctx };
  },
};

export { PRODUCTION_QA_ITEMS };
