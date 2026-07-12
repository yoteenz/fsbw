import type { IsolatedLayerImageMetrics } from '../isolated-layer-quality';

/** Synthetic metrics for unit tests — no image loading required. */
export function fixtureMetrics(partial: Partial<IsolatedLayerImageMetrics>): IsolatedLayerImageMetrics {
  return {
    width: 1024,
    height: 1024,
    frameCoverage: 0.35,
    edgeSharpness: 12,
    avgLuminance: 140,
    alphaChannelPresent: true,
    transparentSides: 4,
    fullWidthEdgeContact: false,
    fullHeightEdgeContact: false,
    cornerOpacityAvg: 20,
    bakedCheckerboardSuspect: false,
    shellSimilarity: 0.2,
    ...partial,
  };
}

export const FIXTURE_NATIVE_ALPHA_LANDMARK = fixtureMetrics({
  frameCoverage: 0.32,
  transparentSides: 4,
  alphaChannelPresent: true,
  cornerOpacityAvg: 15,
});

export const FIXTURE_SOLID_BACKGROUND_LANDMARK = fixtureMetrics({
  frameCoverage: 0.38,
  transparentSides: 0,
  alphaChannelPresent: false,
  avgLuminance: 245,
  cornerOpacityAvg: 255,
});

export const FIXTURE_FULL_SCENE_RERENDER = fixtureMetrics({
  frameCoverage: 0.92,
  transparentSides: 0,
  alphaChannelPresent: false,
  fullWidthEdgeContact: true,
  fullHeightEdgeContact: true,
  cornerOpacityAvg: 240,
  shellSimilarity: 0.88,
});

export const FIXTURE_FAKE_CHECKERBOARD = fixtureMetrics({
  bakedCheckerboardSuspect: true,
  alphaChannelPresent: true,
  transparentSides: 4,
});

export const FIXTURE_CROPPED_LANDMARK = fixtureMetrics({
  frameCoverage: 0.04,
  transparentSides: 1,
});

export const FIXTURE_FURNITURE_GROUP = fixtureMetrics({
  frameCoverage: 0.48,
  transparentSides: 3,
  alphaChannelPresent: true,
});
