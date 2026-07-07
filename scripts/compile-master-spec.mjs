#!/usr/bin/env node
/**
 * Compiles docs/studio-os/master-spec/*.yaml → public/studio-os/master-spec/manifest-bundle.json
 * Runs Architecture Validator™ as architectural gatekeeper before writing bundle.
 */
import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';
import { fileURLToPath } from 'url';
import { validateArchitecture, writeValidationReport } from './architecture-validator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SPEC_DIR = path.join(ROOT, 'docs/studio-os/master-spec');
const OUT_DIR = path.join(ROOT, 'public/studio-os/master-spec');
const OUT_FILE = path.join(OUT_DIR, 'manifest-bundle.json');
const GENERATED_DIR = path.join(ROOT, 'src/studio-os-core/manifest-reconciliation/generated');
const GENERATED_FILE = path.join(GENERATED_DIR, 'manifest-bundle.json');
const REPORT_FILE = path.join(ROOT, 'docs/studio-os/master-spec/MASTER_SPEC_RECONCILIATION.md');

const DEFAULT_MILESTONE_FILES = [
  'volume-i.yaml',
  'volume-ii.yaml',
  'volume-iii.yaml',
  'volume-iv.yaml',
  'volume-x.yaml',
  'volume-xi.yaml',
  'volume-xiv.yaml',
  'volume-v.yaml',
  'volume-vi-xix.yaml',
];

function readYaml(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return load(fs.readFileSync(filePath, 'utf8'));
}

function loadMilestones() {
  const index = readYaml(path.join(SPEC_DIR, 'milestones/index.yaml'));
  const files = index?.files ?? DEFAULT_MILESTONE_FILES;
  const milestones = [];
  for (const file of files) {
    const data = readYaml(path.join(SPEC_DIR, 'milestones', file));
    if (data?.milestones) milestones.push(...data.milestones);
  }
  return { milestones, files };
}

function loadChapters() {
  const index = readYaml(path.join(SPEC_DIR, 'milestones/index.yaml'));
  const files = index?.chapters ?? [];
  const chapters = [];
  for (const file of files) {
    const data = readYaml(path.join(SPEC_DIR, 'chapters', file));
    if (data?.chapters) {
      for (const ch of data.chapters) {
        chapters.push({ ...ch, volumeId: data.volumeId ?? ch.volumeId });
      }
    }
  }
  return chapters;
}

