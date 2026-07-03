import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { createDefaultAdapterStates } from './adapters';
import {
  planOrchestratorRun,
  simulateDemoPackaging,
  retryStep,
  advanceApproval,
  canPublish,
  createEmptyPack,
} from './pipeline';
import type { OrchestratorRunInput, OrchestratedContentPack } from './types';

export const aiOrchestratorStudioService: StudioServiceStub & {
  getDefaultAdapterStates: typeof createDefaultAdapterStates;
  planRun(input: OrchestratorRunInput): Promise<StudioServiceResult<OrchestratedContentPack>>;
  packageDemo(topic: string): Promise<StudioServiceResult<OrchestratedContentPack>>;
  retryStep(
    pack: OrchestratedContentPack,
    stepId: string
  ): Promise<StudioServiceResult<OrchestratedContentPack>>;
  setApprovalStatus(
    pack: OrchestratedContentPack,
    status: OrchestratedContentPack['approvalStatus']
  ): Promise<StudioServiceResult<OrchestratedContentPack>>;
  validatePublish(pack: OrchestratedContentPack): Promise<StudioServiceResult<{ allowed: boolean; reason: string }>>;
  createPack(packId: string, topic: string): Promise<StudioServiceResult<OrchestratedContentPack>>;
} = {
  id: 'ai-orchestrator',
  label: 'AI ORCHESTRATOR',
  phase: 2,
  enabled: false,
  description:
    'PRODUCTION TEAM — STUDIO → ORCHESTRATOR → ADAPTERS · OPENAI · FAL · OPENART · VOICE · EMAIL',
  getDefaultAdapterStates: createDefaultAdapterStates,
  async planRun(input) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('AI Orchestrator requires browser context.');
    }
    return { ok: true, data: planOrchestratorRun(input) };
  },
  async packageDemo(topic) {
    if (typeof window === 'undefined') return studioServiceNotConnected('Packaging requires browser context.');
    return { ok: true, data: simulateDemoPackaging(topic) };
  },
  async retryStep(pack, stepId) {
    return { ok: true, data: retryStep(pack, stepId) };
  },
  async setApprovalStatus(pack, status) {
    return { ok: true, data: advanceApproval(pack, status) };
  },
  async validatePublish(pack) {
    return { ok: true, data: canPublish(pack) };
  },
  async createPack(packId, topic) {
    return { ok: true, data: createEmptyPack(packId, topic) };
  },
};

export {
  planOrchestratorRun,
  simulateDemoPackaging,
  retryStep,
  advanceApproval,
  canPublish,
  createEmptyPack,
  getPipelineProgress,
} from './pipeline';
export { PROVIDER_ADAPTERS, createDefaultAdapterStates } from './adapters';
export type * from './types';
