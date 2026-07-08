import type { AtlasNode } from './types';

export type AtlasHiddenDiscovery = {
  id: string;
  displayName: string;
  mapX: number;
  mapY: number;
  parentId: string;
  travelPath: string;
  collectible?: string;
  achievement?: string;
};

export const ATLAS_HIDDEN_DISCOVERIES: AtlasHiddenDiscovery[] = [
  {
    id: 'discovery-hidden-observatory',
    displayName: 'Hidden Observatory™',
    mapX: 56,
    mapY: 34,
    parentId: 'flagship-studio-command-center',
    travelPath: '/admin/studio/architecture-observatory',
    achievement: 'FOUND THE ARCHITECTURE GUARDIAN',
    collectible: 'Observatory Lens',
  },
  {
    id: 'discovery-founder-easter-egg',
    displayName: 'Founder Easter Egg Chamber™',
    mapX: 44,
    mapY: 66,
    parentId: 'atlas-world-root',
    travelPath: '/admin/studio/world-atlas',
    achievement: 'CURIOSITY REWARDED',
    collectible: 'Golden Compass',
  },
  {
    id: 'discovery-innovation-statue',
    displayName: 'Innovation Monument™',
    mapX: 72,
    mapY: 44,
    parentId: 'flagship-creative-direction-studio',
    travelPath: '/admin/studio/department/creative-direction',
    achievement: 'BREAKTHROUGH MONUMENT ACTIVATED',
    collectible: 'Innovation Relic',
  },
  {
    id: 'discovery-seasonal-pavilion',
    displayName: 'Seasonal Pavilion™',
    mapX: 38,
    mapY: 18,
    parentId: 'atlas-world-root',
    travelPath: '/admin/studio/expansion-center',
    achievement: 'SEASONAL EVENT DISCOVERED',
  },
  {
    id: 'discovery-hidden-archive',
    displayName: 'Hidden Archive Room™',
    mapX: 82,
    mapY: 62,
    parentId: 'flagship-studio-archives',
    travelPath: '/admin/studio/studio-warehouse',
    achievement: 'RARE ARCHIVE UNEARTHED',
    collectible: 'Vault Key',
  },
];

export function buildDiscoveryNodes(
  _discoveredIds: Set<string>,
  hiddenFinds: string[]
): AtlasNode[] {
  return ATLAS_HIDDEN_DISCOVERIES.map(
    (d): AtlasNode => {
      const found = hiddenFinds.includes(d.id);
      return {
        id: d.id,
        displayName: d.displayName,
        level: 5,
        parentId: d.parentId,
        physicalType: 'observatory',
        mapX: d.mapX,
        mapY: d.mapY,
        mapZ: 0.7,
        extrusion: found ? 0.45 : 0.15,
        travelPath: d.travelPath,
        unlocked: found,
        fogged: !found,
        hidden: !found,
        activity: found ? 'pulse' : 'dormant',
        childIds: [],
        modes: ['architectural-blueprint', 'innovation', 'future-vision'],
        monumentType: d.id.includes('innovation')
          ? 'innovation'
          : d.id.includes('founder')
            ? 'founder-easter-egg'
            : d.id.includes('seasonal')
              ? 'seasonal'
              : 'historical',
        livingSignals: found ? ['hidden-discovery'] : [],
      };
    }
  );
}
