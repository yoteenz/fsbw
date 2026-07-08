import { FLAGSHIP_DESTINATIONS, FLAGSHIP_DISTRICTS } from '../studio-world/flagship-destinations';
import { STUDIO_WORLD_ROUTE_REGISTRY } from '../studio-world/route-registry';
import type { StudioWorldFlagshipId } from '../studio-world/types';
import type { AtlasDiscoveryStore, AtlasMapMode, AtlasNode, AtlasZoomLevel } from './types';
import { enrichAtlasNodes, filterNodesForMapMode } from './catalog-enrichment';
import { nodeVisibleInMapMode } from './engine-registry';
import { readAtlasDiscovery, seedBuildingMemoriesIfEmpty } from './memory-store';
import { buildDefaultBuildingMemories } from './world-memory';
import { resolveFogForNode } from './fog-of-discovery';
import { resolveNodeActivity } from './live-world';

const ALL_MODES: AtlasMapMode[] = [
  'architectural-blueprint',
  'organization',
  'operations',
  'creative',
  'archives',
  'ai',
  'generation',
  'creative-budget',
  'creative-portfolio',
  'creative-equity',
  'marketplace',
  'innovation',
  'company-genome',
  'construction',
  'future-vision',
  'master-planner',
];

const MODE_BY_FLAGSHIP: Record<StudioWorldFlagshipId, AtlasMapMode[]> = {
  'studio-command-center': [
    'architectural-blueprint',
    'organization',
    'operations',
    'ai',
    'generation',
    'company-genome',
    'construction',
  ],
  'creative-direction-studio': [
    'architectural-blueprint',
    'creative',
    'generation',
    'creative-budget',
    'creative-portfolio',
    'innovation',
  ],
  'studio-archives': [
    'architectural-blueprint',
    'archives',
    'generation',
    'marketplace',
    'creative-portfolio',
  ],
  headquarters: [
    'architectural-blueprint',
    'organization',
    'operations',
    'ai',
    'creative-equity',
    'company-genome',
  ],
  'expedition-hub': [
    'architectural-blueprint',
    'operations',
    'creative',
    'innovation',
    'future-vision',
    'master-planner',
  ],
};

/** World-level flagship positions on holographic table (polar layout) */
const FLAGSHIP_POSITIONS: Record<StudioWorldFlagshipId, { x: number; y: number; z: number; extrusion: number }> = {
  'studio-command-center': { x: 50, y: 42, z: 0.9, extrusion: 0.95 },
  'creative-direction-studio': { x: 22, y: 58, z: 0.7, extrusion: 0.75 },
  'studio-archives': { x: 78, y: 55, z: 0.75, extrusion: 0.82 },
  headquarters: { x: 35, y: 28, z: 0.65, extrusion: 0.7 },
  'expedition-hub': { x: 68, y: 30, z: 0.6, extrusion: 0.65 },
};

function uid(prefix: string, slug: string): string {
  return `${prefix}-${slug}`;
}

/** Deterministic table coordinates — stable across renders (no Math.random). */
function stableMapCoord(seed: string, axis: 'x' | 'y'): number {
  let h = axis === 'x' ? 0x9e37 : 0x85eb;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
    h |= 0;
  }
  return 38 + ((h >>> 0) % 2400) / 100;
}

