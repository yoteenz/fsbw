#!/usr/bin/env npx tsx
/**
 * Compiles Studio World Graph™ from canonical TypeScript builder → graph.json
 * Invoked by scripts/compile-world-graph.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertWorldGraphValid, buildWorldGraph } from '../src/studio-os-core/world-graph/builder';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/studio-os/world-graph');
const OUT_FILE = path.join(OUT_DIR, 'graph.json');
const REPORT_FILE = path.join(ROOT, 'docs/studio-os/world-graph/WORLD_GRAPH_COMPILE_REPORT.md');
const MANIFEST_BUNDLE = path.join(ROOT, 'public/studio-os/master-spec/manifest-bundle.json');

function readJson(filePath: string) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const bundle = readJson(MANIFEST_BUNDLE);
  const milestones = bundle?.milestones ?? [];

  const result = buildWorldGraph({
    masterSpecMilestones: milestones.slice(0, 120).map((ms: Record<string, unknown>) => ({
      id: String(ms.id ?? ms.canonicalId ?? 'unknown'),
      title: String(ms.title ?? ms.id ?? 'Milestone'),
      implementationStatus: ms.implementationStatus as string | undefined,
    })),
  });

  assertWorldGraphValid(result);
  const graph = {
    ...result.graph,
    nodes: [...result.graph.nodes]
      .filter((n) => n.displayName)
      .sort((a, b) => String(a.displayName).localeCompare(String(b.displayName))),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(graph, null, 2));

  const warnings = result.validation.issues.filter((i) => i.severity === 'warning');
  const report = [
    '# World Graph™ Compile Report',
    '',
    `Generated: ${graph.compiledAt}`,
    '',
    '## Summary',
    '',
    `- Nodes: ${graph.nodeCount}`,
    `- Edges: ${graph.edgeCount}`,
    `- Validation: PASS`,
    `- Builder: TypeScript canonical (\`buildWorldGraph\`)`,
    '',
    warnings.length
      ? `## Warnings\n\n${warnings.map((i) => `- ${i.message}`).join('\n')}`
      : '## Warnings\n\nNone.',
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, report);

  console.log(`World Graph™ — ${graph.nodeCount} nodes · ${graph.edgeCount} edges · PASS`);
}

main();
