import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

export type MasterSpecMilestoneInput = {
  id: string;
  title: string;
  implementationStatus?: string;
  volumeId?: string;
  chapterId?: string;
  docPath?: string;
};

function now(): string {
  return new Date().toISOString();
}

export function ingestMasterSpecMilestones(
  milestones: MasterSpecMilestoneInput[]
): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();
  const knowledgeRegistryId = worldNodeId('engine', 'knowledge-registry');

  for (const ms of milestones) {
    const slug = ms.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = worldNodeId('milestone', slug);
    const status = ms.implementationStatus ?? 'planned';
    const lifecycle =
      status === 'complete' ? 'live' : status === 'in-progress' ? 'implemented' : 'approved';

    nodes.push({
      id,
      slug,
      displayName: ms.title,
      nodeType: 'milestone',
      lifecycle,
      plane: lifecyclePlane(lifecycle),
      version: '1.0.0',
      summary: `Master Spec milestone ${ms.id}`,
      implementationStatus: status === 'complete' ? 'live' : 'prototype',
      docPaths: ms.docPath ? [ms.docPath] : undefined,
      provenance: { source: 'master-spec', sourceRef: ms.id, ingestedAt: ts },
      metadata: {
        milestoneId: ms.id,
        volumeId: ms.volumeId ?? '',
        chapterId: ms.chapterId ?? '',
      },
      tags: ['milestone', 'master-spec'],
    });

    nodes.push({
      id: worldNodeId('knowledge-object', slug),
      slug,
      displayName: ms.title,
      nodeType: 'knowledge-object',
      lifecycle,
      plane: lifecyclePlane(lifecycle),
      version: '1.0.0',
      summary: `Knowledge subsystem record for ${ms.title}`,
      provenance: { source: 'master-spec', sourceRef: ms.id, ingestedAt: ts },
      tags: ['knowledge-object', 'milestone'],
    });

    edges.push({
      id: worldEdgeId('implements', id, knowledgeRegistryId),
      type: 'implements',
      from: id,
      to: knowledgeRegistryId,
      provenance: { source: 'master-spec', sourceRef: ms.id, ingestedAt: ts },
    });

    edges.push({
      id: worldEdgeId('references', worldNodeId('knowledge-object', slug), id),
      type: 'references',
      from: worldNodeId('knowledge-object', slug),
      to: id,
      provenance: { source: 'master-spec', sourceRef: ms.id, ingestedAt: ts },
    });
  }

  return { nodes, edges };
}
