import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readProductionStudioStore } from '../../../studio-os-core/production-studio/store';

export type ProductionStudioModuleSnapshot = ReturnType<typeof readProductionStudioStore>;

export const PRODUCTION_STUDIO_CHAIN = [
  'PAGE READY',
  'PRODUCTION BRIEF',
  'VOICE',
  'HOST',
  'VISUAL',
  'MOTION',
  'CAPTIONS',
  'THUMBNAIL',
  'PLATFORM',
  'PREVIEW',
  'RENDER',
] as const;

export const productionStudioModuleService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ProductionStudioModuleSnapshot>>;
} = {
  id: 'production-studio',
  label: 'PRODUCTION STUDIO',
  phase: 2,
  enabled: false,
  description: 'CINEMATIC PRODUCTION HEADQUARTERS · APPROVED PAGE → MEDIA · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Production Studio requires browser context.');
    }
    return { ok: true, data: readProductionStudioStore() };
  },
};
