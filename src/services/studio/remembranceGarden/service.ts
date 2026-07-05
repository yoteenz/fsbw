import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readRemembranceGardenStore } from '../../../studio-os-core/remembrance-garden/store';

export type RemembranceGardenSnapshot = ReturnType<typeof readRemembranceGardenStore>;

export const REMEMBRANCE_GARDEN_CHAIN = [
  'PHILOSOPHY',
  'DEDICATE',
  'MEMORIAL',
  'PRESERVE',
  'REFLECT',
  'GRATITUDE',
  'LEGACY',
  'CONNECT',
  'COMPOUND',
] as const;

export const remembranceGardenStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<RemembranceGardenSnapshot>>;
} = {
  id: 'remembrance-garden',
  label: 'REMEMBRANCE GARDEN',
  phase: 2,
  enabled: false,
  description: 'PRESERVE GRATITUDE — HONOR THOSE WHO SHAPED THE ORGANIZATION',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Remembrance Garden requires browser context.');
    }
    return { ok: true, data: readRemembranceGardenStore() };
  },
};
