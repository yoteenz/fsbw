import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readConciergeLayerStore } from '../../../studio-os-core/concierge-layer/store';

export type ConciergeLayerSnapshot = ReturnType<typeof readConciergeLayerStore>;

export const CONCIERGE_LAYER_CHAIN = [
  'WELCOME',
  'GUIDE',
  'RECOMMEND',
  'EDUCATE',
  'COORDINATE',
  'TRANSLATE',
  'STEWARD',
] as const;

export const conciergeLayerStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ConciergeLayerSnapshot>>;
} = {
  id: 'concierge-layer',
  label: 'CONCIERGE LAYER',
  phase: 2,
  enabled: false,
  description: 'FOUNDER-FACING GUIDANCE · HOSPITALITY · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Concierge Layer requires browser context.');
    }
    return { ok: true, data: readConciergeLayerStore() };
  },
};
