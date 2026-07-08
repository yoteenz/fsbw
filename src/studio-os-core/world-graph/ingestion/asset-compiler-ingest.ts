import { GENERATION_RECIPES } from '../../asset-compiler';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function ingestAssetCompilerNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();
  const foundryId = worldNodeId('engine', 'studio-foundry');
  const compilerId = worldNodeId('engine', 'asset-compiler');
  const registryId = worldNodeId('engine', 'asset-registry');

  for (const recipe of Object.values(GENERATION_RECIPES)) {
    const id = worldNodeId('knowledge-object', `generation-recipe-${recipe.id}`);
    nodes.push({
      id,
      slug: `generation-recipe-${recipe.id}`,
      displayName: `${recipe.label} Generation Recipe™`,
      nodeType: 'knowledge-object',
      lifecycle: 'live',
      plane: lifecyclePlane('live'),
      version: '1.0.0',
      summary: `${recipe.label} recipe selects ${recipe.falModel}, ${recipe.aspectRatio}, ${recipe.outputFormat}, ${recipe.backgroundBehavior}, and ${recipe.registryDestination}.`,
      codePaths: ['src/studio-os-core/asset-compiler/recipes.ts'],
      docPaths: ['docs/studio-os/engine/asset-compiler/ARTICLE_A01_ASSET_COMPILER.md'],
      provenance: { source: 'constitution', sourceRef: `ARTICLE-A01:${recipe.id}`, ingestedAt: ts },
      metadata: {
        recipeId: recipe.id,
        falModel: recipe.falModel,
        outputFormat: recipe.outputFormat,
        aspectRatio: recipe.aspectRatio,
        resolution: recipe.resolution,
        registryDestination: recipe.registryDestination,
        versioningStrategy: recipe.versioningStrategy,
        transparentBackground: recipe.metadata.transparentBackground,
      },
      tags: ['asset-compiler', 'generation-recipe', recipe.id],
    });

    edges.push(
      {
        id: worldEdgeId('owns', foundryId, id),
        type: 'owns',
        from: foundryId,
        to: id,
        label: 'generation-recipe',
        provenance: { source: 'constitution', sourceRef: recipe.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('generated-from', id, foundryId),
        type: 'generated-from',
        from: id,
        to: foundryId,
        label: 'foundry-recipe',
        provenance: { source: 'constitution', sourceRef: recipe.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('depends-on', id, compilerId),
        type: 'depends-on',
        from: id,
        to: compilerId,
        label: 'compiled-into-fal-request',
        provenance: { source: 'constitution', sourceRef: recipe.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('references', id, registryId),
        type: 'references',
        from: id,
        to: registryId,
        label: 'registry-destination',
        provenance: { source: 'constitution', sourceRef: recipe.id, ingestedAt: ts },
      }
    );
  }

  return { nodes, edges };
}