function buildWorldNodes(companyName: string, discoveredIds: Set<string>): AtlasNode[] {
  const nodes: AtlasNode[] = [];
  const worldRoot: AtlasNode = {
    id: 'atlas-world-root',
    displayName: 'Studio World™',
    level: 1,
    parentId: null,
    physicalType: 'district',
    mapX: 50,
    mapY: 50,
    mapZ: 0,
    extrusion: 0,
    travelPath: '/admin/studio/world',
    unlocked: true,
    fogged: false,
    hidden: false,
    activity: 'pulse',
    childIds: [],
    modes: ALL_MODES,
  };
  nodes.push(worldRoot);

  for (const flagship of FLAGSHIP_DESTINATIONS) {
    const pos = FLAGSHIP_POSITIONS[flagship.id];
    const routes = STUDIO_WORLD_ROUTE_REGISTRY.filter((r) => r.flagshipId === flagship.id);
    const bestStatus = routes.some((r) => r.migrationStatus === 'immersive-live')
      ? 'immersive-live'
      : routes.some((r) => r.migrationStatus === 'immersive-partial')
        ? 'immersive-partial'
        : 'standard-room';

    const node: AtlasNode = {
      id: uid('flagship', flagship.id),
      displayName: flagship.displayName,
      level: 1,
      parentId: worldRoot.id,
      physicalType: flagship.physicalType,
      mapX: pos.x,
      mapY: pos.y,
      mapZ: pos.z,
      extrusion: pos.extrusion,
      worldPath: flagship.worldEntryPath,
      travelPath: flagship.legacyEntryPath,
      flagshipId: flagship.id,
      migrationStatus: bestStatus,
      unlocked: resolveFogForNode(flagship.id, bestStatus, discoveredIds),
      fogged: !resolveFogForNode(flagship.id, bestStatus, discoveredIds),
      hidden: false,
      activity: resolveNodeActivity(bestStatus),
      childIds: [],
      modes: MODE_BY_FLAGSHIP[flagship.id],
    };
    worldRoot.childIds.push(node.id);
    nodes.push(node);
  }

  // Future Districts™ — fogged teaser
  const future: AtlasNode = {
    id: 'future-districts',
    displayName: 'Future Districts™',
    level: 1,
    parentId: worldRoot.id,
    physicalType: 'district',
    mapX: 50,
    mapY: 72,
    mapZ: 0.3,
    extrusion: 0.2,
    travelPath: '/admin/studio/expansion-center',
    unlocked: false,
    fogged: true,
    hidden: false,
    activity: 'dormant',
    childIds: [],
    modes: ['architectural-blueprint'],
  };
  worldRoot.childIds.push(future.id);
  nodes.push(future);

  // Level 2 — Company Campus
  const campus: AtlasNode = {
    id: 'company-campus',
    displayName: `${companyName} Campus™`,
    level: 2,
    parentId: worldRoot.id,
    physicalType: 'headquarters',
    mapX: 50,
    mapY: 48,
    mapZ: 0.5,
    extrusion: 0.4,
    travelPath: '/admin/headquarters',
    unlocked: true,
    fogged: false,
    hidden: false,
    activity: 'active',
    childIds: FLAGSHIP_DESTINATIONS.map((f) => uid('flagship', f.id)),
    modes: ['organization', 'operations'],
  };
  nodes.push(campus);

  // Level 3–4 — districts & wings
  for (const district of FLAGSHIP_DISTRICTS) {
    const parentFlagship = uid('flagship', district.flagshipId);
    const level: AtlasZoomLevel =
      district.physicalType === 'wing' || district.parentId ? 4 : 3;
    const parentId = district.parentId
      ? uid('district', district.parentId)
      : parentFlagship;
    const dNode: AtlasNode = {
      id: uid('district', district.id),
      displayName: district.displayName,
      level,
      parentId,
      physicalType: district.physicalType,
      mapX: stableMapCoord(district.id, 'x'),
      mapY: stableMapCoord(district.id, 'y'),
      mapZ: 0.5,
      extrusion: 0.55,
      worldPath: `/admin/studio/world/${district.worldPath}`,
      travelPath: FLAGSHIP_DESTINATIONS.find((f) => f.id === district.flagshipId)?.legacyEntryPath ?? '/admin/studio/overview',
      flagshipId: district.flagshipId,
      unlocked: true,
      fogged: false,
      hidden: false,
      activity: 'idle',
      childIds: [],
      modes: MODE_BY_FLAGSHIP[district.flagshipId],
    };
    const flagshipNode = nodes.find((n) => n.id === parentFlagship);
    const parentNode = nodes.find((n) => n.id === parentId);
    if (parentNode) parentNode.childIds.push(dNode.id);
    else if (flagshipNode) flagshipNode.childIds.push(dNode.id);
    nodes.push(dNode);
  }

  for (const route of STUDIO_WORLD_ROUTE_REGISTRY) {
    const parentDistrict = nodes.find(
      (n) =>
        n.flagshipId === route.flagshipId &&
        (n.level === 3 || n.level === 4) &&
        route.parentLocationId &&
        n.id === uid('district', route.parentLocationId)
    );
    const fallbackDistrict = nodes.find((n) => n.flagshipId === route.flagshipId && n.level === 3);
    const parentId = parentDistrict?.id ?? fallbackDistrict?.id ?? uid('flagship', route.flagshipId);
    const room: AtlasNode = {
      id: uid('room', route.id),
      displayName: route.displayName,
      level: 5,
      parentId,
      physicalType: route.physicalType,
      mapX: stableMapCoord(route.id, 'x'),
      mapY: stableMapCoord(route.id, 'y'),
      mapZ: 0.4,
      extrusion: route.migrationStatus === 'immersive-live' ? 0.6 : 0.35,
      worldPath: route.worldPath,
      travelPath: route.legacyPath,
      flagshipId: route.flagshipId,
      migrationStatus: route.migrationStatus,
      unlocked: route.migrationStatus !== 'coming-soon',
      fogged: route.migrationStatus === 'standard-room' && route.shell === 'standard',
      hidden: route.id.includes('secret'),
      activity: resolveNodeActivity(route.migrationStatus),
      childIds: [uid('workspace', route.id)],
      modes: MODE_BY_FLAGSHIP[route.flagshipId],
    };
    const parent = nodes.find((n) => n.id === parentId);
    if (parent && !parent.childIds.includes(room.id)) parent.childIds.push(room.id);
    nodes.push(room);

    const workspace: AtlasNode = {
      ...room,
      id: uid('workspace', route.id),
      displayName: `${route.displayName} Workspace™`,
      level: 6,
      parentId: room.id,
      extrusion: 0.25,
      childIds: [],
    };
    nodes.push(workspace);
  }

  // Secret Observatory — hidden until discovered
  if (discoveredIds.has('secret-observatory') || discoveredIds.has('architecture-observatory')) {
    const secret: AtlasNode = {
      id: 'secret-observatory',
      displayName: 'Secret Observatory™',
      level: 5,
      parentId: uid('flagship', 'studio-command-center'),
      physicalType: 'observatory',
      mapX: 58,
      mapY: 38,
      mapZ: 0.85,
      extrusion: 0.5,
      travelPath: '/admin/studio/architecture-observatory',
      flagshipId: 'studio-command-center',
      unlocked: true,
      fogged: false,
      hidden: false,
      activity: 'pulse',
      childIds: [],
      modes: ['architectural-blueprint', 'ai'],
    };
    const cc = nodes.find((n) => n.id === uid('flagship', 'studio-command-center'));
    if (cc) cc.childIds.push(secret.id);
    nodes.push(secret);
  }

  return nodes;
}

