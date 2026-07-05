import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readRelationshipEngineStore } from '../../../studio-os-core/relationship-engine/store';

export type RelationshipEngineSnapshot = ReturnType<typeof readRelationshipEngineStore>;

export const RELATIONSHIP_ENGINE_CHAIN = [
  'DISCOVER',
  'READER',
  'ENGAGED',
  'MEMBER',
  'ADVOCATE',
  'PARTNER',
  'LEGACY',
  'INSTITUTIONAL LEARNING',
] as const;

export const relationshipEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<RelationshipEngineSnapshot>>;
} = {
  id: 'relationship-engine',
  label: 'RELATIONSHIP ENGINE',
  phase: 2,
  enabled: false,
  description: 'ACTIVE RELATIONSHIP OS — NURTURE · TRUST · ADVOCACY · NEXT BEST ACTION',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Relationship Engine requires browser context.');
    }
    return { ok: true, data: readRelationshipEngineStore() };
  },
};
