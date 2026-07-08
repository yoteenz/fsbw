import { collectOrbCompanyContext } from './context-collector';
import { buildOrbDailyBrief } from './daily-brief';
import { buildExecutiveJourney } from './executive-journey';
import { filterOrbRecommendationsForFocus } from './focus-modes';
import { readOrbPersonalization } from './personalization-store';
import { buildOrbRecommendations } from './recommendation-engine';
import { buildSurpriseDiscoveries } from './surprise-discoveries';
import type { OrbRecommendationsSnapshot } from './types';

export type * from './types';
export {
  ORB_FOCUS_MODE_LABELS,
  ORB_FOCUS_MODE_DESCRIPTIONS,
  ORB_FOCUS_MODES,
  ORB_RECOMMENDATIONS_STORAGE_KEY,
  ORB_RECOMMENDATION_EVENT,
} from './constants';
export * from './personalization-store';
export * from './context-collector';
export * from './daily-brief';
export * from './recommendation-engine';
export * from './surprise-discoveries';
export * from './executive-journey';
export * from './focus-modes';
export * from './atlas-world-signals';

/** Assemble the full Orb Recommendations™ snapshot for the current session. */
export function buildOrbRecommendationsSnapshot(
  organizationId: string,
  companyName: string,
  pathname: string
): OrbRecommendationsSnapshot {
  const context = collectOrbCompanyContext(organizationId, companyName, pathname);
  const profile = readOrbPersonalization(organizationId);
  const allRecs = buildOrbRecommendations(context, profile);
  const surprises = buildSurpriseDiscoveries(context, profile);
  const filtered = filterOrbRecommendationsForFocus(
    [...allRecs, ...surprises.filter((s) => profile.focusMode === 'explorer' || s.priority !== 'low')],
    profile.focusMode
  );
  const dailyBrief = buildOrbDailyBrief(context, filtered);
  const executiveJourney = buildExecutiveJourney(filtered, profile);

  return {
    dailyBrief,
    recommendations: filtered,
    surpriseDiscoveries: surprises,
    executiveJourney,
    worldSignals: [],
    focusMode: profile.focusMode,
  };
}
