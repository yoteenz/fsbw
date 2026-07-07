#!/usr/bin/env node
/**
 * Compiles docs/studio-os/master-spec/*.yaml → public/studio-os/master-spec/manifest-bundle.json
 * The specification lives in docs/; the bundle is a compiled consumption artifact only.
 */
import fs from 'fs';
import path from 'path';
import { load, dump } from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SPEC_DIR = path.join(ROOT, 'docs/studio-os/master-spec');
const OUT_DIR = path.join(ROOT, 'public/studio-os/master-spec');
const OUT_FILE = path.join(OUT_DIR, 'manifest-bundle.json');
const GENERATED_DIR = path.join(ROOT, 'src/studio-os-core/manifest-reconciliation/generated');
const GENERATED_FILE = path.join(GENERATED_DIR, 'manifest-bundle.json');
const REPORT_FILE = path.join(ROOT, 'docs/studio-os/master-spec/MASTER_SPEC_RECONCILIATION.md');

function readYaml(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return load(fs.readFileSync(filePath, 'utf8'));
}

function loadMilestones() {
  const index = readYaml(path.join(SPEC_DIR, 'milestones/index.yaml'));
  const files = index?.files ?? ['volume-ii-iv.yaml', 'volume-v.yaml', 'volume-vi-xix.yaml'];
  const milestones = [];
  for (const file of files) {
    const data = readYaml(path.join(SPEC_DIR, 'milestones', file));
    if (data?.milestones) milestones.push(...data.milestones);
  }
  return milestones;
}

function main() {
  const constitution = readYaml(path.join(SPEC_DIR, 'constitution.yaml'));
  const volumes = readYaml(path.join(SPEC_DIR, 'volumes.yaml'));
  const designRevisions = readYaml(path.join(SPEC_DIR, 'design-revisions.yaml'));
  const milestoneAliases = readYaml(path.join(SPEC_DIR, 'milestone-aliases.yaml'));
  const dependencyGraph = readYaml(path.join(SPEC_DIR, 'dependency-graph.yaml'));
  const milestones = loadMilestones();

  const bundle = {
    version: '1.0.0',
    compiledAt: new Date().toISOString(),
    sourceRoot: 'docs/studio-os/master-spec',
    constitution,
    volumes: volumes?.volumes ?? [],
    milestones,
    designRevisions: designRevisions?.designRevisions ?? [],
    milestoneAliases: milestoneAliases?.aliases ?? [],
    dependencyEdges: dependencyGraph?.edges ?? [],
    stats: {
      volumeCount: volumes?.volumes?.length ?? 0,
      milestoneCount: milestones.length,
      designRevisionCount: designRevisions?.designRevisions?.length ?? 0,
      completeCount: milestones.filter((m) => m.implementationStatus === 'complete').length,
      inProgressCount: milestones.filter((m) => m.implementationStatus === 'in-progress').length,
      plannedCount: milestones.filter((m) => m.implementationStatus === 'planned').length,
    },
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const json = JSON.stringify(bundle, null, 2);
  fs.writeFileSync(OUT_FILE, json);
  fs.writeFileSync(GENERATED_FILE, json);

  const report = `# Master Specification Reconciliation Report

Generated: ${bundle.compiledAt}

## Coverage

| Metric | Count |
|--------|-------|
| Volumes | ${bundle.stats.volumeCount} |
| Milestones | ${bundle.stats.milestoneCount} |
| Design Revisions | ${bundle.stats.designRevisionCount} |
| Complete | ${bundle.stats.completeCount} |
| In Progress | ${bundle.stats.inProgressCount} |
| Planned | ${bundle.stats.plannedCount} |

## Source of Truth

- Specification: \`docs/studio-os/master-spec/\`
- Compiled bundle: \`public/studio-os/master-spec/manifest-bundle.json\`
- Consumed by: Knowledge Registry™, System Registry™, Manifest Reconciliation™

## Milestone ID Policy

- **Shipped badges** remain in user-facing navigation
- **Canonical IDs** appear in engineering surfaces only
- See \`milestone-aliases.yaml\` for reconciliation

## Next Steps

1. Review bundle stats against expected coverage
2. Run Manifest Reconciliation™ against live modules
3. Present architecture for review before product feature work
`;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Compiled ${bundle.stats.milestoneCount} milestones → ${OUT_FILE}`);
  console.log(`Report → ${REPORT_FILE}`);
}

main();
