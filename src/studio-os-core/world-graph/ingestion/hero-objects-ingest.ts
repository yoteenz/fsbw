import { CONTEXTUAL_ORB_TOOLBELTS, HERO_OBJECTS } from '../../hero-objects';
import { STUDIO_WORLD_ROUTE_REGISTRY } from '../../studio-world/route-registry';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

const registeredRouteIds = new Set(STUDIO_WORLD_ROUTE_REGISTRY.map((route) => route.id));

/** Register ARTICLE-D09 Hero Objects™ as first-class World Graph citizens. */
export function ingestHeroObjectNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const heroObjectsEngineId = worldNodeId('engine', 'hero-objects');
  const contextualOrbEngineId = worldNodeId('engine', 'contextual-orb');
  const designPrincipleId = worldNodeId('design-principle', 'hero-objects-over-icons');
  const worldGraphId = worldNodeId('engine', 'world-graph');
  const atlasId = worldNodeId('engine', 'studio-world-atlas');
  const orbArchivistId = worldNodeId('engine', 'orb-archivist');
  const assetRegistryRoomId = worldNodeId('room', 'asset-registry');

  nodes.push(
    {
      id: heroObjectsEngineId,
      slug: 'hero-objects',
      displayName: 'Hero Objects™',
      nodeType: 'engine',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary:
        'Collectible luxury artifacts that replace software iconography as Studio World navigation primitives.',
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/hero-objects/'],
      docPaths: ['docs/studio-os/hero-objects/ARTICLE_D09_HERO_OBJECTS_CONTEXTUAL_ORB.md'],
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-D09', ingestedAt: ts },
      tags: ['hero-objects', 'navigation', 'collectibles', 'studio-foundry'],
      metadata: {
        objectCount: HERO_OBJECTS.length,
        toolbeltCount: CONTEXTUAL_ORB_TOOLBELTS.length,
        replacesIconography: true,
      },
    },
    {
      id: contextualOrbEngineId,
      slug: 'contextual-orb',
      displayName: 'Contextual Orb™',
      nodeType: 'engine',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary:
        'Adaptive Orb toolbelt that surfaces the five most relevant Hero Objects for the founder’s current location.',
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/hero-objects/contextual-orb.ts'],
      docPaths: ['docs/studio-os/hero-objects/ARTICLE_D09_HERO_OBJECTS_CONTEXTUAL_ORB.md'],
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-D09', ingestedAt: ts },
      tags: ['contextual-orb', 'hero-objects', 'toolbelt'],
      metadata: {
        maxVisibleObjects: 5,
        staticLauncherForbidden: true,
      },
    }
  );

  for (const [from, to, label] of [
    [heroObjectsEngineId, worldGraphId, 'graph-citizenship'],
    [heroObjectsEngineId, assetRegistryRoomId, 'registered-assets'],
    [heroObjectsEngineId, atlasId, 'atlas-projection'],
    [heroObjectsEngineId, designPrincipleId, 'governed-by-d09'],
    [contextualOrbEngineId, heroObjectsEngineId, 'surfaces-objects'],
    [contextualOrbEngineId, orbArchivistId, 'orb-intelligence'],
    [contextualOrbEngineId, designPrincipleId, 'governed-by-d09'],
  ] as const) {
    edges.push({
      id: worldEdgeId(label.includes('governed') ? 'governed-by' : 'integrates-with', from, to),
      type: label.includes('governed') ? 'governed-by' : 'integrates-with',
      from,
      to,
      label,
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-D09', ingestedAt: ts },
    });
  }

  for (const object of HERO_OBJECTS) {
    const objectId = worldNodeId('hero-object', object.worldGraphSlug);
    nodes.push({
      id: objectId,
      slug: object.worldGraphSlug,
      displayName: object.displayName,
      nodeType: 'hero-object',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: object.version,
      summary: object.summary,
      implementationStatus: 'spec',
      routes: object.destinationPath ? { legacyPath: object.destinationPath } : undefined,
      codePaths: ['src/studio-os-core/hero-objects/catalog.ts'],
      docPaths: ['docs/studio-os/hero-objects/ARTICLE_D09_HERO_OBJECTS_CONTEXTUAL_ORB.md'],
      provenance: { source: 'constitution', sourceRef: object.id, ingestedAt: ts },
      tags: ['hero-object', 'collectible', 'navigation-artifact', ...object.tags],
      metadata: {
        assetRegistryId: object.assetRegistryId,
        foundryProductLine: object.foundryProductLine,
        silhouetteFamily: object.silhouetteFamily,
        material: object.material,
        creator: object.creator,
        dateIntroduced: object.dateIntroduced,
        surfaceCount: object.surfaces.length,
        editionCount: object.editions.length,
      },
    });

    edges.push(
      {
        id: worldEdgeId('owns', heroObjectsEngineId, objectId),
        type: 'owns',
        from: heroObjectsEngineId,
        to: objectId,
        label: 'hero-object-catalog',
        provenance: { source: 'constitution', sourceRef: object.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('governed-by', objectId, designPrincipleId),
        type: 'governed-by',
        from: objectId,
        to: designPrincipleId,
        label: 'silhouette-law',
        provenance: { source: 'constitution', sourceRef: object.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('registered-in', objectId, assetRegistryRoomId),
        type: 'integrates-with',
        from: objectId,
        to: assetRegistryRoomId,
        label: object.assetRegistryId,
        provenance: { source: 'constitution', sourceRef: object.id, ingestedAt: ts },
      }
    );

    if (object.destinationRouteId && registeredRouteIds.has(object.destinationRouteId)) {
      const destinationId = worldNodeId('room', object.destinationRouteId);
      edges.push({
        id: worldEdgeId('projects-to', objectId, destinationId),
        type: 'projects-to',
        from: objectId,
        to: destinationId,
        label: 'navigates-to',
        provenance: { source: 'constitution', sourceRef: object.id, ingestedAt: ts },
      });
    }
  }

  for (const toolbelt of CONTEXTUAL_ORB_TOOLBELTS) {
    for (const objectId of toolbelt.heroObjectIds) {
      const object = HERO_OBJECTS.find((item) => item.id === objectId);
      if (!object) continue;
      edges.push({
        id: worldEdgeId(`projects-to-${toolbelt.contextId}`, contextualOrbEngineId, worldNodeId('hero-object', object.worldGraphSlug)),
        type: 'projects-to',
        from: contextualOrbEngineId,
        to: worldNodeId('hero-object', object.worldGraphSlug),
        label: `${toolbelt.contextLabel} toolbelt`,
        provenance: { source: 'constitution', sourceRef: toolbelt.contextId, ingestedAt: ts },
      });
    }
  }

  return { nodes, edges };
}
