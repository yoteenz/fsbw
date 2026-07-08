import type { StudioServiceResult, StudioServiceStub } from '../types';
import { exportWarehouseSnapshot } from '../../../utils/adminStudioWarehouseDemo';

export type WarehouseSnapshot = ReturnType<typeof exportWarehouseSnapshot>;

export const warehouseStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<WarehouseSnapshot>>;
} = {
  id: 'studio-warehouse',
  label: 'STUDIO WAREHOUSE™',
  phase: 2,
  enabled: true,
  description:
    'Physical manifestation of Asset Registry™ — immersive warehouse districts, Scene Recipe™, replace workflow.',
  async getSnapshot() {
    return { ok: true, data: exportWarehouseSnapshot() };
  },
};
