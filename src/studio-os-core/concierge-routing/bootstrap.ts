import { ROUTING_PHILOSOPHY } from './constants';
import { bootstrapConciergeRoutingStore } from './store';
import type { ConciergeRoutingStore } from './types';

export function buildConciergeRoutingSeed(): Partial<ConciergeRoutingStore> {
  return {
    philosophy: [...ROUTING_PHILOSOPHY],
    routingPreferences: [
      {
        id: 'pref-deep-work',
        intent: 'personal-life',
        preferredConciergeId: 'chief-concierge',
        learnedFrom: 'Block every Friday morning for deep work',
        confidenceBoost: 8,
      },
      {
        id: 'pref-ndxbook-publish',
        intent: 'publishing-change',
        preferredConciergeId: 'growth-concierge',
        learnedFrom: 'NDXBOOK publishing cadence preference',
        confidenceBoost: 6,
      },
    ],
  };
}

export function bootstrapConciergeRoutingPlatform(): void {
  bootstrapConciergeRoutingStore(buildConciergeRoutingSeed());
}
