/**
 * Global Atlas Layer™ — resolve current location + atlas node from pathname.
 */

import { buildAtlasCatalog, getAtlasNode } from '../studio-world-atlas/catalog';
import type { AtlasNode } from '../studio-world-atlas/types';
import { getCurrentWorldLocation } from '../studio-world/navigation';
import { FLAGSHIP_DESTINATIONS } from '../studio-world/flagship-destinations';
import type { StudioWorldFlagshipId } from '../studio-world/types';

export type ResolvedGlobalAtlasLocation = {
  pathname: string;
  routeId: string | null;
  flagshipId: StudioWorldFlagshipId | null;
  nodeId: string;
  breadcrumb: AtlasNode[];
  label: string;
};

function flagshipNodeId(flagshipId: StudioWorldFlagshipId): string {
  return `flagship-${flagshipId}`;
}

function roomNodeId(routeId: string): string {
  return `room-${routeId}`;
}

export function resolveAtlasNodeIdFromPath(
  pathname: string,
  catalog = buildAtlasCatalog()
): string {
  const mapping = getCurrentWorldLocation(pathname);
  if (mapping) {
    const room = getAtlasNode(roomNodeId(mapping.id), catalog);
    if (room) return room.id;
    const flagship = getAtlasNode(flagshipNodeId(mapping.flagshipId), catalog);
    if (flagship) return flagship.id;
  }

  const p = pathname.toLowerCase();
  for (const flagship of FLAGSHIP_DESTINATIONS) {
    if (p.includes(flagship.legacyEntryPath.replace('/admin', '')) || p.includes(flagship.id.replace(/-/g, ''))) {
      const node = getAtlasNode(flagshipNodeId(flagship.id), catalog);
      if (node) return node.id;
    }
  }

  if (p.includes('creative-direction')) {
    const cds = getAtlasNode(flagshipNodeId('creative-direction-studio'), catalog);
    if (cds) return cds.id;
  }

  return 'atlas-world-root';
}

export function resolveGlobalAtlasLocation(
  pathname: string,
  companyName = 'Frontal Slayer'
): ResolvedGlobalAtlasLocation {
  const catalog = buildAtlasCatalog(companyName);
  const nodeId = resolveAtlasNodeIdFromPath(pathname, catalog);
  const node = getAtlasNode(nodeId, catalog) ?? catalog[0]!;
  const trail: AtlasNode[] = [];
  let cursor: AtlasNode | null = node;
  while (cursor) {
    trail.unshift(cursor);
    cursor = cursor.parentId ? getAtlasNode(cursor.parentId, catalog) ?? null : null;
  }

  const mapping = getCurrentWorldLocation(pathname);
  return {
    pathname,
    routeId: mapping?.id ?? null,
    flagshipId: mapping?.flagshipId ?? node.flagshipId ?? null,
    nodeId,
    breadcrumb: trail,
    label: trail.map((n) => n.displayName).join(' → '),
  };
}

export function formatLocationBreadcrumb(location: ResolvedGlobalAtlasLocation): string {
  if (location.breadcrumb.length <= 1) return location.label;
  return location.breadcrumb.map((n) => n.displayName).join(' → ');
}
