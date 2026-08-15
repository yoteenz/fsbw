import { demoRoadmapRepository } from '../data/repositories/demoRepositories';

export interface RoadmapRepository {
  load(): import('../roadmap/roadmapTypes').RoadmapResult | null;
  save(result: import('../roadmap/roadmapTypes').RoadmapResult): void | Promise<void>;
  clear(): void;
}

/** @deprecated Prefer useAioRepositories() */
export const roadmapRepository = demoRoadmapRepository;
