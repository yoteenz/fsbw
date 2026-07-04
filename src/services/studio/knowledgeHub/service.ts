import { type StudioServiceResult, type StudioServiceStub } from '../types';
import type { KnowledgeMissionStats, KnowledgeSearchHit } from '../../../utils/adminStudioKnowledgeHubDemo';
import { KNOWLEDGE_MISSION_STATS, searchKnowledgeHub } from '../../../utils/adminStudioKnowledgeHubDemo';

export type KnowledgeHubQueryInput = {
  query: string;
  limit?: number;
};

export type KnowledgeHubQueryOutput = {
  hits: KnowledgeSearchHit[];
  stats: KnowledgeMissionStats;
};

export const knowledgeHubStudioService: StudioServiceStub & {
  search(input: KnowledgeHubQueryInput): Promise<StudioServiceResult<KnowledgeHubQueryOutput>>;
} = {
  id: 'knowledge-hub',
  label: 'KNOWLEDGE HUB',
  phase: 2,
  enabled: true,
  description: 'LIVING DOCUMENTATION · OBJECT PROFILES · WORKFLOW GUIDES · SEARCHABLE WIKI',
  async search(input) {
    const hits = searchKnowledgeHub(input.query, input.limit ?? 24);
    return {
      ok: true,
      data: { hits, stats: KNOWLEDGE_MISSION_STATS },
    };
  },
};
