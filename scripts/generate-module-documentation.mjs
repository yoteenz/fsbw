#!/usr/bin/env node
/**
 * Generates docs/studio-os/{moduleId}.md for complete milestones missing documentation.
 * Architecture-quality stubs — authoritative enough for engineer onboarding.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load } from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SPEC_DIR = path.join(ROOT, 'docs/studio-os/master-spec');
const DOCS_DIR = path.join(ROOT, 'docs/studio-os');
const MODULES_FILE = path.join(ROOT, 'src/studio-os-core/core/modules.ts');

function readYaml(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return load(fs.readFileSync(filePath, 'utf8'));
}

function loadMilestones() {
  const index = readYaml(path.join(SPEC_DIR, 'milestones/index.yaml'));
  const milestones = [];
  for (const file of index?.files ?? []) {
    const data = readYaml(path.join(SPEC_DIR, 'milestones', file));
    if (data?.milestones) milestones.push(...data.milestones);
  }
  return milestones;
}

function parseModules() {
  const raw = fs.readFileSync(MODULES_FILE, 'utf8');
  const modules = new Map();
  const blockRe = /id:\s*'([^']+)'[\s\S]*?label:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'[\s\S]*?routeSegment:\s*'([^']+)'/g;
  let m;
  while ((m = blockRe.exec(raw)) !== null) {
    modules.set(m[1], { id: m[1], label: m[2], description: m[3], routeSegment: m[4] });
  }
  return modules;
}

function findModulePath(moduleId) {
  const candidate = path.join(ROOT, 'src/studio-os-core', moduleId);
  if (fs.existsSync(candidate)) return `src/studio-os-core/${moduleId}/`;
  return `src/studio-os-core/${moduleId}/ (planned path)`;
}

function renderDoc(milestone, mod) {
  const id = milestone.moduleId;
  const name = milestone.name ?? mod?.label ?? id;
  const shipped = milestone.shippedMilestone ?? milestone.canonicalId;
  const volume = milestone.volumeId ?? '—';
  const purpose = milestone.purpose ?? mod?.description ?? 'Studio OS engineering module.';
  const route = mod?.routeSegment ? `/admin/studio/${mod.routeSegment}` : '—';
  const codePath = findModulePath(id);
  const related = (milestone.relatedSystems ?? []).join(' · ') || 'See Master Specification dependency graph';
  const notes = milestone.implementationNotes ?? 'Registered in Master Specification.';

  return `# ${name}

**Milestone:** ${shipped} · **Volume:** ${volume} · **Module ID:** \`${id}\`

${route !== '—' ? `**Route:** \`${route}\`\n` : ''}
## Purpose

${purpose}

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | \`${milestone.canonicalId}\` |
| Internal ID | \`${milestone.internalId ?? id}\` |
| Implementation | ${milestone.implementationStatus} |
| Chapter | ${milestone.chapterId ?? '—'} |

## Architecture

| Layer | Path |
|-------|------|
| Module root | \`${codePath}\` |
| System Registry | Registered via \`knowledge-registry\` + \`system-registry\` |
| Master Spec | \`docs/studio-os/master-spec/milestones/\` |

## Related systems

${related}

## Engineering notes

${notes}

## Consumers

- Studio OS Knowledge Registry™ (M126)
- System Registry™ (M127)
- Command Dock™ · Studio Intelligence™ · Documentation Governance™ (M126.5)
- Architecture Validator™ — documentation coverage gate

## QA & release

Complete modules require this file per Architecture Validator™. No production release without registry, documentation, and trust checks per Constitution™.

---
_Auto-authored from Master Specification — ${new Date().toISOString().slice(0, 10)}_
`;
}

function main() {
  const milestones = loadMilestones();
  const modules = parseModules();
  const missing = milestones.filter(
    (m) => m.implementationStatus === 'complete' && m.moduleId && !fs.existsSync(path.join(DOCS_DIR, `${m.moduleId}.md`))
  );

  let written = 0;
  for (const m of missing) {
    const mod = modules.get(m.moduleId);
    const content = renderDoc(m, mod);
    const out = path.join(DOCS_DIR, `${m.moduleId}.md`);
    fs.writeFileSync(out, content);
    written++;
    console.log(`Wrote ${m.moduleId}.md`);
  }

  // Knowledge Registry alias doc (M126 moduleId)
  if (!fs.existsSync(path.join(DOCS_DIR, 'knowledge-registry.md'))) {
    const m126 = milestones.find((m) => m.canonicalId === 'M126');
    if (m126) {
      const content = `# Studio OS Knowledge Registry™

**Milestone:** M126 · **Volume:** volume-ii · **Module ID:** \`knowledge-registry\`

**Route:** \`/admin/studio/documentation-registry\` (Knowledge Registry™ supersedes Documentation Registry™ naming)

## Purpose

Single source of truth for platform knowledge architecture — Master Specification, module documentation, manifest reconciliation, and every documentation consumer.

> One Knowledge Registry™. One Master Specification. Zero shadow roadmaps.

## Core philosophy

- **Documentation as Architecture** — specs and registries are as authoritative as code
- **Single Source of Truth** — Volumes, milestones, philosophies, and design revisions exist exactly once
- **Registry-driven** — every important object is searchable, documented, auditable, and QA-gated

## Architecture

| Layer | Path |
|-------|------|
| Knowledge Registry (canonical) | \`src/studio-os-core/knowledge-registry/\` |
| Legacy documentation-registry bridge | \`src/studio-os-core/documentation-registry/\` |
| Manifest compile + validation | \`scripts/compile-master-spec.mjs\`, \`scripts/architecture-validator.mjs\` |
| Master Specification | \`docs/studio-os/master-spec/\` |
| Compiled bundle | \`public/studio-os/master-spec/manifest-bundle.json\` |

## Key capabilities

- Registry builder and registration API
- Smart search and contextual documentation
- Walkthrough, Academy, and manual auto-sync
- Health dashboard and version history
- Command Dock advisor integration
- Feeds System Registry™ (M127) and Executive Strategy Floor™ (DR-005)

## Related systems

manifest-reconciliation · manifest-authoring · system-registry · documentation-sync · documentation-governance · DR-005

## Milestone closure (M126)

Knowledge Registry™ is **complete** when:

1. Master Specification compiles with Architecture Validator™ PASS
2. Per-volume milestone manifests and chapter structures are authoritative
3. Core Philosophy™ (16 principles) registered
4. Constitution™ includes registry-driven and single-source principles
5. Documentation Governance™ (M126.5) audits coverage via this registry

## Consumers

Studio Manual · Academy · Search · Command Dock · Studio Intelligence™ · Engineering Excellence Dashboard™ · Platform Readiness Review

---
_Formal M126 closure — ${new Date().toISOString().slice(0, 10)}_
`;
      fs.writeFileSync(path.join(DOCS_DIR, 'knowledge-registry.md'), content);
      written++;
      console.log('Wrote knowledge-registry.md');
    }
  }

  console.log(`Generated ${written} documentation files.`);
}

main();
