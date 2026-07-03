import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from './types';

export type PsaKnowledgeQueryInput = {
  packId: string;
  question: string;
  context?: string;
};

export type PsaKnowledgeQueryOutput = {
  summary: string;
  recommendedUnits: string[];
  confidence: 'demo';
};

export const psaKnowledgeStudioService: StudioServiceStub & {
  query(_input: PsaKnowledgeQueryInput): Promise<StudioServiceResult<PsaKnowledgeQueryOutput>>;
  syncPackKnowledge(_packId: string): Promise<StudioServiceResult<{ synced: boolean }>>;
} = {
  id: 'psa-knowledge',
  label: 'PSA KNOWLEDGE',
  phase: 2,
  enabled: false,
  description: 'FOUNDER VOICE · UNIT RECOMMENDATIONS · PACK KNOWLEDGE SYNC',
  async query() {
    return studioServiceNotConnected('PSA Knowledge service is not connected. Wire PSA API in Phase 2.');
  },
  async syncPackKnowledge() {
    return studioServiceNotConnected('PSA Knowledge sync is not connected. Wire PSA API in Phase 2.');
  },
};
