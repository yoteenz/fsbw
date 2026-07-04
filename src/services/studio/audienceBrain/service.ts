import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  AUDIENCE_FEEDBACK_LOOP_TARGETS,
  AUDIENCE_INHERITANCE_CHAIN,
  AUDIENCE_PREDICTIONS,
  AUDIENCE_RECOMMENDATIONS,
  confidenceLabel,
} from '../../../utils/adminStudioAudienceBrainDemo';
import { exportAudienceBrainSnapshot } from '../../../hooks/useAdminStudioAudienceBrainState';

export type AudienceBrainSnapshot = ReturnType<typeof exportAudienceBrainSnapshot>;

export type AudienceBrainFeed = {
  recommendations: typeof AUDIENCE_RECOMMENDATIONS;
  predictions: typeof AUDIENCE_PREDICTIONS;
  feedbackTargets: readonly string[];
  privacyMode: 'aggregated-only';
  inheritanceChain: readonly string[];
};

export const audienceBrainStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<AudienceBrainSnapshot>>;
  getCreativeFeed(): Promise<StudioServiceResult<AudienceBrainFeed>>;
  getRecommendation(id: string): Promise<StudioServiceResult<(typeof AUDIENCE_RECOMMENDATIONS)[number] | null>>;
} = {
  id: 'audience-brain',
  label: 'AUDIENCE BRAIN',
  phase: 2,
  enabled: false,
  description:
    'CUSTOMER INTELLIGENCE & LEARNING — AGGREGATED ANALYTICS · EVIDENCE-BACKED RECOMMENDATIONS · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Audience Brain requires browser localStorage context.');
    }
    return { ok: true, data: exportAudienceBrainSnapshot() };
  },
  async getCreativeFeed() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Audience feed requires browser context.');
    }
    return {
      ok: true,
      data: {
        recommendations: AUDIENCE_RECOMMENDATIONS,
        predictions: AUDIENCE_PREDICTIONS,
        feedbackTargets: AUDIENCE_FEEDBACK_LOOP_TARGETS,
        privacyMode: 'aggregated-only',
        inheritanceChain: AUDIENCE_INHERITANCE_CHAIN,
      },
    };
  },
  async getRecommendation(id) {
    const rec = AUDIENCE_RECOMMENDATIONS.find((r) => r.id === id) ?? null;
    return { ok: true, data: rec };
  },
};

export { AUDIENCE_FEEDBACK_LOOP_TARGETS, AUDIENCE_INHERITANCE_CHAIN, confidenceLabel };
