import type { AtlasNode, AtlasTravelMode } from '../studio-world-atlas/types';
import type { ContinuousScaleLevel, MissionControlTravelOption } from './types';

export function resolveAtlasTravelFromMissionOption(
  option: MissionControlTravelOption
): AtlasTravelMode {
  if (option === 'observer') return 'guided-tour';
  return option;
}

export function resolveContinuousScaleFromNode(node: AtlasNode): ContinuousScaleLevel {
  switch (node.level) {
    case 1:
      return 'civilization';
    case 2:
      return node.physicalType.includes('headquarters') ? 'campus' : 'district';
    case 3:
      return 'building';
    case 4:
      return 'floor';
    case 5:
      return 'room';
    case 6:
      return 'workspace';
    default:
      return 'civilization';
  }
}
