import { studioServiceNotConnected, studioServicePhase2, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  AI_PRODUCTION_INHERITANCE_CHAIN,
  AI_PRODUCTION_QUALITY_THRESHOLD,
  computeQualityScore,
} from '../../../utils/adminStudioAiProductionEngineDemo';
import {
  exportAiProductionSnapshot,
  getAiProductionRunById,
} from '../../../hooks/useAdminStudioAiProductionEngineState';
import { createDefaultProviderStates, resolveDepartmentProvider } from './adapters';
import { getRunProgress } from './pipeline';
import type { AiProductionDepartmentId } from '../../../utils/adminStudioAiProductionEngineDemo';

export type AiProductionEngineSnapshot = ReturnType<typeof exportAiProductionSnapshot>;

export type AiProductionRunReadiness = {
  runId: string;
  title: string;
  progress: number;
  qualityScore: number;
  meetsThreshold: boolean;
  threshold: number;
  revisionNote: string;
  readyForManualPublishing: boolean;
  inheritanceChain: readonly string[];
};

export const aiProductionEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<AiProductionEngineSnapshot>>;
  validateRun(runId: string): Promise<StudioServiceResult<AiProductionRunReadiness>>;
  getDepartmentProvider(departmentId: AiProductionDepartmentId): Promise<StudioServiceResult<{ provider: string; interchangeable: boolean }>>;
  getDefaultProviderStates: typeof createDefaultProviderStates;
} = {
  id: 'ai-production-engine',
  label: 'AI PRODUCTION ENGINE',
  phase: 2,
  enabled: false,
  description:
    'DEPARTMENTAL EXECUTION — STUDIO → AI PRODUCTION ENGINE → PROVIDER ADAPTERS · NO CREATIVE DECISIONS',
  getDefaultProviderStates: createDefaultProviderStates,
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('AI Production Engine requires browser localStorage context.');
    }
    return { ok: true, data: exportAiProductionSnapshot() };
  },
  async validateRun(runId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Run validation requires browser context.');
    }
    const run = getAiProductionRunById(runId);
    if (!run) return studioServicePhase2(`Production run not found: ${runId}`);
    const qualityScore = computeQualityScore(run);
    const meetsThreshold = qualityScore >= AI_PRODUCTION_QUALITY_THRESHOLD;
    return {
      ok: true,
      data: {
        runId: run.id,
        title: run.title,
        progress: getRunProgress(run),
        qualityScore,
        meetsThreshold,
        threshold: AI_PRODUCTION_QUALITY_THRESHOLD,
        revisionNote: run.qualityRevisionNote,
        readyForManualPublishing: run.runStatus === 'draft-complete' && meetsThreshold,
        inheritanceChain: AI_PRODUCTION_INHERITANCE_CHAIN,
      },
    };
  },
  async getDepartmentProvider(departmentId) {
    const provider = resolveDepartmentProvider(departmentId);
    return { ok: true, data: { provider, interchangeable: true } };
  },
};

export { AI_PRODUCTION_INHERITANCE_CHAIN, AI_PRODUCTION_QUALITY_THRESHOLD };
