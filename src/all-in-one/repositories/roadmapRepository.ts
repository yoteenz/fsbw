import type { RoadmapResult } from '../roadmap/roadmapTypes';
import { getStore, saveRoadmap } from '../demo/demoActions';
import { resetDemoStore } from '../demo/demoStore';

export interface RoadmapRepository {
  load(): RoadmapResult | null;
  save(result: RoadmapResult): void;
  clear(): void;
}

export class LocalDemoRoadmapRepository implements RoadmapRepository {
  load(): RoadmapResult | null {
    return getStore().roadmap;
  }

  save(result: RoadmapResult): void {
    saveRoadmap(result);
  }

  clear(): void {
    resetDemoStore();
  }
}

export const roadmapRepository = new LocalDemoRoadmapRepository();
