import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readDesignDnaCanonStore } from '../../../studio-os-core/design-dna-canon/store';

export type DesignDnaCanonModuleSnapshot = ReturnType<typeof readDesignDnaCanonStore>;

export const DESIGN_DNA_CANON_CHAIN = ['CANON', 'DNA', 'INHERIT', 'REVIEW', 'COMPLETE'] as const;

export const designDnaCanonModuleService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<DesignDnaCanonModuleSnapshot>>;
} = {
  id: 'design-dna-canon',
  label: 'DESIGN DNA & CANON SYSTEM',
  phase: 2,
  enabled: false,
  description: 'CANON PAGES · DESIGN DNA · HEADQUARTERS REVIEW · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Design DNA & Canon System requires browser context.');
    }
    return { ok: true, data: readDesignDnaCanonStore() };
  },
};
