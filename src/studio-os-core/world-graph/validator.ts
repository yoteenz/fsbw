import type { WorldGraph, WorldGraphValidationIssue, WorldGraphValidationResult } from './types';
import { getWorldNode, listIncomingEdges, listOutgoingEdges } from './graph';

const REQUIRED_ROOT_TYPES = ['engine', 'flagship'] as const;

export function validateWorldGraph(graph: WorldGraph): WorldGraphValidationResult {
  const issues: WorldGraphValidationIssue[] = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));

  let danglingEdges = 0;
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      danglingEdges++;
      issues.push({
        severity: 'error',
        code: 'DANGLING_EDGE',
        message: `Edge ${edge.id} references missing node`,
        edgeId: edge.id,
      });
    }
    if (edge.from === edge.to) {
      issues.push({
        severity: 'warning',
        code: 'SELF_EDGE',
        message: `Self-referential edge on ${edge.from}`,
        edgeId: edge.id,
      });
    }
  }

  let orphans = 0;
  for (const node of graph.nodes) {
    const hasEdge =
      listOutgoingEdges(graph, node.id).length > 0 || listIncomingEdges(graph, node.id).length > 0;
    const isRoot = REQUIRED_ROOT_TYPES.includes(node.nodeType as (typeof REQUIRED_ROOT_TYPES)[number]);
    if (!hasEdge && !isRoot && node.nodeType !== 'constitutional-law') {
      orphans++;
      issues.push({
        severity: 'warning',
        code: 'ORPHAN_NODE',
        message: `Node ${node.displayName} (${node.id}) has no relationships`,
        nodeId: node.id,
      });
    }

    if (!node.displayName?.trim()) {
      issues.push({
        severity: 'error',
        code: 'MISSING_DISPLAY_NAME',
        message: `Node ${node.id} missing display name`,
        nodeId: node.id,
      });
    }
  }

  const worldGraphEngine = getWorldNode(graph, 'W-ENG-world-graph');
  if (!worldGraphEngine) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_WORLD_GRAPH_ENGINE',
      message: 'World Graph™ engine node not registered',
    });
  }

  const errors = issues.filter((i) => i.severity === 'error');

  return {
    ok: errors.length === 0,
    issues,
    stats: {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      orphans,
      danglingEdges,
    },
  };
}
