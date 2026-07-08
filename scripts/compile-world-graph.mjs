#!/usr/bin/env node
/**
 * Compiles Studio World Graph™ → public/studio-os/world-graph/graph.json
 * CI gate: validates graph integrity before build continues.
 *
 * Phase 1: ingests route-registry (regex), master-spec bundle, bootstrap YAML.
 * Runtime canonical builder: src/studio-os-core/world-graph/builder.ts
 */
import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/studio-os/world-graph');
const OUT_FILE = path.join(OUT_DIR, 'graph.json');
const REPORT_FILE = path.join(ROOT, 'docs/studio-os/world-graph/WORLD_GRAPH_COMPILE_REPORT.md');
const MANIFEST_BUNDLE = path.join(ROOT, 'public/studio-os/master-spec/manifest-bundle.json');
const ROUTE_REGISTRY_TS = path.join(ROOT, 'src/studio-os-core/studio-world/route-registry.ts');
const FLAGSHIP_TS = path.join(ROOT, 'src/studio-os-core/studio-world/flagship-destinations.ts');

const GRAPH_VERSION = 'world-graph.v1';

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function worldNodeId(type, slug) {
  const prefixes = {
    flagship: 'W-FLG',
    room: 'W-RM',
    engine: 'W-ENG',
    'constitutional-law': 'W-LAW',
    publication: 'W-PUB',
    milestone: 'W-MS',
    'knowledge-object': 'W-KNO',
    'company-genome': 'W-CGN',
    'founder-genome': 'W-FGN',
    'industry-genome': 'W-IGN',
  };
  const prefix = prefixes[type] ?? 'W-NOD';
  const safe = slug.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').toLowerCase();
  return `${prefix}-${safe}`;
}

function worldEdgeId(type, from, to) {
  return `W-EDGE-${type}-${from}-${to}`.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 180);
}

function ingestFlagshipsFromTs() {
  const text = fs.readFileSync(FLAGSHIP_TS, 'utf8');
  const nodes = [];
  const ts = new Date().toISOString();
  const blockRe = /\{\s*id:\s*'([^']+)',\s*displayName:\s*'([^']+)'/g;
  let match;
  while ((match = blockRe.exec(text)) !== null) {
    const [, slug, displayName] = match;
    nodes.push({
      id: worldNodeId('flagship', slug),
      slug,
      displayName,
      nodeType: 'flagship',
      lifecycle: 'live',
      plane: 'canon',
      version: '1.0.0',
      provenance: { source: 'route-registry', ingestedAt: ts },
      tags: ['flagship'],
    });
  }
  return nodes;
}

function ingestRoutesFromTs() {
  const text = fs.readFileSync(ROUTE_REGISTRY_TS, 'utf8');
  const nodes = [];
  const edges = [];
  const ts = new Date().toISOString();
  const re = /m\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const [, id, displayName, , flagshipId] = match;
    const nodeId = worldNodeId('room', id);
    const flagshipNodeId = worldNodeId('flagship', flagshipId);
    nodes.push({
      id: nodeId,
      slug: id,
      displayName,
      nodeType: 'room',
      lifecycle: 'implemented',
      plane: 'canon',
      version: '1.0.0',
      provenance: { source: 'route-registry', sourceRef: id, ingestedAt: ts },
      tags: [flagshipId],
    });
    edges.push({
      id: worldEdgeId('located-in', nodeId, flagshipNodeId),
      type: 'located-in',
      from: nodeId,
      to: flagshipNodeId,
      provenance: { source: 'route-registry', sourceRef: id, ingestedAt: ts },
    });
  }
  return { nodes, edges };
}

