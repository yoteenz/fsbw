import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readNdxbookNewsroomStore } from '../../../studio-os-core/ndxbook/newsroom/store';

export type NdxbookNewsroomSnapshot = ReturnType<typeof readNdxbookNewsroomStore>;

export const NDXBOOK_NEWSROOM_INHERITANCE_CHAIN = [
  'MISSION CONTROL',
  'CHIEF OF STAFF',
  'NEWSROOM',
  'DEPARTMENTS',
  'PAGE WORKSPACE',
  'INSTITUTIONAL KNOWLEDGE',
] as const;

export const ndxbookNewsroomStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<NdxbookNewsroomSnapshot>>;
} = {
  id: 'ndxbook-newsroom',
  label: 'NEWSROOM',
  phase: 2,
  enabled: false,
  description: 'PRODUCTION FLOOR — VISUAL PIPELINE · PAGE WORKSPACE · OPERATIONAL DNA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Newsroom requires browser context.');
    }
    return { ok: true, data: readNdxbookNewsroomStore() };
  },
};
