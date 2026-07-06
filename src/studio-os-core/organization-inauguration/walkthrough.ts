import { buildWalkthroughStopsFromRegistry } from '../documentation-registry/walkthrough-sync';
import type { WalkthroughStop } from './types';

/** Default HQ walkthrough — steps reference Documentation Registry™ (M126). */
export const DEFAULT_WALKTHROUGH_STOPS: WalkthroughStop[] = buildWalkthroughStopsFromRegistry().map(
  ({ id, title, purpose, routeSegment, order }) => ({
    id,
    title,
    purpose,
    routeSegment,
    order,
  })
);
