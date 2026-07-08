import { FLAGSHIP_DESTINATIONS } from '../../studio-world/flagship-destinations';
import { STUDIO_WORLD_ROUTE_REGISTRY } from '../../studio-world/route-registry';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function ingestFlagshipNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  for (const flagship of FLAGSHIP_DESTINATIONS) {
    const id = worldNodeId('flagship', flagship.id);
    nodes.push({
      id,
      slug: flagship.id,
      displayName: flagship.displayName,
      nodeType: 'flagship',
      lifecycle: 'live',
      plane: lifecyclePlane('live'),
      version: '1.0.0',
      summary: flagship.purpose,
      implementationStatus: 'live',
      routes: { worldPath: flagship.worldEntryPath, legacyPath: flagship.legacyEntryPath },
      codePaths: ['src/studio-os-core/studio-world/flagship-destinations.ts'],
      provenance: { source: 'route-registry', sourceRef: flagship.id, ingestedAt: ts },
      tags: ['flagship', 'studio-world'],
    });
  }

  return { nodes, edges };
}

export function ingestRouteRegistryNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  for (const route of STUDIO_WORLD_ROUTE_REGISTRY) {
    const nodeType = route.physicalType === 'room' ? 'room' : 'room';
    const id = worldNodeId('room', route.id);
    const flagshipId = worldNodeId('flagship', route.flagshipId);

    nodes.push({
      id,
      slug: route.id,
      displayName: route.displayName,
      nodeType,
      lifecycle: route.migrationStatus === 'immersive-live' ? 'live' : 'implemented',
      plane: lifecyclePlane(route.migrationStatus === 'immersive-live' ? 'live' : 'implemented'),
      version: '1.0.0',
      summary: route.formerFeatureName
        ? `Formerly ${route.formerFeatureName}`
        : `${route.physicalType} in Studio World™`,
      implementationStatus:
        route.migrationStatus === 'immersive-live'
          ? 'live'
          : route.migrationStatus === 'standard-room'
            ? 'prototype'
            : 'live',
      routes: { worldPath: route.worldPath, legacyPath: route.legacyPath },
      aliases: route.formerFeatureName ? [route.formerFeatureName] : undefined,
      codePaths: ['src/studio-os-core/studio-world/route-registry.ts'],
      provenance: { source: 'route-registry', sourceRef: route.id, ingestedAt: ts },
      metadata: {
        physicalType: route.physicalType,
        migrationStatus: route.migrationStatus,
        parentLocationId: route.parentLocationId,
      },
      tags: [route.flagshipId, route.physicalType],
    });

    edges.push({
      id: worldEdgeId('located-in', id, flagshipId),
      type: 'located-in',
      from: id,
      to: flagshipId,
      label: 'located in',
      provenance: { source: 'route-registry', sourceRef: route.id, ingestedAt: ts },
    });

    edges.push({
      id: worldEdgeId('projects-to', id, 'W-PUB-studio-world-bible'),
      type: 'projects-to',
      from: id,
      to: 'W-PUB-studio-world-bible',
      label: 'publication projection',
      provenance: { source: 'route-registry', sourceRef: route.id, ingestedAt: ts },
    });
  }

  return { nodes, edges };
}
