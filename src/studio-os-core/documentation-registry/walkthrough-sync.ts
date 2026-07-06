import { GETTING_STARTED_PROGRESSION } from '../documentation-sync/getting-started-progression';
import { getRegisteredFeature } from './registration';

/** Walkthrough steps from registry — no hardcoded content. */
export function buildWalkthroughStopsFromRegistry() {
  return GETTING_STARTED_PROGRESSION.map((step) => {
    const entry = step.moduleId ? getRegisteredFeature(step.moduleId) : undefined;
    return {
      id: step.phase,
      title: entry?.officialName ?? step.title,
      purpose: entry?.purpose ?? step.summary,
      routeSegment: step.routeSegment,
      order: step.order,
      registryRef: entry?.walkthroughReferences[0] ?? `walkthrough:${step.phase}`,
    };
  });
}

export function getWalkthroughStepForModule(moduleId: string) {
  return buildWalkthroughStopsFromRegistry().find(
    (s) => s.routeSegment === moduleId || s.id === moduleId
  );
}

export function summarizeWalkthroughSync(): string {
  const stops = buildWalkthroughStopsFromRegistry();
  return `${stops.length} walkthrough steps synchronized from Documentation Registry™ — updates automatically when features change.`;
}
