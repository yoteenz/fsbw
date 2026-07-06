import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readDesignGenomeStore } from '../../../studio-os-core/design-genome/store';

export type DesignGenomeModuleSnapshot = ReturnType<typeof readDesignGenomeStore>;

export const DESIGN_GENOME_CHAIN = ['PROMOTE', 'CAPTURE', 'ANALYZE', 'INHERIT', 'EVOLVE'] as const;

export const designGenomeModuleService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<DesignGenomeModuleSnapshot>>;
} = {
  id: 'design-genome',
  label: 'DESIGN GENOME',
  phase: 2,
  enabled: false,
  description: 'ORGANIZATIONAL VISUAL MEMORY · PROMOTION · INHERITANCE · PRE-BUILD REVIEW · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Design Genome requires browser context.');
    }
    return { ok: true, data: readDesignGenomeStore() };
  },
};