function main() {
  const constitution = readYaml(path.join(SPEC_DIR, 'constitution.yaml'));
  const volumes = readYaml(path.join(SPEC_DIR, 'volumes.yaml'));
  const designRevisions = readYaml(path.join(SPEC_DIR, 'design-revisions.yaml'));
  const corePhilosophies = readYaml(path.join(SPEC_DIR, 'core-philosophies.yaml'));
  const milestoneAliases = readYaml(path.join(SPEC_DIR, 'milestone-aliases.yaml'));
  const dependencyGraph = readYaml(path.join(SPEC_DIR, 'dependency-graph.yaml'));
  const { milestones, files: milestoneFiles } = loadMilestones();
  const chapters = loadChapters();
  const volumeICoverage = chapters.filter((c) => c.volumeId === 'volume-i');
  const volumeIMilestones = milestones.filter((m) => m.volumeId === 'volume-i');
  const volumeIICoverage = chapters.filter((c) => c.volumeId === 'volume-ii');
  const volumeIIMilestones = milestones.filter((m) => m.volumeId === 'volume-ii');
  const volumeIIIMilestones = milestones.filter((m) => m.volumeId === 'volume-iii');
  const volumeIIICoverage = chapters.filter((c) => c.volumeId === 'volume-iii');
  const volumeIVMilestones = milestones.filter((m) => m.volumeId === 'volume-iv');
  const volumeIVCoverage = chapters.filter((c) => c.volumeId === 'volume-iv');

  const specVersion = constitution?.version ?? volumes?.version ?? '1.0.0';
  const compiledAt = new Date().toISOString();

  const bundle = {
    version: specVersion,
    compiledAt,
    sourceRoot: 'docs/studio-os/master-spec',
    constitution,
    volumes: volumes?.volumes ?? [],
    chapters,
    milestones,
    designRevisions: designRevisions?.designRevisions ?? [],
    milestoneAliases: milestoneAliases?.aliases ?? [],
    dependencyEdges: dependencyGraph?.edges ?? [],
    corePhilosophies: corePhilosophies?.philosophies ?? [],
    stats: {
      volumeCount: volumes?.volumes?.length ?? 0,
      chapterCount: chapters.length,
      milestoneCount: milestones.length,
      designRevisionCount: designRevisions?.designRevisions?.length ?? 0,
      completeCount: milestones.filter((m) => m.implementationStatus === 'complete').length,
      inProgressCount: milestones.filter((m) => m.implementationStatus === 'in-progress').length,
      plannedCount: milestones.filter((m) => m.implementationStatus === 'planned').length,
      volumeIMilestoneCount: volumeIMilestones.length,
      volumeIChapterCount: volumeICoverage.length,
      volumeICompleteCount: volumeIMilestones.filter((m) => m.implementationStatus === 'complete').length,
      volumeIIMilestoneCount: volumeIIMilestones.length,
      volumeIIChapterCount: volumeIICoverage.length,
      volumeIICompleteCount: volumeIIMilestones.filter((m) => m.implementationStatus === 'complete').length,
      volumeIIIMilestoneCount: volumeIIIMilestones.length,
      volumeIIIChapterCount: volumeIIICoverage.length,
      volumeIIICompleteCount: volumeIIIMilestones.filter((m) => m.implementationStatus === 'complete').length,
      volumeIVMilestoneCount: volumeIVMilestones.length,
      volumeIVChapterCount: volumeIVCoverage.length,
      volumeIVCompleteCount: volumeIVMilestones.filter((m) => m.implementationStatus === 'complete').length,
      philosophyCount: corePhilosophies?.philosophies?.length ?? 0,
    },
  };

  const validation = validateArchitecture(bundle, milestoneFiles);
  const errorCount = writeValidationReport(validation, compiledAt);

  if (errorCount > 0) {
    console.error(`Architecture Validator™ — ${validation.errors} errors · ${validation.warnings} warnings — BUILD BLOCKED`);
    for (const i of validation.issues.filter((x) => x.severity === 'error').slice(0, 20)) {
      console.error(`  [${i.code}] ${i.message}`);
    }
    process.exit(1);
  }

  if (validation.warnings > 0) {
    console.warn(`Architecture Validator™ — 0 errors · ${validation.warnings} warnings`);
  } else {
    console.log('Architecture Validator™ — PASS');
  }

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
| Chapters | ${bundle.stats.chapterCount} |
| Milestones | ${bundle.stats.milestoneCount} |
| Volume I chapters | ${bundle.stats.volumeIChapterCount} |
| Volume I milestones | ${bundle.stats.volumeIMilestoneCount} |
| Volume I complete | ${bundle.stats.volumeICompleteCount} |
| Volume II chapters | ${bundle.stats.volumeIIChapterCount} |
| Volume II milestones | ${bundle.stats.volumeIIMilestoneCount} |
| Volume II complete | ${bundle.stats.volumeIICompleteCount} |
| Volume III chapters | ${bundle.stats.volumeIIIChapterCount} |
| Volume III milestones | ${bundle.stats.volumeIIIMilestoneCount} |
| Volume III complete | ${bundle.stats.volumeIIICompleteCount} |
| Volume IV chapters | ${bundle.stats.volumeIVChapterCount} |
| Volume IV milestones | ${bundle.stats.volumeIVMilestoneCount} |
| Volume IV complete | ${bundle.stats.volumeIVCompleteCount} |
| Core Philosophies | ${bundle.stats.philosophyCount} |
| Design Revisions | ${bundle.stats.designRevisionCount} |
| Complete | ${bundle.stats.completeCount} |
| In Progress | ${bundle.stats.inProgressCount} |
| Planned | ${bundle.stats.plannedCount} |

## Architecture Validation

See \`ARCHITECTURE_VALIDATION_REPORT.md\` — Architecture Validator™ gate: **PASS** (${validation.warnings} warnings)

## Source of Truth

- Specification: \`docs/studio-os/master-spec/\`
- Compiled bundle: \`public/studio-os/master-spec/manifest-bundle.json\`
- Consumed by: Knowledge Registry™, System Registry™, Manifest Reconciliation™

## Milestone ID Policy

- **Shipped badges** remain in user-facing navigation
- **Canonical IDs** appear in engineering surfaces only
- **QA chain** uses \`M159-spec-qa\` … \`M162-spec-qa\` canonical form
- See \`milestone-aliases.yaml\` for reconciliation
`;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Compiled ${bundle.stats.milestoneCount} milestones → ${OUT_FILE}`);
  console.log(`Report → ${REPORT_FILE}`);
}

main();
