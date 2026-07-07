#!/usr/bin/env node
/**
 * Architecture Validator™ — compile-time gatekeeper for Studio OS Master Specification.
 * Validates dependency integrity, registry integrity, naming, circular deps, and more.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SPEC_DIR = path.join(ROOT, 'docs/studio-os/master-spec');
const DOCS_STUDIO = path.join(ROOT, 'docs/studio-os');
const REPORT_FILE = path.join(SPEC_DIR, 'ARCHITECTURE_VALIDATION_REPORT.md');

const IMPLEMENTATION_STATUSES = new Set(['planned', 'in-progress', 'complete', 'deprecated', 'merged']);

/** @typedef {{ severity: 'error' | 'warning', code: string, message: string, entityId?: string }} ValidationIssue */

/** @param {ValidationIssue[]} issues */
function issue(issues, severity, code, message, entityId) {
  issues.push({ severity, code, message, entityId });
}

/**
 * @param {object} bundle
 * @param {string[]} milestoneFiles
 */
export function validateArchitecture(bundle, milestoneFiles = []) {
  /** @type {ValidationIssue[]} */
  const issues = [];
  const milestones = bundle.milestones ?? [];
  const chapters = bundle.chapters ?? [];
  const volumes = bundle.volumes ?? [];
  const designRevisions = bundle.designRevisions ?? [];
  const aliases = bundle.milestoneAliases ?? [];
  const edges = bundle.dependencyEdges ?? [];
  const constitution = bundle.constitution ?? {};

  const volumeIds = new Set(volumes.map((v) => v.id));
  const chapterIds = new Set(chapters.map((c) => c.id));
  const milestoneByCanonical = new Map(milestones.map((m) => [m.canonicalId, m]));
  const internalIds = new Map();
  const shippedBadges = new Map();

  const foundationBaseline = bundle.foundationBaseline ?? {};
  const experienceArchitecture = bundle.experienceArchitecture ?? {};
  const releaseChannelSystem = bundle.releaseChannelSystem ?? {};
  const constitutionalAmendments = bundle.constitutionalAmendments ?? {};

  const philosophies = bundle.corePhilosophies ?? [];
  const philosophyIds = new Set(philosophies.map((p) => p.id));

  const resolvableIds = new Set([
    ...volumeIds,
    ...chapterIds,
    ...milestones.map((m) => m.canonicalId),
    ...milestones.map((m) => m.internalId),
    ...designRevisions.map((d) => d.id),
    ...aliases.map((a) => a.canonicalId),
    ...aliases.map((a) => a.shippedId).filter(Boolean),
    ...philosophyIds,
    'executive-strategy-floor',
    'headquarters-experience-v2',
    'environmental-storytelling',
    'emotional-computing',
    'personalization-dna',
    'presence-interaction',
    'platform-executive',
    'release-channel-system',
    'qa-engine',
    'update-engine',
    'deployment-engine',
    'platform-governance',
  ]);

  for (const layer of experienceArchitecture.layers ?? []) {
    for (const concept of layer.concepts ?? []) {
      resolvableIds.add(concept.id);
    }
  }

  // ── Manifest integrity ──────────────────────────────────────────────
  if (!constitution.principles?.length) {
    issue(issues, 'error', 'CONSTITUTION_EMPTY', 'Constitution has no principles');
  }
  if (milestones.length < 232) {
    issue(issues, 'warning', 'LOW_MILESTONE_COUNT', `Expected ~233 milestones, found ${milestones.length}`);
  }
  if (!volumes.some((v) => v.id === 'volume-i')) {
    issue(issues, 'error', 'MISSING_VOLUME_I', 'Volume I container missing');
  }
  if (!volumes.some((v) => v.id === 'volume-ii')) {
    issue(issues, 'error', 'MISSING_VOLUME_II', 'Volume II container missing');
  }

  for (const file of milestoneFiles) {
    if (file.includes('volume-ii-iv')) {
      issue(issues, 'error', 'LEGACY_MILESTONE_FILE', 'Deprecated overflow file volume-ii-iv.yaml must be split into per-volume manifests', file);
    }
  }

  // ── Duplicate definitions ─────────────────────────────────────────────
  for (const m of milestones) {
    if (internalIds.has(m.internalId)) {
      issue(issues, 'error', 'DUPLICATE_INTERNAL_ID', `Duplicate internalId ${m.internalId}`, m.canonicalId);
    }
    internalIds.set(m.internalId, m.canonicalId);

    if (milestoneByCanonical.has(m.canonicalId) && milestoneByCanonical.get(m.canonicalId) !== m) {
      issue(issues, 'error', 'DUPLICATE_CANONICAL_ID', `Duplicate canonicalId ${m.canonicalId}`, m.canonicalId);
    }

    if (!IMPLEMENTATION_STATUSES.has(m.implementationStatus)) {
      issue(issues, 'error', 'INVALID_STATUS', `Invalid implementationStatus on ${m.canonicalId}`, m.canonicalId);
    }

    if (!volumeIds.has(m.volumeId)) {
      issue(issues, 'warning', 'UNKNOWN_VOLUME', `${m.canonicalId} references unknown volume ${m.volumeId}`, m.canonicalId);
    }

    if (m.chapterId && !chapterIds.has(m.chapterId)) {
      issue(issues, 'warning', 'UNKNOWN_CHAPTER', `${m.canonicalId} references unknown chapter ${m.chapterId}`, m.canonicalId);
    }

    if (m.canonicalId.endsWith('-shipped')) {
      issue(issues, 'error', 'DEPRECATED_ID_SUFFIX', `Use -spec-qa suffix for QA chain canonical IDs, not -shipped`, m.canonicalId);
    }

    if (m.shippedMilestone) {
      const key = m.shippedMilestone;
      if (!shippedBadges.has(key)) shippedBadges.set(key, []);
      shippedBadges.get(key).push(m.canonicalId);
    }

    if (m.implementationStatus === 'complete' && !m.moduleId && m.registryKind === 'milestone') {
      issue(issues, 'warning', 'COMPLETE_WITHOUT_MODULE', `Complete milestone ${m.canonicalId} has no moduleId`, m.canonicalId);
    }
  }

  for (const [badge, ids] of shippedBadges) {
    if (ids.length > 1) {
      const documented = aliases.some(
        (a) => a.shippedId === badge && ids.includes(a.canonicalId)
      );
      if (!documented) {
        issue(issues, 'error', 'SHIPPED_BADGE_COLLISION', `Shipped badge ${badge} shared by ${ids.join(', ')} without alias documentation`, badge);
      }
    }
  }

  // ── Design revisions ──────────────────────────────────────────────────
  for (const dr of designRevisions) {
    if (!dr.mergeTargets?.length && dr.implementationStatus !== 'merged') {
      issue(issues, 'error', 'DR_NO_MERGE_TARGETS', `${dr.id} has no mergeTargets`, dr.id);
    }
    if (dr.implementationStatus === 'merged' && !dr.mergedInto?.length) {
      issue(issues, 'warning', 'DR_MERGED_WITHOUT_TARGETS', `${dr.id} merged but mergedInto empty`, dr.id);
    }
    if (dr.implementationStatus !== 'merged' && dr.implementationStatus !== 'planned' && dr.implementationStatus !== 'in-progress') {
      if (!IMPLEMENTATION_STATUSES.has(dr.implementationStatus)) {
        issue(issues, 'warning', 'DR_INVALID_STATUS', `${dr.id} has status ${dr.implementationStatus}`, dr.id);
      }
    }
  }

  // ── Naming consistency (aliases ↔ milestones) ─────────────────────────
  for (const a of aliases) {
    if (!a.canonicalId) {
      issue(issues, 'warning', 'ALIAS_MISSING_CANONICAL', 'Alias entry missing canonicalId');
      continue;
    }
    const milestone = milestoneByCanonical.get(a.canonicalId);
    if (a.moduleId && milestone && milestone.moduleId && milestone.moduleId !== a.moduleId) {
      issue(issues, 'error', 'ALIAS_MODULE_MISMATCH', `Alias ${a.canonicalId} moduleId ${a.moduleId} ≠ milestone ${milestone.moduleId}`, a.canonicalId);
    }
    if (a.shippedId && milestone && milestone.shippedMilestone && milestone.shippedMilestone !== a.shippedId) {
      issue(issues, 'error', 'ALIAS_SHIPPED_MISMATCH', `Alias ${a.canonicalId} shippedId ${a.shippedId} ≠ milestone ${milestone.shippedMilestone}`, a.canonicalId);
    }
  }

  // ── Dependency integrity (milestone dependsOn) ────────────────────────
  for (const m of milestones) {
    for (const dep of m.dependsOn ?? []) {
      if (!resolvableIds.has(dep) && !dep.startsWith('DR-') && !dep.startsWith('chapter-')) {
        if (m.implementationStatus === 'complete' || m.implementationStatus === 'in-progress') {
          issue(issues, 'warning', 'UNRESOLVED_DEP', `${m.canonicalId} depends on unresolved ${dep}`, m.canonicalId);
        }
      }
    }
  }

  // ── Dependency graph integrity ────────────────────────────────────────
  for (const edge of edges) {
    const { from, to } = edge;
    if (!resolvableIds.has(from) && !from.startsWith('DR-')) {
      issue(issues, 'error', 'GRAPH_UNRESOLVED_FROM', `Dependency graph edge from unresolved ${from}`, from);
    }
    if (!resolvableIds.has(to) && !to.startsWith('DR-')) {
      issue(issues, 'error', 'GRAPH_UNRESOLVED_TO', `Dependency graph edge to unresolved ${to}`, to);
    }
  }

  // ── Circular dependencies (graph DFS) ───────────────────────────────
  const adj = new Map();
  for (const edge of edges) {
    if (edge.type === 'relates') continue;
    if (!adj.has(edge.from)) adj.set(edge.from, []);
    adj.get(edge.from).push(edge.to);
  }

  const visiting = new Set();
  const visited = new Set();

  function dfs(node, stack) {
    if (visiting.has(node)) {
      issue(issues, 'error', 'CIRCULAR_DEPENDENCY', `Circular dependency detected: ${[...stack, node].join(' → ')}`, node);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of adj.get(node) ?? []) {
      dfs(next, [...stack, node]);
    }
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of adj.keys()) dfs(node, []);

  // ── Cross-layer consistency (chapter milestoneIds) ────────────────────
  for (const ch of chapters) {
    for (const mid of ch.milestoneIds ?? []) {
      const exists =
        milestoneByCanonical.has(mid) ||
        designRevisions.some((d) => d.id === mid) ||
        mid.startsWith('DR-');
      if (!exists) {
        issue(issues, 'warning', 'CHAPTER_UNKNOWN_MILESTONE', `${ch.id} lists unknown milestone ${mid}`, ch.id);
      }
    }
  }

  // ── Version consistency ───────────────────────────────────────────────
  const yamlVersions = new Set();
  for (const name of fs.readdirSync(SPEC_DIR)) {
    if (name.endsWith('.yaml') && fs.statSync(path.join(SPEC_DIR, name)).isFile()) {
      try {
        const raw = fs.readFileSync(path.join(SPEC_DIR, name), 'utf8');
        const match = raw.match(/^version:\s*['"]?([^'"\n]+)/m);
        if (match) yamlVersions.add(match[1]);
      } catch {
        /* skip */
      }
    }
  }
  if (yamlVersions.size > 1) {
    const legacyFrozen = new Set(['1.0.0']);
    const activeVersions = [...yamlVersions].filter((v) => !legacyFrozen.has(v));
    if (activeVersions.length > 1) {
      issue(issues, 'warning', 'VERSION_MISMATCH', `Multiple active spec file versions: ${activeVersions.join(', ')}`);
    }
  }

  // ── Core Philosophy compliance ────────────────────────────────────────
  const corePhilosophies = bundle.corePhilosophies ?? [];
  if (corePhilosophies.length < 23) {
    issue(issues, 'error', 'LOW_PHILOSOPHY_COUNT', `Expected ≥23 core philosophies (Foundation v1.1), found ${corePhilosophies.length}`);
  }
  const requiredPhilosophyCategories = ['experiential', 'governance', 'platform'];
  for (const cat of requiredPhilosophyCategories) {
    if (!corePhilosophies.some((p) => p.category === cat)) {
      issue(issues, 'warning', 'PHILOSOPHY_CATEGORY_MISSING', `No philosophy in category ${cat}`);
    }
  }
  if (!volumes.some((v) => v.id === 'volume-iii')) {
    issue(issues, 'warning', 'MISSING_VOLUME_III', 'Volume III container missing');
  }
  const volumeIII = milestones.filter((m) => m.volumeId === 'volume-iii');
  if (volumeIII.length > 0 && volumeIII.length < 10) {
    issue(issues, 'warning', 'LOW_VOLUME_III_COUNT', `Volume III has only ${volumeIII.length} milestones`);
  }
  for (const m of volumeIII) {
    if (!m.alignedPhilosophies?.length) {
      issue(issues, 'warning', 'MISSING_PHILOSOPHY_ALIGNMENT', `${m.canonicalId} has no alignedPhilosophies`, m.canonicalId);
    }
  }

  // ── Constitution compliance ───────────────────────────────────────────
  const requiredPrinciples = [
    'constitution-single-source',
    'constitution-registry-driven',
    'constitution-core-philosophies',
    'constitution-experience-architecture',
    'constitution-foundation-governance',
    'constitution-release-channels',
  ];
  for (const id of requiredPrinciples) {
    if (!constitution.principles?.some((p) => p.id === id)) {
      issue(issues, 'error', 'CONSTITUTION_PRINCIPLE_MISSING', `Missing required principle ${id}`, id);
    }
  }

  // ── Knowledge Registry compliance ─────────────────────────────────────
  const krMilestone = milestoneByCanonical.get('M126');
  if (!krMilestone) {
    issue(issues, 'error', 'MISSING_KNOWLEDGE_REGISTRY', 'M126 Knowledge Registry milestone missing');
  } else if (krMilestone.internalId !== 'knowledge-registry') {
    issue(issues, 'error', 'KR_INTERNAL_ID', 'M126 must use internalId knowledge-registry', 'M126');
  }

  const sysMilestone = milestoneByCanonical.get('M127');
  if (!sysMilestone) {
    issue(issues, 'error', 'MISSING_SYSTEM_REGISTRY', 'M127 System Registry milestone missing');
  }

  const m127_13 = milestoneByCanonical.get('M127.13');
  if (!m127_13) {
    issue(issues, 'warning', 'MISSING_EXECUTIVE_STRATEGY_FLOOR', 'M127.13 Executive Strategy Floor milestone missing (DR-005 merge target)');
  }

  const m127_14 = milestoneByCanonical.get('M127.14');
  if (!m127_14) {
    issue(issues, 'error', 'MISSING_RELEASE_CHANNEL_SYSTEM', 'M127.14 Release Channel System milestone missing (CA-001)');
  } else if (m127_14.internalId !== 'release-channel-system') {
    issue(issues, 'error', 'RCS_INTERNAL_ID', 'M127.14 must use internalId release-channel-system', 'M127.14');
  }

  // ── Release Channel System compliance (CA-001) ───────────────────────
  if (!releaseChannelSystem.channels?.length) {
    issue(issues, 'error', 'RCS_NO_CHANNELS', 'release-channel-system.yaml must define operating channels');
  } else {
    const channelIds = new Set(['stable', 'preview', 'beta', 'experimental']);
    for (const ch of releaseChannelSystem.channels) {
      if (!channelIds.has(ch.id)) {
        issue(issues, 'warning', 'RCS_UNKNOWN_CHANNEL', `Unknown release channel ${ch.id}`, ch.id);
      }
    }
    if (releaseChannelSystem.channels.length !== 4) {
      issue(issues, 'warning', 'RCS_CHANNEL_COUNT', `Expected 4 release channels, found ${releaseChannelSystem.channels.length}`);
    }
  }
  if (!releaseChannelSystem.nativeEngines?.engines?.length) {
    issue(issues, 'error', 'RCS_NO_ENGINES', 'release-channel-system.yaml must define QA/Update/Deployment engines');
  }
  const ratified = (constitutionalAmendments.amendments ?? []).filter((a) => a.status === 'ratified');
  if (!ratified.some((a) => a.id === 'CA-001')) {
    issue(issues, 'error', 'CA001_NOT_RATIFIED', 'Constitutional Amendment CA-001 must be ratified');
  }
  if (foundationBaseline.baseline?.releaseChannelSystem?.status !== 'frozen') {
    issue(issues, 'warning', 'RCS_NOT_FROZEN', 'Release Channel System not frozen in foundation baseline');
  }

  // ── Foundation baseline compliance ────────────────────────────────────
  if (foundationBaseline.status === 'frozen') {
    const frozenVolumes = foundationBaseline.baseline?.masterSpecFoundation?.volumesFrozen ?? [];
    for (const vol of ['volume-0', 'volume-i', 'volume-ii', 'volume-iii', 'volume-iv']) {
      if (!frozenVolumes.includes(vol)) {
        issue(issues, 'warning', 'FOUNDATION_VOLUME_NOT_FROZEN', `Foundation baseline missing frozen volume ${vol}`, vol);
      }
    }
  } else if (Object.keys(foundationBaseline).length > 0) {
    issue(issues, 'warning', 'FOUNDATION_NOT_FROZEN', 'foundation-baseline.yaml exists but status is not frozen');
  }

  // ── DR merge integrity ────────────────────────────────────────────────
  const unmerged = designRevisions.filter((d) => !['merged', 'deprecated'].includes(d.implementationStatus));
  if (unmerged.length > 0) {
    issue(issues, 'warning', 'DR_NOT_MERGED', `Design revisions not merged: ${unmerged.map((d) => d.id).join(', ')}`);
  }

  // ── Experience architecture compliance ────────────────────────────────
  if (!experienceArchitecture.layers?.length) {
    issue(issues, 'warning', 'MISSING_EXPERIENCE_ARCHITECTURE', 'experience-architecture.yaml has no layers');
  }

  // ── Search integrity (Knowledge Registry module doc) ────────────────
  const krDoc = path.join(DOCS_STUDIO, 'knowledge-registry.md');
  const expDoc = path.join(DOCS_STUDIO, 'experience-architecture.md');
  const rcsDoc = path.join(DOCS_STUDIO, 'release-channel-system.md');
  if (!fs.existsSync(krDoc)) {
    issue(issues, 'warning', 'SEARCH_INTEGRITY_KR', 'knowledge-registry.md missing for search/registry integrity');
  }
  if (!fs.existsSync(expDoc)) {
    issue(issues, 'warning', 'SEARCH_INTEGRITY_EXP', 'experience-architecture.md missing for experiential search');
  }
  if (!fs.existsSync(rcsDoc)) {
    issue(issues, 'warning', 'SEARCH_INTEGRITY_RCS', 'release-channel-system.md missing for release channel search integrity');
  }
  for (const m of milestones.filter((x) => x.implementationStatus === 'complete' && x.moduleId)) {
    const docPath = path.join(DOCS_STUDIO, `${m.moduleId}.md`);
    if (!fs.existsSync(docPath)) {
      issue(issues, 'warning', 'MISSING_DOCUMENTATION', `No docs/studio-os/${m.moduleId}.md for complete module`, m.moduleId);
    }
  }

  // ── Registry integrity (alias coverage for QA chain) ────────────────
  for (const qaId of ['M159-spec-qa', 'M160-spec-qa', 'M161-spec-qa', 'M162-spec-qa']) {
    if (!milestoneByCanonical.has(qaId)) {
      issue(issues, 'error', 'QA_CHAIN_INCOMPLETE', `QA chain milestone ${qaId} missing from manifest`, qaId);
    }
    if (!aliases.some((a) => a.canonicalId === qaId)) {
      issue(issues, 'warning', 'QA_ALIAS_MISSING', `No alias entry for ${qaId}`, qaId);
    }
  }

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;

  return { issues, errors, warnings };
}

/**
 * @param {object} result
 * @param {string} compiledAt
 */
export function writeValidationReport(result, compiledAt) {
  const { issues, errors, warnings } = result;
  const lines = [
    '# Architecture Validator™ Report',
    '',
    `Generated: ${compiledAt}`,
    '',
    '## Summary',
    '',
    `| Severity | Count |`,
    `|----------|-------|`,
    `| Errors | ${errors} |`,
    `| Warnings | ${warnings} |`,
    `| **Gate** | **${errors === 0 ? '✅ PASS' : '❌ FAIL'}** |`,
    '',
    '## Checks Performed',
    '',
    '- Dependency integrity (milestone dependsOn + dependency graph)',
    '- Registry integrity (Knowledge Registry M126, System Registry M127, QA chain)',
    '- Manifest integrity (volumes, milestones, chapters, design revisions)',
    '- Naming consistency (canonical IDs, aliases, shipped badges)',
    '- Circular dependencies (dependency graph DFS)',
    '- Duplicate definitions (canonicalId, internalId, shipped badge)',
    '- Version consistency (YAML file versions)',
    '- Constitution compliance (required principles)',
    '- Core Philosophy compliance (≥15 principles, Volume III alignment)',
    '- Knowledge Registry compliance',
    '- Missing documentation (complete modules without docs/studio-os/*.md)',
    '',
  ];

  if (issues.length) {
    lines.push('## Issues', '', '| Severity | Code | Entity | Message |', '|----------|------|--------|---------|');
    for (const i of issues) {
      lines.push(`| ${i.severity} | ${i.code} | ${i.entityId ?? '—'} | ${i.message} |`);
    }
  } else {
    lines.push('## Issues', '', '_No issues detected._');
  }

  lines.push(
    '',
    '## Architectural Gatekeeper',
    '',
    'Architecture Validator™ runs on every compile (`prebuild`). Errors block the build.',
    'Warnings are reported for review but do not block compilation.',
    ''
  );

  fs.writeFileSync(REPORT_FILE, lines.join('\n'));
  return errors;
}
