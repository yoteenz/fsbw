import { worldEdgeId, worldNodeId } from '../world-graph/id';
import { lifecyclePlane } from '../world-graph/lifecycle';
import type { WorldEdge, WorldNode } from '../world-graph/types';
import { STUDIO_COMPANIES_BASE } from './constants';
import { STUDIO_WORLD_COMPANIES } from './registry';

function now(): string {
  return new Date().toISOString();
}

/**
 * World Graph™ — every company becomes a node with ownership relationships.
 */
export function ingestCompanyRouteNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  for (const company of STUDIO_WORLD_COMPANIES) {
    const nodeId = worldNodeId('company', company.companySlug);
    nodes.push({
      id: nodeId,
      slug: company.companySlug,
      displayName: company.companyName,
      nodeType: 'company',
      lifecycle: company.isLive ? 'live' : 'architecture',
      plane: lifecyclePlane(company.isLive ? 'live' : 'architecture'),
      version: '1.0.0',
      summary: `${company.companyName} — Studio World company instance (${company.headquartersLabel}).`,
      implementationStatus: company.isLive ? 'live' : 'spec',
      routes: {
        worldPath: `${STUDIO_COMPANIES_BASE}/${company.companySlug}`,
        legacyPath: `${STUDIO_COMPANIES_BASE}/${company.companySlug}/grand-atrium`,
      },
      codePaths: ['src/studio-os-core/company-routes/registry.ts'],
      provenance: { source: 'route-registry', sourceRef: company.companySlug, ingestedAt: ts },
      metadata: {
        companySlug: company.companySlug,
        companyId: company.companyId,
        workspaceId: company.workspaceId,
        genomeId: company.genomeId,
        atlasNodeId: company.atlasNodeId,
      },
      tags: ['company', 'studio-world', company.companySlug],
    });

    const hqId = worldNodeId('headquarters', company.companySlug);
    nodes.push({
      id: hqId,
      slug: `${company.companySlug}-headquarters`,
      displayName: `${company.companyName} Headquarters™`,
      nodeType: 'headquarters',
      lifecycle: company.isLive ? 'live' : 'architecture',
      plane: lifecyclePlane(company.isLive ? 'live' : 'architecture'),
      version: '1.0.0',
      summary: company.headquartersLabel,
      routes: {
        worldPath: `${STUDIO_COMPANIES_BASE}/${company.companySlug}/grand-atrium`,
      },
      provenance: { source: 'route-registry', sourceRef: company.companySlug, ingestedAt: ts },
      tags: ['headquarters', company.companySlug],
    });

    edges.push({
      id: worldEdgeId('owns', nodeId, hqId),
      type: 'owns',
      from: nodeId,
      to: hqId,
      label: 'owns Headquarters™',
      provenance: { source: 'route-registry', sourceRef: company.companySlug, ingestedAt: ts },
    });

    const genomeId = worldNodeId('company-genome', company.genomeId);
    edges.push({
      id: worldEdgeId('references', nodeId, genomeId),
      type: 'references',
      from: nodeId,
      to: genomeId,
      label: 'has Company Genome™',
      provenance: { source: 'route-registry', sourceRef: company.companySlug, ingestedAt: ts },
    });

    edges.push({
      id: worldEdgeId('owns', nodeId, worldNodeId('engine', 'creative-budget')),
      type: 'owns',
      from: nodeId,
      to: worldNodeId('engine', 'creative-budget'),
      label: 'has Creative Budget™',
      provenance: { source: 'route-registry', sourceRef: company.companySlug, ingestedAt: ts },
    });

    edges.push({
      id: worldEdgeId('owns', nodeId, worldNodeId('engine', 'creative-portfolio')),
      type: 'owns',
      from: nodeId,
      to: worldNodeId('engine', 'creative-portfolio'),
      label: 'has Creative Portfolio™',
      provenance: { source: 'route-registry', sourceRef: company.companySlug, ingestedAt: ts },
    });

    edges.push({
      id: worldEdgeId('published-as', nodeId, worldNodeId('flagship', 'marketplace')),
      type: 'published-as',
      from: nodeId,
      to: worldNodeId('flagship', 'marketplace'),
      label: 'publishes Marketplace Products',
      provenance: { source: 'route-registry', sourceRef: company.companySlug, ingestedAt: ts },
    });
  }

  return { nodes, edges };
}