let cachedCatalog: AtlasNode[] | null = null;
let cachedKey = '';

export type BuildAtlasCatalogOptions = {
  companyName?: string;
  discoveredIds?: string[];
  discovery?: AtlasDiscoveryStore;
  mapMode?: AtlasMapMode;
  liveTick?: number;
};

export function buildAtlasCatalog(
  companyNameOrOptions: string | BuildAtlasCatalogOptions = 'Frontal Slayer',
  discoveredIds: string[] = []
): AtlasNode[] {
  const opts: BuildAtlasCatalogOptions =
    typeof companyNameOrOptions === 'string'
      ? { companyName: companyNameOrOptions, discoveredIds }
      : companyNameOrOptions;
  const companyName = opts.companyName ?? 'Frontal Slayer';
  const discovery = opts.discovery ?? readAtlasDiscovery();
  const ids = opts.discoveredIds ?? discovery.discoveredNodeIds;
  const mapMode = opts.mapMode ?? 'architectural-blueprint';

  const key = `${companyName}:${ids.sort().join(',')}:${mapMode}:${opts.liveTick ?? 0}:${discovery.hiddenFinds.length}:${discovery.activeConstructions.map((j) => j.phase).join(',')}`;
  if (cachedCatalog && cachedKey === key) return cachedCatalog;

  const base = buildWorldNodes(companyName, new Set(ids));
  seedBuildingMemoriesIfEmpty(buildDefaultBuildingMemories(base, companyName));
  const freshDiscovery = readAtlasDiscovery();
  cachedCatalog = enrichAtlasNodes(base, {
    mapMode,
    discovery: freshDiscovery,
    liveTick: opts.liveTick,
  });
  cachedKey = key;
  return cachedCatalog;
}

export function getAtlasNode(nodeId: string, catalog?: AtlasNode[]): AtlasNode | undefined {
  const c = catalog ?? buildAtlasCatalog();
  return c.find((n) => n.id === nodeId);
}

export function getAtlasChildren(nodeId: string, catalog?: AtlasNode[]): AtlasNode[] {
  const c = catalog ?? buildAtlasCatalog();
  const node = getAtlasNode(nodeId, c);
  if (!node) return [];
  return node.childIds.map((id) => getAtlasNode(id, c)!).filter(Boolean);
}

export function getVisibleAtlasNodes(
  focusNodeId: string,
  mapMode: AtlasMapMode,
  catalog?: AtlasNode[]
): AtlasNode[] {
  const c = catalog ?? buildAtlasCatalog({ mapMode });
  const focus = getAtlasNode(focusNodeId, c) ?? c[0]!;
  const children = getAtlasChildren(focus.id, c).filter((n) => {
    if (n.fogged && !n.unlocked) return false;
    if (n.hidden) {
      return mapMode === 'future-vision' || mapMode === 'innovation';
    }
    return nodeVisibleInMapMode(n, mapMode);
  });
  const filtered = filterNodesForMapMode(children, mapMode);
  if (focus.level === 1 && focus.id === 'atlas-world-root') {
    return filtered.filter((n) => n.level === 1 && n.parentId === focus.id);
  }
  if (mapMode === 'master-planner' || mapMode === 'future-vision') {
    const plans = c.filter((n) => n.isPlanned && n.parentId === focus.id);
    if (plans.length) return [...filtered, ...plans];
  }
  return filtered.length > 0 ? filtered : [focus];
}

export function resolveZoomLevelForNode(node: AtlasNode): AtlasZoomLevel {
  return node.level;
}

export function getParentNode(nodeId: string, catalog?: AtlasNode[]): AtlasNode | null {
  const c = catalog ?? buildAtlasCatalog();
  const node = getAtlasNode(nodeId, c);
  if (!node?.parentId) return null;
  return getAtlasNode(node.parentId, c) ?? null;
}

export function invalidateAtlasCatalogCache(): void {
  cachedCatalog = null;
  cachedKey = '';
}
