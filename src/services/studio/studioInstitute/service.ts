import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readStudioInstituteStore } from '../../../studio-os-core/studio-institute/store';

export type StudioInstituteSnapshot = ReturnType<typeof readStudioInstituteStore>;

export const STUDIO_INSTITUTE_CHAIN = [
  'COMMUNITIES',
  'SCHOOLS',
  'FACULTY',
  'CURRICULUM',
  'IMMERSIVE',
  'CERTIFY',
  'COMPOUND',
  'INSTITUTE',
] as const;

export const studioInstituteStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<StudioInstituteSnapshot>>;
} = {
  id: 'studio-institute',
  label: 'STUDIO INSTITUTE',
  phase: 2,
  enabled: false,
  description: 'PERMANENT LEARNING INSTITUTION · ORGANIZATIONAL EDUCATION · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Studio Institute requires browser context.');
    }
    return { ok: true, data: readStudioInstituteStore() };
  },
};
