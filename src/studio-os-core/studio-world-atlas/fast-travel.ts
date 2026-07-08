import type { AtlasNode, AtlasTravelMode, AtlasViewState } from './types';

export type AtlasTravelResolution = {
  path: string;
  transitionMs: number;
  cinematicClass: string;
  verb: string;
};

export function resolveAtlasTravel(
  node: AtlasNode,
  travelMode: AtlasTravelMode,
  _view: Pick<AtlasViewState, 'zoomLevel'>
): AtlasTravelResolution {
  const path = node.travelPath.split('?')[0]!;

  switch (travelMode) {
    case 'walk':
      return {
        path,
        transitionMs: 1400,
        cinematicClass: 'atlas-travel-walk',
        verb: 'Walking to',
      };
    case 'elevator':
      return {
        path,
        transitionMs: 900,
        cinematicClass: 'atlas-travel-elevator',
        verb: 'Rising via Glass Elevator™ to',
      };
    case 'fast-travel':
      return {
        path,
        transitionMs: 600,
        cinematicClass: 'atlas-travel-fast',
        verb: 'Fast traveling to',
      };
    case 'guided-tour':
      return {
        path,
        transitionMs: 2200,
        cinematicClass: 'atlas-travel-tour',
        verb: 'Guided tour to',
      };
    case 'executive-shuttle':
      return {
        path,
        transitionMs: 1100,
        cinematicClass: 'atlas-travel-shuttle',
        verb: 'Executive Shuttle™ en route to',
      };
    case 'skybridge':
      return {
        path,
        transitionMs: 1300,
        cinematicClass: 'atlas-travel-skybridge',
        verb: 'Crossing skybridge to',
      };
    case 'observation-train':
      return {
        path,
        transitionMs: 1800,
        cinematicClass: 'atlas-travel-train',
        verb: 'Observation Train™ departing for',
      };
    case 'autonomous-transit':
      return {
        path,
        transitionMs: 1000,
        cinematicClass: 'atlas-travel-transit',
        verb: 'Autonomous transit to',
      };
    default:
      return { path, transitionMs: 800, cinematicClass: 'atlas-travel-fast', verb: 'Entering' };
  }
}

export function defaultAtlasView(): AtlasViewState {
  return {
    zoomLevel: 1,
    focusNodeId: 'atlas-world-root',
    mapMode: 'architectural-blueprint',
    travelMode: 'fast-travel',
    transitionMs: 800,
    travelingRoads: false,
  };
}
