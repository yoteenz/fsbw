import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readFoundersPromiseStore } from '../../../studio-os-core/founders-promise/store';

export type FoundersPromiseSnapshot = ReturnType<typeof readFoundersPromiseStore>;

export const FOUNDERS_PROMISE_CHAIN = [
  'PHILOSOPHY',
  'REFLECT',
  'PROMISE',
  'LIVING',
  'ALIGN',
  'EXECUTIVE',
  'ARCHIVE',
  'LEGACY',
  'COMPOUND',
] as const;

export const foundersPromiseStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<FoundersPromiseSnapshot>>;
} = {
  id: 'founders-promise',
  label: 'FOUNDER\'S PROMISE',
  phase: 2,
  enabled: false,
  description: 'PERSONAL NORTH STAR — EMOTIONAL FOUNDATION · NOT MARKETING',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Founder\'s Promise requires browser context.');
    }
    return { ok: true, data: readFoundersPromiseStore() };
  },
};
