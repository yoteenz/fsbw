import type { AtlasNode } from '../studio-world-atlas/types';
import type { AtlasTravelResolution } from '../studio-world-atlas/fast-travel';
import type { TravelPreview } from './types';

export function buildTravelPreview(
  destination: AtlasNode,
  resolution: AtlasTravelResolution | null,
  collaboratorsNearby: string[] = []
): TravelPreview {
  const seconds = resolution ? Math.round(resolution.transitionMs / 1000) : 3;
  return {
    destinationId: destination.id,
    destinationTitle: destination.displayName,
    routeVerb: resolution?.verb ?? 'Travel',
    estimatedSeconds: seconds,
    collaboratorsNearby,
    previewLine: resolution
      ? `Route calculated — ${resolution.verb} ${destination.displayName} · ~${seconds}s`
      : `Highlight ${destination.displayName} — select travel mode`,
  };
}

export function estimateTravelSeconds(resolution: AtlasTravelResolution | null): number {
  if (!resolution) return 0;
  return Math.round(resolution.transitionMs / 1000);
}
