import type {
  MemoryGraphEdge,
  MemoryGraphNode,
  OrganizationProfessionBrainProfile,
} from './types';

export function buildMemoryGraph(
  profile: OrganizationProfessionBrainProfile
): { nodes: MemoryGraphNode[]; edges: MemoryGraphEdge[] } {
  const nodes: MemoryGraphNode[] = [];
  const edges: MemoryGraphEdge[] = [];

  nodes.push({
    id: `org-${profile.organizationId}`,
    type: 'department',
    label: profile.companyName,
  });

  for (const brain of profile.brains) {
    const brainNodeId = `brain-${brain.id}`;
    nodes.push({ id: brainNodeId, type: 'brain', label: brain.label, brainId: brain.id });
    edges.push({
      id: `e-org-${brain.id}`,
      fromId: `org-${profile.organizationId}`,
      toId: brainNodeId,
      relationship: 'OWNS',
    });

    for (const entry of brain.knowledgeEntries) {
      const nodeId = `knowledge-${entry.id}`;
      const nodeType =
        entry.kind === 'regulation' || entry.kind === 'policy'
          ? 'law'
          : entry.kind === 'template'
            ? 'template'
            : entry.kind === 'exception'
              ? 'exception'
              : 'process';

      nodes.push({ id: nodeId, type: nodeType, label: entry.title, brainId: brain.id });
      edges.push({
        id: `e-${entry.id}-brain`,
        fromId: brainNodeId,
        toId: nodeId,
        relationship: 'CAPTURES',
      });

      if (entry.kind === 'story') {
        edges.push({
          id: `e-${entry.id}-philosophy`,
          fromId: nodeId,
          toId: brainNodeId,
          relationship: 'EXPLAINS_WHY',
        });
      }
    }
  }

  return { nodes, edges };
}

export function countGraphConnections(profile: OrganizationProfessionBrainProfile): number {
  return profile.memoryGraph.edges.length;
}

export function listBrainsInGraph(profile: OrganizationProfessionBrainProfile): string[] {
  return profile.memoryGraph.nodes.filter((n) => n.type === 'brain').map((n) => n.label);
}
