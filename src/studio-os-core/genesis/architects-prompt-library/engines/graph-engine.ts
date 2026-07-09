import { readArchitectsPromptLibraryStore } from '../persistence';
import type { AplGraphEdge, AplGraphNode, AplPromptTemplate } from '../types';
import { listPromptTemplates } from '../bootstrap/seed';

export function searchPrompts(query: string): AplPromptTemplate[] {
  const q = query.trim().toLowerCase();
  if (!q) return listPromptTemplates();

  return listPromptTemplates().filter((p) => {
    const haystack = [
      p.officialName,
      p.purpose,
      p.body,
      p.author,
      ...p.tags,
      ...p.requiredContext,
      ...p.expectedDeliverables,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function buildKnowledgeGraph(): { nodes: AplGraphNode[]; edges: AplGraphEdge[] } {
  const store = readArchitectsPromptLibraryStore();
  const nodes: AplGraphNode[] = [];
  const edges: AplGraphEdge[] = [];
  const seen = new Set<string>();

  function addNode(node: AplGraphNode) {
    if (seen.has(node.nodeId)) return;
    seen.add(node.nodeId);
    nodes.push(node);
  }

  for (const p of store.prompts) {
    addNode({
      nodeId: p.promptId,
      label: p.officialName,
      kind: 'prompt',
      category: p.category,
      canonical: p.canonical,
    });
  }

  for (const ref of store.genesisRefs) {
    const nodeId = `genesis:${ref.articlePath}`;
    addNode({ nodeId, label: ref.articleTitle, kind: 'genesis' });
    edges.push({
      edgeId: `edge-${ref.refId}`,
      fromId: ref.promptId,
      toId: nodeId,
      relationshipType: ref.relationship === 'implements' ? 'implements' : 'derives-from',
    });
  }

  for (const ref of store.launchStackRefs) {
    const nodeId = `milestone:${ref.milestoneId}`;
    addNode({ nodeId, label: ref.milestoneLabel, kind: 'milestone' });
    edges.push({
      edgeId: `edge-${ref.refId}`,
      fromId: ref.promptId,
      toId: nodeId,
      relationshipType: 'implements',
    });
  }

  for (const ref of store.coreSystemRefs) {
    const nodeId = `system:${ref.systemId}`;
    addNode({ nodeId, label: ref.systemLabel, kind: 'system' });
    edges.push({
      edgeId: `edge-${ref.refId}`,
      fromId: ref.promptId,
      toId: nodeId,
      relationshipType: 'depends-on',
    });
  }

  for (const rel of store.relationships) {
    if (rel.toKind === 'prompt') {
      edges.push({
        edgeId: rel.relationshipId,
        fromId: rel.fromPromptId,
        toId: rel.toRef,
        relationshipType: rel.relationshipType,
      });
    } else {
      const toId = `${rel.toKind}:${rel.toRef}`;
      addNode({ nodeId: toId, label: rel.toLabel, kind: rel.toKind === 'genesis-article' ? 'genesis' : rel.toKind === 'launch-stack' ? 'milestone' : 'system' });
      edges.push({
        edgeId: rel.relationshipId,
        fromId: rel.fromPromptId,
        toId,
        relationshipType: rel.relationshipType,
      });
    }
  }

  for (const out of store.outputs) {
    const nodeId = `output:${out.outputId}`;
    addNode({ nodeId, label: out.label, kind: 'output' });
    edges.push({
      edgeId: `edge-out-${out.outputId}`,
      fromId: out.promptId,
      toId: nodeId,
      relationshipType: 'produced',
    });
  }

  for (const exec of store.executions) {
    edges.push({
      edgeId: `edge-exec-${exec.executionId}`,
      fromId: exec.promptId,
      toId: `exec:${exec.executionId}`,
      relationshipType: 'executed',
    });
  }

  return { nodes, edges };
}

export function getLineageForPrompt(promptId: string) {
  const store = readArchitectsPromptLibraryStore();
  return store.versions
    .filter((v) => v.promptId === promptId)
    .sort((a, b) => b.semver.localeCompare(a.semver, undefined, { numeric: true }));
}

export function getExecutionTimeline(promptId?: string) {
  const store = readArchitectsPromptLibraryStore();
  const execs = promptId
    ? store.executions.filter((e) => e.promptId === promptId)
    : store.executions;
  return [...execs].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

export function getDependenciesForPrompt(promptId: string) {
  return readArchitectsPromptLibraryStore().dependencies.filter((d) => d.promptId === promptId);
}

export function getRelationshipsForPrompt(promptId: string) {
  return readArchitectsPromptLibraryStore().relationships.filter(
    (r) => r.fromPromptId === promptId
  );
}

export function comparePromptVersions(promptId: string, versionA: string, versionB: string) {
  const store = readArchitectsPromptLibraryStore();
  return (
    store.comparisons.find(
      (c) => c.promptId === promptId && c.versionA === versionA && c.versionB === versionB
    ) ??
    store.comparisons.find(
      (c) => c.promptId === promptId && c.versionA === versionB && c.versionB === versionA
    )
  );
}
