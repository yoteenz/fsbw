import type { StudioServiceResult, StudioServiceStub } from '../types';
import { exportMuseumSnapshot } from '../../../utils/adminStudioMuseumDemo';

export type MuseumSnapshot = ReturnType<typeof exportMuseumSnapshot>;

export const museumStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<MuseumSnapshot>>;
} = {
  id: 'studio-museum',
  label: 'STUDIO MUSEUM™',
  phase: 2,
  enabled: true,
  description:
    'Permanent archive of greatest achievements — Golden Builds™, exhibits, Time Machine™, Legacy Wall™, Memory Sphere™.',
  async getSnapshot() {
    return { ok: true, data: exportMuseumSnapshot() };
  },
};
