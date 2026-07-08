/** Backward-compatible facade — delegates to modular implementation. */
export {
  buildProfessionalTimeline,
  filterTimelineByKind,
  filterTimelineByYear,
  memoryToTimelineEntry,
} from './memory-timeline/builder';

export {
  buildOrbMemoryRecalls,
  markOrbMemoriesSurfaced,
} from './orb-integration/generator';

export { createWisdomContext, synthesizeWisdomRecommendation } from './wisdom-engine/synthesizer';

export {
  bootstrapProfessionalMemory,
  syncProfessionalMemory,
  ingestCareerWorldMemoryEvent,
  requestWisdomRecommendation,
} from './professional-memory/orchestrator';

export { orchestrateWisdomRecommendation } from './wisdom-engine/orchestrator';
