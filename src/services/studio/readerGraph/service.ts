import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readReaderGraphStore } from '../../../studio-os-core/reader-graph/store';

export type ReaderGraphSnapshot = ReturnType<typeof readReaderGraphStore>;

export const READER_GRAPH_CHAIN = [
  'DISCOVER',
  'ENGAGE',
  'RETURN',
  'SUBSCRIBE',
  'MEMBER',
  'ADVOCATE',
  'PARTNER',
  'INSTITUTIONAL MEMORY',
] as const;

export const readerGraphStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ReaderGraphSnapshot>>;
} = {
  id: 'reader-graph',
  label: 'READER GRAPH',
  phase: 2,
  enabled: false,
  description: 'LIVING RELATIONSHIPS — READER PROFILES · JOURNEY · COMMUNITIES · TRUST · ADVOCACY',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Reader Graph requires browser context.');
    }
    return { ok: true, data: readReaderGraphStore() };
  },
};
