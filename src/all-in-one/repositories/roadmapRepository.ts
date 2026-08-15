import { AIO_STORAGE_KEYS, readStorage, writeStorage } from '../storage/demoStorage';
import type { RoadmapResult } from '../roadmap/roadmapTypes';

export interface RoadmapRepository {
  load(): RoadmapResult | null;
  save(result: RoadmapResult): void;
  clear(): void;
}

export class LocalDemoRoadmapRepository implements RoadmapRepository {
  load(): RoadmapResult | null {
    return readStorage<RoadmapResult | null>(AIO_STORAGE_KEYS.roadmap, null);
  }

  save(result: RoadmapResult): void {
    writeStorage(AIO_STORAGE_KEYS.roadmap, result);
  }

  clear(): void {
    writeStorage(AIO_STORAGE_KEYS.roadmap, null);
  }
}

export const roadmapRepository = new LocalDemoRoadmapRepository();
