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
        verb: 'Rising to',
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
  };
}
