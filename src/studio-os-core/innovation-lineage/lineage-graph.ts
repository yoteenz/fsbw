import { INNOVATION_ASSET_KIND_LABELS, LINEAGE_RELATION_LABELS } from './constants';
import type {
  InnovationGraph,
  LineageGraphEdge,
  LineageGraphNode,
  LineageTimelineStep,
} from './types';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 6)}`;
}

function edge(
  from: string,
  to: string,
  type: LineageGraphEdge['relationType'],
  actor?: string,
  offsetDays = 0
): LineageGraphEdge {
  return {
    id: uid('edge'),
    fromNodeId: from,
    toNodeId: to,
    relationType: type,
    relationLabel: LINEAGE_RELATION_LABELS[type],
    actorName: actor,
    at: new Date(Date.now() - offsetDays * 86_400_000).toISOString(),
  };
}

function node(
  id: string,
  innovationId: string,
  title: string,
  kind: LineageGraphNode['assetKind'],
  opts: Partial<LineageGraphNode> = {}
): LineageGraphNode {
  return {
    id,
    innovationId,
    title,
    assetKind: kind,
    assetKindLabel: INNOVATION_ASSET_KIND_LABELS[kind],
    published: false,
    marketplaceBestseller: false,
    companiesUsing: 0,
    ...opts,
  };
}

/** Flagship demo lineage: Luxury Customer Experience HQ™ */
export function buildLuxuryCustomerExperienceLineageGraph(): InnovationGraph {
  const n1 = node('ln-hospitality', 'INNOV-HOSP-01', 'Luxury Hospitality Blueprint™', 'blueprint', {
    published: true,
    companiesUsing: 2400,
  });
  const n2 = node('ln-retail', 'INNOV-RETL-02', 'Retail Experience System™', 'workflow', {
    published: true,
    companiesUsing: 8200,
  });
  const n3 = node('ln-auto', 'INNOV-AUTO-03', 'Automation Operations™', 'ai-system', {
    published: true,
    companiesUsing: 5100,
  });
  const n4 = node('ln-hq', 'INNOV-HQ-04', 'Luxury Customer Experience HQ™', 'headquarters', {
    published: true,
    marketplaceBestseller: true,
    companiesUsing: 18_400,
  });

  return {
    rootNodeId: n1.id,
    nodes: [n1, n2, n3, n4],
    edges: [
      edge(n1.id, n4.id, 'inspired-by', undefined, 120),
      edge(n1.id, n2.id, 'forked-from', 'Founder A', 90),
      edge(n2.id, n4.id, 'merged-with', undefined, 45),
      edge(n3.id, n4.id, 'merged-with', 'Marcus Chen', 30),
      edge(n4.id, n4.id, 'enhanced-by', 'Elena Voss', 14),
      edge(n4.id, n4.id, 'enhanced-by', 'Founder', 7),
      edge(n4.id, n4.id, 'enhanced-by', 'Dr. Amara Okonkwo', 3),
      edge(n4.id, n4.id, 'current-maintainer', 'Founder', 0),
    ],
  };
}

export function buildLineageTimelineFromGraph(graph: InnovationGraph): LineageTimelineStep[] {
  const root = graph.nodes.find((n) => n.id === graph.rootNodeId) ?? graph.nodes[0]!;
  const flagship = graph.nodes.find((n) => n.marketplaceBestseller) ?? graph.nodes[graph.nodes.length - 1]!;

  const steps: LineageTimelineStep[] = [
    {
      id: uid('step'),
      label: root.title,
      detail: 'Original vision seeded in Studio World™',
      at: new Date(Date.now() - 150 * 86_400_000).toISOString(),
      kind: 'origin',
    },
  ];

  const inspired = graph.edges.find((e) => e.relationType === 'inspired-by');
  if (inspired) {
    steps.push({
      id: uid('step'),
      label: `Inspired by ${root.title}`,
      detail: `Lineage connection preserved — ${LINEAGE_RELATION_LABELS['inspired-by']}`,
      at: inspired.at,
      kind: 'inspiration',
    });
  }

  graph.edges
    .filter((e) => e.relationType === 'forked-from')
    .forEach((e) => {
      const forkNode = graph.nodes.find((n) => n.id === e.toNodeId);
      if (forkNode) {
        steps.push({
          id: uid('step'),
          label: `Forked into ${forkNode.title}`,
          detail: e.actorName ? `Fork by ${e.actorName}` : 'Fork preserved in Innovation Graph™',
          at: e.at,
          kind: 'fork',
        });
      }
    });

  graph.edges
    .filter((e) => e.relationType === 'merged-with')
    .forEach((e) => {
      const mergeNode = graph.nodes.find((n) => n.id === e.fromNodeId);
      if (mergeNode) {
        steps.push({
          id: uid('step'),
          label: `Merged with ${mergeNode.title}`,
          detail: e.actorName ? `Merge led by ${e.actorName}` : 'Successful merge recorded',
          at: e.at,
          kind: 'merge',
        });
      }
    });

  const enhancers = graph.edges.filter((e) => e.relationType === 'enhanced-by' && e.actorName);
  if (enhancers.length > 0) {
    steps.push({
      id: uid('step'),
      label: `Enhanced by ${[...new Set(enhancers.map((e) => e.actorName!))].join(', ')}`,
      detail: 'Contribution Timeline™ — every meaningful contribution attributed',
      at: enhancers[0]!.at,
      kind: 'enhancement',
    });
  }

  steps.push({
    id: uid('step'),
    label: 'Published',
    detail: `${flagship.title} entered Marketplace™ with full lineage`,
    at: new Date(Date.now() - 20 * 86_400_000).toISOString(),
    kind: 'publish',
  });

  if (flagship.marketplaceBestseller) {
    steps.push({
      id: uid('step'),
      label: 'Marketplace Bestseller™',
      detail: 'Innovation Reach™ expanded across Studio World',
      at: new Date(Date.now() - 10 * 86_400_000).toISOString(),
      kind: 'milestone',
    });
  }

  steps.push({
    id: uid('step'),
    label: `Currently used by ${flagship.companiesUsing.toLocaleString()}+ companies`,
    detail: 'Living adoption — Intellectual Equity™ compounds',
    at: new Date().toISOString(),
    kind: 'adoption',
  });

  return steps;
}

export function summarizeLineageGraph(graph: InnovationGraph): string {
  const gens = graph.nodes.length;
  const forks = graph.edges.filter((e) => e.relationType === 'forked-from').length;
  const flagship = graph.nodes.find((n) => n.marketplaceBestseller);
  return `${gens} generations · ${forks} forks · ${flagship ? `${flagship.companiesUsing.toLocaleString()} companies using ${flagship.title}` : 'lineage preserved'}`;
}
