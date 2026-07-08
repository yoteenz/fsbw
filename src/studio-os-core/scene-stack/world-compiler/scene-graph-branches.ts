/**
 * Scene Graph branches — Executive Atrium™ tree structure.
 * Each node owns data. Nodes communicate. Nodes do not repaint one another.
 */

import type { SceneStackLayerId } from '../types';

export type SceneGraphBranchId =
  | 'architecture'
  | 'landmark'
  | 'furniture'
  | 'lighting'
  | 'materials'
  | 'atmosphere'
  | 'motion'
  | 'audio'
  | 'metadata'
  | 'budget'
  | 'dependencies';

export type SceneGraphBranch = {
  branchId: SceneGraphBranchId;
  displayName: string;
  layerIds: SceneStackLayerId[];
  ownsData: true;
  repaintsOthers: false;
};

export const SCENE_GRAPH_BRANCH_TREE: SceneGraphBranch[] = [
  {
    branchId: 'architecture',
    displayName: 'Architecture',
    layerIds: ['environment-shell'],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'landmark',
    displayName: 'Landmark',
    layerIds: ['signature-landmark'],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'furniture',
    displayName: 'Furniture',
    layerIds: ['furniture-objects'],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'lighting',
    displayName: 'Lighting',
    layerIds: ['lighting-systems'],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'materials',
    displayName: 'Materials',
    layerIds: ['surface-materials'],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'atmosphere',
    displayName: 'Atmosphere',
    layerIds: ['atmospheric-systems'],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'motion',
    displayName: 'Motion',
    layerIds: ['ambient-motion'],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'audio',
    displayName: 'Audio',
    layerIds: [],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'metadata',
    displayName: 'Metadata',
    layerIds: ['founder-personalization'],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'budget',
    displayName: 'Budget',
    layerIds: [],
    ownsData: true,
    repaintsOthers: false,
  },
  {
    branchId: 'dependencies',
    displayName: 'Dependencies',
    layerIds: [],
    ownsData: true,
    repaintsOthers: false,
  },
];

export function branchForLayer(layerId: SceneStackLayerId): SceneGraphBranch | undefined {
  return SCENE_GRAPH_BRANCH_TREE.find((b) => b.layerIds.includes(layerId));
}
