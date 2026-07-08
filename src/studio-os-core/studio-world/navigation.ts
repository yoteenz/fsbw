/**
 * Studio World™ V4 — navigation graph and path resolution.
 */

import { FLAGSHIP_DESTINATIONS, FLAGSHIP_DISTRICTS } from './flagship-destinations';
import {
  resolveLegacyRouteLocation,
  resolveWorldRouteByPath,
  STUDIO_WORLD_ROUTE_REGISTRY,
} from './route-registry';
import type { StudioWorldNavigationEdge, StudioWorldRouteMapping } from './types';

export const STUDIO_WORLD_BASE_PATH = '/admin/studio/world';

export const STUDIO_WORLD_NAVIGATION_EDGES: StudioWorldNavigationEdge[] = [
  { fromLocationId: 'scc-executive-district', toLocationId: 'archives-orientation-atrium', movementVerb: 'walk', label: 'Walk to Studio Archives™' },
  { fromLocationId: 'archives-orientation-atrium', toLocationId: 'cds-story-table', movementVerb: 'cross-bridge', label: 'Cross to Creative Direction Studio™' },
  { fromLocationId: 'archives-orientation-atrium', toLocationId: 'hq-marketing-headquarters', movementVerb: 'ride-elevator', label: 'Ascend to Headquarters™' },
  { fromLocationId: 'exp-discovery-atrium', toLocationId: 'scc-executive-district', movementVerb: 'walk', label: 'Return to Command Center™' },
  { fromLocationId: 'archives-warehouse-wing', toLocationId: 'archives-museum-wing', movementVerb: 'walk', label: 'Enter Museum Wing™' },
  { fromLocationId: 'archives-museum-wing', toLocationId: 'archives-innovation-hall', movementVerb: 'walk', label: 'Continue to Hall of Innovation™' },
  { fromLocationId: 'archives-innovation-hall', toLocationId: 'archives-genome-vault', movementVerb: 'descend', label: 'Descend to Genome Vault™' },
  { fromLocationId: 'archives-genome-vault', toLocationId: 'archives-blueprint-archive', movementVerb: 'walk', label: 'Enter Blueprint Archive™' },
  { fromLocationId: 'archives-blueprint-archive', toLocationId: 'archives-marketplace-pavilion', movementVerb: 'walk', label: 'Enter Marketplace Pavilion™' },
];

export type StudioWorldPathResolution =
  | { kind: 'legacy-redirect'; mapping: StudioWorldRouteMapping; target: string }
  | { kind: 'flagship-entry'; flagshipId: string; target: string }
  | { kind: 'unknown'; target: string };

/**
 * Resolve a canonical world URL to the legacy implementation route.
 * World paths redirect to legacy until each room is rebuilt immersive.
 */
export function resolveStudioWorldPath(pathname: string): StudioWorldPathResolution {
  const mapping = resolveWorldRouteByPath(pathname);
  if (mapping) {
    return { kind: 'legacy-redirect', mapping, target: mapping.legacyPath };
  }

  const flagship = FLAGSHIP_DESTINATIONS.find((f) => pathname === f.worldEntryPath || pathname.startsWith(`${f.worldEntryPath}/`));
  if (flagship) {
    return { kind: 'flagship-entry', flagshipId: flagship.id, target: flagship.legacyEntryPath };
  }

  return { kind: 'unknown', target: '/admin/studio/overview' };
}

export function getCurrentWorldLocation(pathname: string): StudioWorldRouteMapping | null {
  return resolveLegacyRouteLocation(pathname) ?? resolveWorldRouteByPath(pathname);
}

export function formatWorldLocationLabel(mapping: StudioWorldRouteMapping): string {
  const flagship = FLAGSHIP_DESTINATIONS.find((f) => f.id === mapping.flagshipId);
  return `${flagship?.displayName ?? 'Studio World™'} · ${mapping.displayName}`;
}

export function inventorySummary() {
  return {
    totalMappedRoutes: STUDIO_WORLD_ROUTE_REGISTRY.length,
    flagshipCount: FLAGSHIP_DESTINATIONS.length,
    districtCount: FLAGSHIP_DISTRICTS.length,
    navigationEdges: STUDIO_WORLD_NAVIGATION_EDGES.length,
    immersiveLive: STUDIO_WORLD_ROUTE_REGISTRY.filter((r) => r.migrationStatus === 'immersive-live').length,
    standardRooms: STUDIO_WORLD_ROUTE_REGISTRY.filter((r) => r.migrationStatus === 'standard-room').length,
  };
}
