import type {
  KnowledgeGraphNode,
  KnowledgeGraphRelationType,
  KnowledgeGraphSearchHit,
  KnowledgeGraphWorkflowMap,
  ModuleGraphEntry,
} from './schema';
import { buildKnowledgeGraph } from './buildGraph';

export function getGraphNode(nodeId: string): KnowledgeGraphNode | undefined {
  return buildKnowledgeGraph().nodes.find((n) => n.id === nodeId);
}

export function getAllGraphNodes(): KnowledgeGraphNode[] {
  return buildKnowledgeGraph().nodes;
}

export function getAllGraphWorkflows(): KnowledgeGraphWorkflowMap[] {
  return buildKnowledgeGraph().workflows;
}

export function resolveGraphModuleIdForPath(pathname: string): string | undefined {
  const normalized = pathname.split('?')[0];
  const nodes = buildKnowledgeGraph().nodes.filter((n) => n.type === 'module' && n.route);
  const exact = nodes.find((n) => n.route === normalized);
  if (exact?.moduleId) return exact.moduleId;
  const prefix = nodes
    .filter((n) => n.route && (normalized === n.route || normalized.startsWith(`${n.route}/`)))
    .sort((a, b) => (b.route!.length - a.route!.length));
  return prefix[0]?.moduleId;
}

export function getModuleGraphEntry(moduleId: string): ModuleGraphEntry | undefined {
  const graph = buildKnowledgeGraph();
  const moduleNode = graph.nodes.find((n) => n.id === moduleId || n.moduleId === moduleId);
  if (!moduleNode) return undefined;

  const rootId = moduleNode.id;
  const connected = graph.edges
    .filter((e) => e.fromId === rootId || e.toId === rootId)
    .map((e) => {
      const otherId = e.fromId === rootId ? e.toId : e.fromId;
      const node = graph.nodes.find((n) => n.id === otherId);
      if (!node) return null;
      return {
        node,
        relation: e.type,
        label: e.label,
      };
    })
    .filter(Boolean) as ModuleGraphEntry['connected'];

  const workflows = graph.workflows.filter(
    (w) => w.moduleIds?.includes(moduleId) || w.nodeIds.includes(rootId)
  );

  return {
    moduleNode,
    connected,
    workflows,
    manualChapter: moduleNode.relatedManualChapter,
  };
}

export function getConnectedModuleNodes(moduleId: string): KnowledgeGraphNode[] {
  const entry = getModuleGraphEntry(moduleId);
  if (!entry) return [];
  return entry.connected
    .filter((c) => c.node.type === 'module')
    .map((c) => c.node);
}

export function searchKnowledgeGraph(query: string, limit = 12): KnowledgeGraphSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const graph = buildKnowledgeGraph();

  const scored: KnowledgeGraphSearchHit[] = [];

  for (const node of graph.nodes) {
    let score = 0;
    if (node.name.toLowerCase().includes(q)) score += 10;
    if (node.description.toLowerCase().includes(q)) score += 6;
    if (node.purpose?.toLowerCase().includes(q)) score += 4;
    for (const kw of node.searchKeywords ?? []) {
      if (kw.includes(q)) score += 5;
      if (q.split(/\s+/).every((w) => kw.includes(w))) score += 8;
    }
    if (score <= 0) continue;
    scored.push({
      id: `graph:${node.id}`,
      nodeId: node.id,
      label: node.name,
      snippet: node.description.slice(0, 140),
      type: node.type,
      moduleId: node.moduleId ?? (node.type === 'module' ? node.id : undefined),
      route: node.route,
      manualChapter: node.relatedManualChapter,
      score,
    });
  }

  for (const wf of graph.workflows) {
    if (wf.title.toLowerCase().includes(q) || wf.subtitle?.toLowerCase().includes(q)) {
      scored.push({
        id: `graph-wf:${wf.id}`,
        nodeId: wf.id,
        label: wf.title,
        snippet: wf.subtitle ?? wf.nodeIds.join(' → '),
        type: 'workflow',
        workflowId: wf.id,
        score: 12,
      });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getMissingDocumentationNodes(): KnowledgeGraphNode[] {
  const graph = buildKnowledgeGraph();
  const moduleNodes = graph.nodes.filter((n) => n.type === 'module');
  return moduleNodes.filter((n) => {
    const hasSteps = graph.nodes.some((s) => s.parentNodeId === n.id && s.type === 'tutorial-step');
    const hasEdges = graph.edges.some((e) => e.fromId === n.id || e.toId === n.id);
    return !hasSteps || !hasEdges;
  });
}

export function relationLabel(type: KnowledgeGraphRelationType): string {
  return type.replace(/-/g, ' ').toUpperCase();
}
