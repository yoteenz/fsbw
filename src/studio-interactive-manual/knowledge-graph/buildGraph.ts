import { ADMIN_STUDIO_MODULES } from '../../utils/adminStudioNavigation';
import { KNOWLEDGE_PAGE_GUIDES, type KnowledgePageGuide } from '../../utils/adminStudioKnowledgeHubDemo';
import { getAllManualModules } from '../registry';
import type { KnowledgeGraph, KnowledgeGraphEdge, KnowledgeGraphNode } from './schema';
import {
  SEED_GRAPH_EDGES,
  SEED_GRAPH_NODES,
  SEED_GRAPH_WORKFLOWS,
  SUB_MODULE_GRAPH_NODES,
} from './seedGraph';

let cachedGraph: KnowledgeGraph | null = null;

function moduleToNode(mod: (typeof ADMIN_STUDIO_MODULES)[number]): KnowledgeGraphNode {
  const guide = KNOWLEDGE_PAGE_GUIDES.find((g) => g.moduleId === mod.id);
  return {
    id: mod.id,
    name: mod.title,
    type: 'module',
    description: guide?.purpose ?? mod.purpose,
    purpose: guide?.whyItExists ?? mod.purpose,
    route: mod.route.split('?')[0],
    moduleId: mod.id,
    relatedManualChapter: guide?.ownersManualChapter,
    versionIntroduced: mod.status === 'live' ? 'studio os' : undefined,
    status: mod.status === 'coming-soon' ? 'coming-soon' : mod.status,
    searchKeywords: [
      mod.id,
      mod.title.toLowerCase(),
      mod.purpose.toLowerCase(),
      ...(guide?.whenToUse.map((w) => w.toLowerCase()) ?? []),
    ],
  };
}

function manualStepNodes(): KnowledgeGraphNode[] {
  const nodes: KnowledgeGraphNode[] = [];
  for (const mod of getAllManualModules()) {
    for (const step of mod.steps) {
      nodes.push({
        id: `step:${mod.id}:${step.id}`,
        name: step.title,
        type: step.nodeKind === 'workflow' ? 'workflow' : step.widgetId ? 'widget' : 'tutorial-step',
        description: step.body,
        purpose: step.benefit,
        route: step.route,
        targetSelector: step.targetSelector,
        moduleId: mod.id,
        parentNodeId: mod.id,
        relatedManualChapter: step.writtenDocChapter,
        searchKeywords: [step.title.toLowerCase(), step.body.toLowerCase()],
      });
    }
  }
  return nodes;
}

function mergeNodes(existing: KnowledgeGraphNode[], incoming: KnowledgeGraphNode[]): KnowledgeGraphNode[] {
  const byId = new Map(existing.map((n) => [n.id, n]));
  for (const node of incoming) {
    if (!byId.has(node.id)) byId.set(node.id, node);
    else {
      const prev = byId.get(node.id)!;
      byId.set(node.id, { ...prev, ...node, searchKeywords: [...new Set([...(prev.searchKeywords ?? []), ...(node.searchKeywords ?? [])])] });
    }
  }
  return [...byId.values()];
}

export function buildKnowledgeGraph(): KnowledgeGraph {
  if (cachedGraph) return cachedGraph;

  const moduleNodes = ADMIN_STUDIO_MODULES.map(moduleToNode);
  const stepNodes = manualStepNodes();

  const nodes = mergeNodes(
    mergeNodes(mergeNodes(moduleNodes, SUB_MODULE_GRAPH_NODES), SEED_GRAPH_NODES),
    stepNodes
  );

  const edges: KnowledgeGraphEdge[] = [...SEED_GRAPH_EDGES];

  for (const step of stepNodes) {
    if (step.parentNodeId) {
      edges.push({
        id: `edge-step-${step.id}`,
        fromId: step.parentNodeId,
        toId: step.id,
        type: 'contains',
        label: 'WALKTHROUGH STEP',
      });
    }
  }

  for (const guide of KNOWLEDGE_PAGE_GUIDES) {
    for (const link of guide.relatedPages) {
      const target = KNOWLEDGE_PAGE_GUIDES.find((g) => g.route === link.route);
      if (target) {
        edges.push({
          id: `edge-related-${guide.moduleId}-${target.moduleId}`,
          fromId: guide.moduleId,
          toId: target.moduleId,
          type: 'related-to',
          label: link.label,
        });
      }
    }
  }

  cachedGraph = {
    nodes,
    edges,
    workflows: SEED_GRAPH_WORKFLOWS,
  };
  return cachedGraph;
}

export function invalidateKnowledgeGraphCache(): void {
  cachedGraph = null;
}

export function getSubModulePageGuides(): Partial<KnowledgePageGuide>[] {
  return SUB_MODULE_GRAPH_NODES.map((n) => ({
    moduleId: n.moduleId!,
    title: n.name,
    route: n.route!,
    purpose: n.description,
    whyItExists: n.purpose ?? n.description,
    whenToUse: [`When working in ${n.name}`],
    bestPractices: ['Follow Creative DNA before generating', 'Verify Smart Asset Registry after factory runs'],
    commonMistakes: ['Skipping approval gates', 'Ignoring FALLBACK_USED warnings'],
    relatedPages: [],
    exampleWorkflows: [],
    relatedAssets: [],
    ownersManualChapter: n.relatedManualChapter ?? `CHAPTER · ${n.name}`,
    tourSteps: [
      'Review module purpose and status',
      'Walk through each tab on the live workspace',
      'Confirm connected modules in the Knowledge Graph',
    ],
  }));
}
