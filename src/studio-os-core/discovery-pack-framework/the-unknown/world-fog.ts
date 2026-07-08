/**
 * World Fog™ — regions hidden because civilization has not yet reached them.
 * Not because they haven't been coded — because the world has not been earned.
 */

import type { PublicWorldFogSnapshot } from '../types';
import type { CivilizationMilestoneMetrics } from '../civilization-milestones';
import { computePublicAtlasRegionSummary } from './known-world';

export function computeWorldFog(input: {
  metrics: CivilizationMilestoneMetrics;
  knowledgeCapital: number;
  collaborationCapital: number;
  innovationCapital: number;
  civilizationHealth: number;
}): PublicWorldFogSnapshot {
  const atlas = computePublicAtlasRegionSummary();

  /** Civilization progress clears fog incrementally — never by time alone */
  const explorationProgress = Math.min(
    100,
    Math.round(
      (input.knowledgeCapital * 0.25 +
        input.collaborationCapital * 0.25 +
        input.innovationCapital * 0.2 +
        input.civilizationHealth * 0.15 +
        (input.metrics.worldGraphNodes / 50_000) * 0.15) /
        2
    )
  );

  /** Fog recedes as civilization advances — but never reaches zero */
  const minimumFogPct = 38;
  const maxClearableFog = atlas.fogCoveragePct - minimumFogPct;
  const fogClearedPct = Math.round((explorationProgress / 100) * maxClearableFog);
  const activeFogPct = Math.max(minimumFogPct, atlas.fogCoveragePct - fogClearedPct);

  const signalsBeyondFrontier =
    input.collaborationCapital >= 40 ||
    input.knowledgeCapital >= 45 ||
    input.innovationCapital >= 42;

  return {
    activeFogPct,
    explorationProgressPct: explorationProgress,
    fogBeyondChartedTerritory: true,
    signalsBeyondFrontier,
    ambientQuestion: 'What is out there?',
    fogFraming:
      'Regions remain hidden not because they are unbuilt — because civilization has not yet reached them.',
  };
}