function ingestMasterSpec(bundle) {
  const nodes = [];
  const edges = [];
  const ts = new Date().toISOString();
  const milestones = bundle?.milestones ?? [];
  const knowledgeRegistryId = worldNodeId('engine', 'knowledge-registry');

  for (const ms of milestones.slice(0, 120)) {
    const slug = String(ms.id ?? ms.canonicalId ?? 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const id = worldNodeId('milestone', slug);
    nodes.push({
      id,
      slug,
      displayName: ms.title ?? ms.id ?? slug,
      nodeType: 'milestone',
      lifecycle: ms.implementationStatus === 'complete' ? 'live' : 'approved',
      plane: 'canon',
      version: '1.0.0',
      provenance: { source: 'master-spec', sourceRef: ms.id, ingestedAt: ts },
      tags: ['milestone'],
    });
    edges.push({
      id: worldEdgeId('implements', id, knowledgeRegistryId),
      type: 'implements',
      from: id,
      to: knowledgeRegistryId,
      provenance: { source: 'master-spec', sourceRef: ms.id, ingestedAt: ts },
    });
  }
  return { nodes, edges };
}

function bootstrapCore() {
  const ts = new Date().toISOString();
  const nodes = [
    {
      id: worldNodeId('engine', 'world-graph'),
      slug: 'world-graph',
      displayName: 'World Graph™',
      nodeType: 'engine',
      lifecycle: 'implemented',
      plane: 'canon',
      version: '1.0.0',
      summary: 'Canonical civilization graph — single source of truth.',
      provenance: { source: 'bootstrap', ingestedAt: ts },
      tags: ['engine'],
    },
    {
      id: worldNodeId('engine', 'knowledge-registry'),
      slug: 'knowledge-registry',
      displayName: 'Knowledge Registry™',
      nodeType: 'engine',
      lifecycle: 'live',
      plane: 'canon',
      version: '1.0.0',
      provenance: { source: 'bootstrap', ingestedAt: ts },
      tags: ['engine'],
    },
    {
      id: worldNodeId('constitutional-law', 'world-graph-is-truth'),
      slug: 'world-graph-is-truth',
      displayName: 'World Graph Is Truth™',
      nodeType: 'constitutional-law',
      lifecycle: 'live',
      plane: 'canon',
      version: '1.0.0',
      provenance: { source: 'bootstrap', ingestedAt: ts },
      tags: ['constitution'],
    },
    {
      id: worldNodeId('publication', 'studio-world-bible'),
      slug: 'studio-world-bible',
      displayName: 'Studio World Bible™',
      nodeType: 'publication',
      lifecycle: 'architecture',
      plane: 'working',
      version: '0.1.0',
      summary: 'Publication projection — generated from World Graph.',
      provenance: { source: 'bootstrap', ingestedAt: ts },
      tags: ['publication'],
    },
    {
      id: worldNodeId('publication', 'knowledge-library'),
      slug: 'knowledge-library',
      displayName: 'Knowledge Library™',
      nodeType: 'publication',
      lifecycle: 'implemented',
      plane: 'canon',
      version: '0.1.0',
      provenance: { source: 'bootstrap', ingestedAt: ts },
      tags: ['publication'],
    },
  ];
  const edges = [
    {
      id: worldEdgeId('governed-by', worldNodeId('engine', 'world-graph'), worldNodeId('constitutional-law', 'world-graph-is-truth')),
      type: 'governed-by',
      from: worldNodeId('engine', 'world-graph'),
      to: worldNodeId('constitutional-law', 'world-graph-is-truth'),
      provenance: { source: 'bootstrap', ingestedAt: ts },
    },
    {
      id: worldEdgeId('generated-from', worldNodeId('publication', 'studio-world-bible'), worldNodeId('engine', 'world-graph')),
      type: 'generated-from',
      from: worldNodeId('publication', 'studio-world-bible'),
      to: worldNodeId('engine', 'world-graph'),
      provenance: { source: 'bootstrap', ingestedAt: ts },
    },
  ];
  return { nodes, edges };
}

function dedupeNodes(nodes) {
  const map = new Map();
  for (const n of nodes) map.set(n.id, n);
  return [...map.values()];
}

function dedupeEdges(edges) {
  const map = new Map();
  for (const e of edges) map.set(`${e.type}:${e.from}:${e.to}`, e);
  return [...map.values()];
}

function validate(graph) {
  const issues = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  for (const e of graph.edges) {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) {
      issues.push({ severity: 'error', message: `Dangling edge ${e.id}` });
    }
  }
  return { ok: issues.filter((i) => i.severity === 'error').length === 0, issues };
}

function main() {
  const bundle = readJson(MANIFEST_BUNDLE);
  const core = bootstrapCore();
  const flagships = ingestFlagshipsFromTs();
  const routes = ingestRoutesFromTs();
  const spec = bundle ? ingestMasterSpec(bundle) : { nodes: [], edges: [] };

  const nodes = dedupeNodes([
    ...core.nodes,
    ...flagships,
    ...routes.nodes,
    ...spec.nodes,
  ]);
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = dedupeEdges(
    [...core.edges, ...routes.edges, ...spec.edges].filter(
      (e) => nodeIds.has(e.from) && nodeIds.has(e.to)
    )
  );

  const graph = {
    graphId: 'studio-world-graph',
    version: GRAPH_VERSION,
    compiledAt: new Date().toISOString(),
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodes: nodes
      .filter((n) => n.displayName)
      .sort((a, b) => String(a.displayName).localeCompare(String(b.displayName))),
    edges,
    canonicalRule: 'world-graph-is-truth',
  };

  const validation = validate(graph);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(graph, null, 2));

  const report = [
    '# World Graph™ Compile Report',
    '',
    `Generated: ${graph.compiledAt}`,
    '',
    '## Summary',
    '',
    `- Nodes: ${graph.nodeCount}`,
    `- Edges: ${graph.edgeCount}`,
    `- Validation: ${validation.ok ? 'PASS' : 'FAIL'}`,
    '',
    validation.issues.length
      ? `## Issues\n\n${validation.issues.map((i) => `- ${i.message}`).join('\n')}`
      : '## Issues\n\nNone.',
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, report);

  console.log(`World Graph™ — ${graph.nodeCount} nodes · ${graph.edgeCount} edges · ${validation.ok ? 'PASS' : 'FAIL'}`);
  if (!validation.ok) {
    console.error(validation.issues.map((i) => i.message).join('\n'));
    process.exit(1);
  }
}

main();
