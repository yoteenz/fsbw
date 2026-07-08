import { listExchangeCareerWorldListings } from '../../studio-exchange/career-worlds/registry';
import { listAllCareerExpansions } from '../../studio-exchange/expansions/registry';
import { worldEdgeId, worldNodeId } from '../id';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** ARTICLE-E05 — Studio Exchange™ graph relationships */
export function ingestStudioExchangeNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const exchangeId = worldNodeId('engine', 'studio-exchange');
  const careerWorldsId = worldNodeId('engine', 'career-worlds');
  const professionBrainId = worldNodeId('engine', 'profession-brain');
  const knowledgeId = worldNodeId('knowledge-object', 'E05-studio-exchange-professional-license-system');

  edges.push(
    {
      id: worldEdgeId('references', exchangeId, knowledgeId),
      type: 'references',
      from: exchangeId,
      to: knowledgeId,
      label: 'canon-knowledge',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E05', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', exchangeId, careerWorldsId),
      type: 'integrates-with',
      from: exchangeId,
      to: careerWorldsId,
      label: 'professional-license-entry',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E05', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', exchangeId, professionBrainId),
      type: 'integrates-with',
      from: exchangeId,
      to: professionBrainId,
      label: 'license-includes-profession-brain',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E05', ingestedAt: ts },
    },
  );

  for (const listing of listExchangeCareerWorldListings()) {
    const productId = worldNodeId('marketplace-product', listing.licenseProductId);
    nodes.push({
      id: productId,
      slug: listing.licenseProductId,
      displayName: `${listing.displayName} License™`,
      nodeType: 'marketplace-product',
      lifecycle: 'implemented',
      plane: 'canon',
      version: '1.0.0',
      summary: listing.summary,
      tags: ['studio-exchange', 'professional-license', listing.careerWorldId],
      implementationStatus: 'live',
      codePaths: ['src/studio-os-core/studio-exchange/'],
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E05', ingestedAt: ts },
      metadata: {
        careerWorldId: listing.careerWorldId,
        profession: listing.profession,
      },
    });

    edges.push({
      id: worldEdgeId('published-as', exchangeId, productId),
      type: 'published-as',
      from: exchangeId,
      to: productId,
      label: 'license-product',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E05', ingestedAt: ts },
    });
  }

  for (const expansion of listAllCareerExpansions().slice(0, 24)) {
    const expansionId = worldNodeId('asset-pack', expansion.id);
    edges.push({
      id: worldEdgeId('owns', exchangeId, expansionId),
      type: 'owns',
      from: exchangeId,
      to: expansionId,
      label: 'career-expansion',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E05', ingestedAt: ts },
    });
  }

  return { nodes, edges };
}
