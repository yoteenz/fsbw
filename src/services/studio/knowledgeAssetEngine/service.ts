import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readKnowledgeAssetEngineStore } from '../../../studio-os-core/knowledge-asset-engine/store';

export type KnowledgeAssetEngineSnapshot = ReturnType<typeof readKnowledgeAssetEngineStore>;

export const KNOWLEDGE_ASSET_ENGINE_CHAIN = [
  'CREATE',
  'CANONICAL SOURCE',
  'DERIVE',
  'EVOLVE',
  'TEACH',
  'INHERIT',
  'COMPOUND',
] as const;

export const knowledgeAssetEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<KnowledgeAssetEngineSnapshot>>;
} = {
  id: 'knowledge-asset-engine',
  label: 'KNOWLEDGE ASSET ENGINE',
  phase: 2,
  enabled: false,
  description: 'FOUNDATIONAL KNOWLEDGE MODEL — SSOT · EVOLUTION · LINEAGE · ACADEMY',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Knowledge Asset Engine requires browser context.');
    }
    return { ok: true, data: readKnowledgeAssetEngineStore() };
  },
};
