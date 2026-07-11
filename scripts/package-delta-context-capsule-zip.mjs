#!/usr/bin/env node
/**
 * Studio OS Delta Context Capsule — incremental context updates for already-onboarded AI.
 * Supplements Unified Onboarding Pack; publishes only meaningful capsule changes since baseline.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');

const GENERATOR_VERSION = '1.0.0';
const DELTA_FOLDER = 'StudioOS_ContextUpdate';
const LATEST_ALIAS = 'latest.zip';
const RELEASE_MANIFEST = 'release.json';
const METADATA_FILE = 'delta-context.json';
const BASELINE_FILE = 'api/_lib/delta-context-baseline.json';
const DOWNLOAD_BASE = '/downloads/context-updates';
const ARCHIVE_SUBDIR = 'archive';
const PERMANENT_LATEST_PATH = '/context-updates/latest';

const REQUIRED_ONBOARDING_VERSION = '1.1.0';

const CAPSULE_SOURCES = [
  {
    id: 'ai-context',
    label: 'AI Context Capsule',
    folder: 'StudioOS_ContextCapsule_v0.1',
    releaseManifest: 'api/_lib/context-capsule-release.json',
    versionField: 'currentVersion',
  },
  {
    id: 'founder-intelligence',
    label: 'Founder Intelligence Capsule',
    folder: 'founder-intelligence',
    releaseManifest: 'api/_lib/founder-intelligence-capsule-release.json',
    versionField: 'currentVersion',
  },
  {
    id: 'studio-dna',
    label: 'Studio DNA Capsule',
    folder: 'StudioOS_StudioDNACapsule_v1.0',
    releaseManifest: 'api/_lib/studio-dna-capsule-release.json',
    versionField: 'currentVersion',
  },
  {
    id: 'collaboration-intelligence',
    label: 'Collaboration Intelligence Capsule',
    folder: 'collaboration-intelligence',
    releaseManifest: 'api/_lib/collaboration-intelligence-capsule-release.json',
    versionField: 'currentVersion',
  },
];

const CATEGORY_KEYWORDS = {
  Architecture: ['architecture', 'pipeline', 'spatial', 'genesis', 'compiler', 'runtime'],
  'Founder Preference': ['founder preference', 'composer sprint', 'prompt', 'communication style'],
  'Collaboration Memory': ['collaboration', 'shorthand', 'goosebump', 'relationship memory', 'glossary'],
  'Business Model': ['business model', 'revenue', 'monetization', 'subscription'],
  Marketplace: ['marketplace', 'knowledge commerce', 'licensing'],
  'Knowledge Capture': ['knowledge capture', 'interview', 'living knowledge mirror', 'knowledge vault'],
  'Studio Workers': ['studio workers', 'digital payroll', 'shadow mode'],
  'Studio HR': ['studio hr', 'studio team'],
  Documentation: ['readme', 'manifest', 'validation', 'changelog'],
  Canon: ['canon', 'canonical', 'approved', 'maturity'],
  'Implementation Status': ['handoff', 'implemented', 'shipped', 'deploy'],
  'Current Handoff': ['current handoff', 'current sprint', 'active sprint'],
  Blockers: ['blocker', 'known_blockers', 'b1', 'b2'],
  'Design Philosophy': ['design philosophy', 'design language', 'design dna'],
  'Revenue Model': ['revenue model', 'transaction', 'commission'],
  'Studio World': ['studio world', 'the mansion', 'headquarters'],
  Genesis: ['genesis', 'constitutional', 'terra'],
  'Studio Institute': ['studio institute', 'expert capture', 'invite'],
  'Experience Lab': ['experience lab', 'validation compile', 'ephemeral auth'],
  'World Compiler': ['world compiler', 'black box', 'signature landmark'],
};

const MATURITY_MARKERS = {
  canonical: ['canonical', 'maturity:** canonical', '**maturity** | canonical'],
  approved: ['approved', 'maturity:** approved'],
  working: ['working', 'maturity:** working'],
  experimental: ['experimental', 'maturity:** experimental'],
  deprecated: ['deprecated', 'maturity:** deprecated', 'superseded'],
};

const REQUIRED_DELTA_FILES = [
  'README_FIRST.md',
  'UPDATE_SUMMARY.md',
  'CHANGELOG.md',
  'CHANGED_FILES.md',
  'UPDATED_DECISIONS.md',
  'UPDATED_GLOSSARY.md',
  'UPDATED_COLLABORATION_MEMORY.md',
  'UPDATED_FOUNDER_PREFERENCES.md',
  'UPDATED_CANON.md',
  'UPDATED_HANDOFF.md',
  'VALIDATION.md',
];

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(rel, payload) {
  const target = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
  fs.writeFileSync(target, JSON.stringify(payload, null, 2) + '\n');
}

function readGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/** Ignore insignificant formatting / auto-generated timestamp drift. */
function normalizeContent(raw) {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\*\*Last Updated:\*\*[^\n]*/gi, '')
    .replace(/\*\*Generated \(UTC\)\*\*[^\n]*/gi, '')
    .replace(/\*\*Git Commit\*\*[^\n]*/gi, '')
    .replace(/\*\*Git reference:\*\*[^\n]*/gi, '')
    .replace(/"generatedAt":\s*"[^"]+"/g, '"generatedAt": "<normalized>"')
    .replace(/"gitCommit":\s*"[^"]+"/g, '"gitCommit": "<normalized>"')
    .trim();
}

function fingerprint(content) {
  return sha256Text(normalizeContent(content));
}

const AUTO_GENERATED_SKIP = [
  /VALIDATION\.md$/i,
  /^context-capsule\.json$/i,
  /^founder-intelligence\.json$/i,
  /^studio-dna-capsule\.json$/i,
  /^collaboration-intelligence\.json$/i,
];

function shouldTrackFile(relPath) {
  return !AUTO_GENERATED_SKIP.some((re) => re.test(relPath));
}

function listCapsuleFiles(folder) {
  const dir = path.join(ROOT, folder);
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (base, rel = '') => {
    for (const name of fs.readdirSync(base)) {
      const full = path.join(base, name);
      const relPath = rel ? `${rel}/${name}` : name;
      if (fs.statSync(full).isDirectory()) walk(full, relPath);
      else if (/\.(md|json)$/i.test(name) && !name.endsWith('.bak') && shouldTrackFile(relPath)) out.push(relPath);
    }
  };
  walk(dir);
  return out.sort();
}

function scanCapsuleState() {
  const files = {};
  const versions = {};
  for (const cap of CAPSULE_SOURCES) {
    const release = readJson(cap.releaseManifest);
    versions[cap.id] = release?.[cap.versionField] ?? 'unknown';
    for (const rel of listCapsuleFiles(cap.folder)) {
      const abs = path.join(ROOT, cap.folder, rel);
      const raw = fs.readFileSync(abs, 'utf8');
      const key = `${cap.id}:${rel}`;
      files[key] = {
        capsuleId: cap.id,
        capsuleLabel: cap.label,
        relPath: rel,
        absPath: abs,
        folder: cap.folder,
        hash: fingerprint(raw),
        raw,
        normalized: normalizeContent(raw),
      };
    }
  }
  return { files, versions };
}

function loadBaseline() {
  const data = readJson(BASELINE_FILE);
  if (!data?.fileFingerprints) return null;
  return data;
}

function diffAgainstBaseline(baseline, current) {
  const changes = [];
  const baselineKeys = new Set(Object.keys(baseline.fileFingerprints ?? {}));
  const currentKeys = new Set(Object.keys(current.files));

  for (const key of currentKeys) {
    const cur = current.files[key];
    const prevHash = baseline.fileFingerprints?.[key];
    if (!prevHash) {
      changes.push({ type: 'added', ...cur, categories: classifyChange(cur) });
    } else if (prevHash !== cur.hash) {
      changes.push({ type: 'modified', ...cur, categories: classifyChange(cur) });
    }
  }

  for (const key of baselineKeys) {
    if (!currentKeys.has(key)) {
      const [capsuleId, ...rest] = key.split(':');
      const relPath = rest.join(':');
      const cap = CAPSULE_SOURCES.find((c) => c.id === capsuleId);
      changes.push({
        type: 'removed',
        capsuleId,
        capsuleLabel: cap?.label ?? capsuleId,
        relPath,
        folder: cap?.folder ?? '',
        categories: classifyPath(capsuleId, relPath, ''),
      });
    }
  }

  return changes.sort((a, b) => {
    const ak = `${a.capsuleId}:${a.relPath}`;
    const bk = `${b.capsuleId}:${b.relPath}`;
    return ak.localeCompare(bk);
  });
}

function classifyPath(capsuleId, relPath, excerpt) {
  const hay = `${capsuleId} ${relPath} ${excerpt}`.toLowerCase();
  const scores = {};
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (hay.includes(kw.toLowerCase())) score += 1;
    }
    if (score > 0) scores[category] = score;
  }
  if (relPath.toLowerCase().includes('current_handoff')) scores['Current Handoff'] = 10;
  if (relPath.toLowerCase().includes('known_blockers')) scores.Blockers = 10;
  if (relPath.toLowerCase().includes('decision_history')) scores.Canon = (scores.Canon ?? 0) + 5;
  if (relPath.toLowerCase().includes('collaboration_glossary')) scores['Collaboration Memory'] = 10;
  if (relPath.toLowerCase().includes('founder_preferences')) scores['Founder Preference'] = 10;

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return ranked.length ? ranked.map(([c]) => c) : ['Documentation'];
}

function classifyChange(file) {
  const excerpt = (file.raw ?? '').slice(0, 4000);
  return classifyPath(file.capsuleId, file.relPath, excerpt);
}

function nextDeltaVersion(baseline, release) {
  const seq = (baseline?.deltaSequence ?? 0) + 1;
  return `1.0.${seq - 1}`;
}

function loadOnboardingRelease() {
  return readJson('api/_lib/onboarding-pack-release.json');
}

function compatibilityStatus(baseline, onboarding) {
  const required = baseline?.onboardingPackVersion ?? REQUIRED_ONBOARDING_VERSION;
  const current = onboarding?.currentVersion ?? REQUIRED_ONBOARDING_VERSION;
  if (required === current) return 'compatible';
  const reqParts = required.split('.').map(Number);
  const curParts = current.split('.').map(Number);
  if (curParts[0] > reqParts[0] || (curParts[0] === reqParts[0] && curParts[1] >= reqParts[1])) {
    return 'compatible';
  }
  return 'incompatible';
}

function extractCanonPromotions(changes) {
  const promoted = [];
  const working = [];
  const experimental = [];
  const deprecated = [];
  for (const ch of changes) {
    if (!ch.raw) continue;
    const lower = ch.raw.toLowerCase();
    const title = `${ch.capsuleLabel} / ${ch.relPath}`;
    if (MATURITY_MARKERS.deprecated.some((m) => lower.includes(m))) deprecated.push({ title, change: ch.type });
    else if (MATURITY_MARKERS.canonical.some((m) => lower.includes(m))) promoted.push({ title, change: ch.type });
    else if (MATURITY_MARKERS.approved.some((m) => lower.includes(m))) promoted.push({ title, change: ch.type });
    else if (MATURITY_MARKERS.experimental.some((m) => lower.includes(m))) experimental.push({ title, change: ch.type });
    else if (MATURITY_MARKERS.working.some((m) => lower.includes(m))) working.push({ title, change: ch.type });
  }
  return { promoted, working, experimental, deprecated };
}

function filterChanges(changes, predicate) {
  return changes.filter(predicate);
}

function buildReadmeFirst(meta) {
  return `# README FIRST — Studio OS Delta Context Capsule

**You have already completed the Unified Onboarding Pack.** This package contains **only changes** since your last synchronization.

| Field | Value |
|-------|-------|
| **Delta version** | ${meta.deltaVersion} |
| **Generated (UTC)** | ${meta.generatedAt} |
| **Base onboarding required** | ${meta.baseOnboardingVersion} |
| **Current onboarding pack** | ${meta.currentOnboardingVersion} |
| **Repository commit** | ${meta.gitCommit} |
| **Compatibility** | ${meta.compatibilityStatus} |
| **Change count** | ${meta.changeCount} |

---

## Rules

1. **Do not** repeat full onboarding — merge this delta into existing understanding.
2. Read **UPDATE_SUMMARY.md** first, then **CHANGELOG.md**, then specialized update files.
3. Read files under **\`changes/\`** for full modified content.
4. Preserve prior onboarding knowledge — **supplement**, do not replace.
5. Update Founder preferences, Collaboration Memory, Canon, and Current Handoff in your working model.
6. Produce a brief synchronization acknowledgment, then **stop** — wait for founder instructions.

---

## Reading order

1. \`UPDATE_SUMMARY.md\`
2. \`CHANGELOG.md\`
3. \`CHANGED_FILES.md\`
4. \`UPDATED_DECISIONS.md\`
5. \`UPDATED_GLOSSARY.md\`
6. \`UPDATED_COLLABORATION_MEMORY.md\`
7. \`UPDATED_FOUNDER_PREFERENCES.md\`
8. \`UPDATED_CANON.md\`
9. \`UPDATED_HANDOFF.md\`
10. \`changes/\` (as needed)
11. \`VALIDATION.md\`

**Preferred download URL:** \`https://fsbw.vercel.app/context-updates/latest\`
`;
}

function buildUpdateSummary(meta, changes, canon) {
  const byCategory = {};
  for (const ch of changes) {
    for (const cat of ch.categories ?? ['Documentation']) {
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    }
  }

  const newConcepts = changes
    .filter((c) => c.type === 'added')
    .slice(0, 12)
    .map((c) => `- **${c.capsuleLabel}** — \`${c.relPath}\` (${c.type})`);

  const expanded = changes
    .filter((c) => c.type === 'modified')
    .slice(0, 12)
    .map((c) => `- **${c.capsuleLabel}** — \`${c.relPath}\``);

  return `# UPDATE SUMMARY — Executive Delta Brief

**Delta ${meta.deltaVersion}** · ${meta.generatedAt}

## At a glance

| Metric | Value |
|--------|-------|
| Added files | ${changes.filter((c) => c.type === 'added').length} |
| Modified files | ${changes.filter((c) => c.type === 'modified').length} |
| Removed files | ${changes.filter((c) => c.type === 'removed').length} |
| Categories touched | ${Object.keys(byCategory).length} |

## New concepts introduced

${newConcepts.length ? newConcepts.join('\n') : '- None'}

## Concepts expanded

${expanded.length ? expanded.join('\n') : '- None'}

## Canon promoted

${canon.promoted.length ? canon.promoted.map((p) => `- ${p.title}`).join('\n') : '- None detected in this delta'}

## Canon deprecated / superseded

${canon.deprecated.length ? canon.deprecated.map((p) => `- ${p.title}`).join('\n') : '- None'}

## Category breakdown

${Object.entries(byCategory)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, n]) => `- **${cat}:** ${n} change(s)`)
  .join('\n')}

## Collaboration memory highlights

${changes
  .filter((c) => c.capsuleId === 'collaboration-intelligence' || (c.categories ?? []).includes('Collaboration Memory'))
  .slice(0, 8)
  .map((c) => `- ${c.type}: \`${c.relPath}\``)
  .join('\n') || '- No collaboration-intelligence changes'}

## Founder preference highlights

${changes
  .filter((c) => (c.categories ?? []).includes('Founder Preference') || c.relPath?.toLowerCase().includes('founder_preference'))
  .slice(0, 6)
  .map((c) => `- ${c.type}: \`${c.relPath}\``)
  .join('\n') || '- No founder preference file changes'}

## Handoff / blocker notes

${changes
  .filter((c) => ['Current Handoff', 'Blockers'].some((x) => (c.categories ?? []).includes(x)))
  .map((c) => `- ${c.type}: \`${c.relPath}\``)
  .join('\n') || '- No handoff/blocker file changes in this delta'}

---

*Merge into existing onboarding knowledge. Do not restart full onboarding.*
`;
}

function buildChangelog(meta, changes) {
  const lines = [
    '# CHANGELOG — Delta Context Update',
    '',
    `## ${meta.deltaVersion} (${meta.generatedAt.slice(0, 10)})`,
    '',
    `**Commit:** \`${meta.gitCommit.slice(0, 12)}\``,
    `**Since baseline:** onboarding ${meta.baseOnboardingVersion} → current ${meta.currentOnboardingVersion}`,
    '',
  ];
  for (const ch of changes) {
    const cats = (ch.categories ?? []).join(', ');
    lines.push(`- **[${ch.type.toUpperCase()}]** ${ch.capsuleLabel} — \`${ch.relPath}\` _(${cats})_`);
  }
  lines.push('');
  return lines.join('\n');
}

function buildChangedFiles(changes) {
  const lines = [
    '# CHANGED FILES',
    '',
    '| Type | Capsule | Path | Categories |',
    '|------|---------|------|------------|',
  ];
  for (const ch of changes) {
    lines.push(
      `| ${ch.type} | ${ch.capsuleLabel} | \`${ch.relPath}\` | ${(ch.categories ?? []).join(', ')} |`,
    );
  }
  lines.push('', 'Full content for added/modified files is in the `changes/` directory.', '');
  return lines.join('\n');
}

function buildSectionFromChanges(title, changes, filterFn, intro) {
  const matched = filterChanges(changes, filterFn);
  const lines = [`# ${title}`, '', intro, ''];
  if (!matched.length) {
    lines.push('_No changes in this delta._', '');
    return lines.join('\n');
  }
  for (const ch of matched) {
    lines.push(`## ${ch.capsuleLabel} — \`${ch.relPath}\` (${ch.type})`, '');
    if (ch.raw) {
      lines.push('```markdown');
      lines.push(ch.raw.slice(0, 12000));
      if (ch.raw.length > 12000) lines.push('\n... [truncated in delta summary — see changes/ for full file]');
      lines.push('```', '');
    } else {
      lines.push('_File removed since baseline._', '');
    }
  }
  return lines.join('\n');
}

function buildUpdatedCanon(canon, changes) {
  return `# UPDATED CANON

Tracks maturity promotions, deprecations, and supersessions detected in this delta.

## Promoted to Canon / Approved

${canon.promoted.length ? canon.promoted.map((p) => `- ${p.title} (${p.change})`).join('\n') : '- None'}

## Still Working

${canon.working.length ? canon.working.map((p) => `- ${p.title}`).join('\n') : '- None'}

## Still Experimental

${canon.experimental.length ? canon.experimental.map((p) => `- ${p.title}`).join('\n') : '- None'}

## Deprecated / Superseded

${canon.deprecated.length ? canon.deprecated.map((p) => `- ${p.title}`).join('\n') : '- None'}

## Changed files with canon relevance

${changes
  .filter((c) => (c.categories ?? []).includes('Canon') || /canon|maturity/i.test(c.relPath ?? ''))
  .map((c) => `- ${c.type}: \`${c.relPath}\``)
  .join('\n') || '- None'}
`;
}

function buildValidation(meta, checksum) {
  return `# VALIDATION — Delta Context Capsule (Auto-Generated)

| Field | Value |
|-------|-------|
| **Delta version** | ${meta.deltaVersion} |
| **Generated (UTC)** | ${meta.generatedAt} |
| **Git commit** | ${meta.gitCommit} |
| **Validation** | pass |
| **Compatibility** | ${meta.compatibilityStatus} |
| **Base onboarding required** | ${meta.baseOnboardingVersion} |
| **Current onboarding pack** | ${meta.currentOnboardingVersion} |
| **Archive checksum (SHA-256)** | ${checksum} |
| **Change count** | ${meta.changeCount} |

## Checks

- ✓ Version compatibility evaluated
- ✓ Baseline diff computed (formatting-normalized)
- ✓ Required delta documents present
- ✓ Changed file payloads included under \`changes/\`
- ✓ JSON metadata generated
- ✓ ZIP integrity verified before publish

*Regenerated by \`scripts/package-delta-context-capsule-zip.mjs\`*
`;
}

function writeChangePayloads(packDir, changes) {
  const changesDir = path.join(packDir, 'changes');
  fs.mkdirSync(changesDir, { recursive: true });
  for (const ch of changes) {
    if (!ch.raw || ch.type === 'removed') continue;
    const outDir = path.join(changesDir, ch.capsuleId);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, ch.relPath.replace(/\//g, '__')), ch.raw);
  }
}

function verifyZip(zipPath) {
  const stat = fs.statSync(zipPath);
  if (stat.size < 512) throw new Error(`ZIP too small (${stat.size} bytes)`);
  execSync(`unzip -t ${JSON.stringify(zipPath)}`, { stdio: 'pipe' });
}

function validateDeltaPack(packDir, metadata) {
  const errors = [];
  for (const f of REQUIRED_DELTA_FILES) {
    if (!fs.existsSync(path.join(packDir, f))) errors.push(`Missing required file: ${f}`);
  }
  if (!fs.existsSync(path.join(packDir, METADATA_FILE))) errors.push(`Missing ${METADATA_FILE}`);
  if (metadata.compatibilityStatus === 'incompatible') {
    errors.push('Incompatible onboarding version — delta rejected');
  }
  if (metadata.changeCount < 1) errors.push('No meaningful changes detected');
  if (errors.length) {
    console.error('\n❌ Delta Context Capsule validation failed:\n');
    for (const e of errors) console.error(`   • ${e}`);
    process.exit(1);
  }
}

function bootstrapBaselineIfMissing() {
  if (fs.existsSync(path.join(ROOT, BASELINE_FILE))) return;
  console.log('Bootstrapping delta baseline from git commit c939dbfbe (pre–Collaboration Intelligence)…');
  const baseline = {
    schemaVersion: 1,
    deltaSequence: 0,
    onboardingPackVersion: '1.0.0',
    publishedAt: '2026-07-11T00:00:00.000Z',
    gitCommit: 'c939dbfbe1e7e95b74a67f9b33f1d9f6cd6d0d90',
    capsuleVersions: {
      'ai-context': '0.3.1',
      'founder-intelligence': '1.0.0',
      'studio-dna': '1.0.0',
    },
    fileFingerprints: {},
    note: 'Initial baseline before Collaboration Intelligence Capsule and Delta Context system.',
  };
  const commit = 'c939dbfbe';
  for (const cap of CAPSULE_SOURCES.filter((c) => c.id !== 'collaboration-intelligence')) {
    let relFiles = [];
    try {
      relFiles = execSync(`git ls-tree -r --name-only ${commit} -- ${cap.folder}`, {
        cwd: ROOT,
        encoding: 'utf8',
      })
        .trim()
        .split('\n')
        .filter((f) => /\.(md|json)$/i.test(f))
        .map((f) => f.replace(`${cap.folder}/`, ''));
    } catch {
      relFiles = listCapsuleFiles(cap.folder);
    }
    for (const rel of relFiles) {
      try {
        const raw = execSync(`git show ${commit}:${cap.folder}/${rel}`, { cwd: ROOT, encoding: 'utf8' });
        baseline.fileFingerprints[`${cap.id}:${rel}`] = fingerprint(raw);
      } catch {
        /* skip missing historical file */
      }
    }
  }
  writeJson(BASELINE_FILE, baseline);
}

function packageDeltaContext() {
  bootstrapBaselineIfMissing();

  const baseline = loadBaseline();
  const current = scanCapsuleState();
  const onboarding = loadOnboardingRelease();
  const changes = diffAgainstBaseline(baseline, current);
  const canon = extractCanonPromotions(changes);
  const generatedAt = new Date().toISOString();
  const gitCommit = readGitCommit();
  const deltaVersion = nextDeltaVersion(baseline, null);
  const compat = compatibilityStatus(baseline, onboarding);

  if (changes.length === 0) {
    const existing = readJson('api/_lib/delta-context-release.json');
    if (existing?.validationStatus === 'pass') {
      console.log('\nStudio OS Delta Context Capsule:');
      console.log('  No capsule changes since last delta — keeping published release.');
      console.log(`  Latest delta:     v${existing.currentVersion}`);
      console.log(`  Permanent latest: ${PERMANENT_LATEST_PATH}\n`);
      return;
    }
  }

  const meta = {
    deltaVersion,
    generatedAt,
    gitCommit,
    baseOnboardingVersion: baseline.onboardingPackVersion ?? '1.0.0',
    currentOnboardingVersion: onboarding?.currentVersion ?? REQUIRED_ONBOARDING_VERSION,
    compatibilityStatus: compat,
    changeCount: changes.length,
    buildNumber: gitCommit.slice(0, 7),
    capsuleVersions: current.versions,
  };

  const stagingRoot = path.join(ROOT, '.delta-context-staging');
  const packDir = path.join(stagingRoot, DELTA_FOLDER);
  if (fs.existsSync(stagingRoot)) fs.rmSync(stagingRoot, { recursive: true, force: true });
  fs.mkdirSync(packDir, { recursive: true });

  fs.writeFileSync(path.join(packDir, 'README_FIRST.md'), buildReadmeFirst(meta));
  fs.writeFileSync(path.join(packDir, 'UPDATE_SUMMARY.md'), buildUpdateSummary(meta, changes, canon));
  fs.writeFileSync(path.join(packDir, 'CHANGELOG.md'), buildChangelog(meta, changes));
  fs.writeFileSync(path.join(packDir, 'CHANGED_FILES.md'), buildChangedFiles(changes));
  fs.writeFileSync(
    path.join(packDir, 'UPDATED_DECISIONS.md'),
    buildSectionFromChanges(
      'UPDATED DECISIONS',
      changes,
      (c) =>
        /decision_history/i.test(c.relPath ?? '') ||
        (c.categories ?? []).includes('Canon') ||
        (c.raw && /^\#\# /m.test(c.raw) && /decision/i.test(c.raw.slice(0, 500))),
      'Decision history additions and modifications from capsule sources.',
    ),
  );
  fs.writeFileSync(
    path.join(packDir, 'UPDATED_GLOSSARY.md'),
    buildSectionFromChanges(
      'UPDATED GLOSSARY',
      changes,
      (c) => /glossary/i.test(c.relPath ?? '') || (c.categories ?? []).includes('Collaboration Memory'),
      'New or updated shorthand, terminology, and glossary entries.',
    ),
  );
  fs.writeFileSync(
    path.join(packDir, 'UPDATED_COLLABORATION_MEMORY.md'),
    buildSectionFromChanges(
      'UPDATED COLLABORATION MEMORY',
      changes,
      (c) =>
        c.capsuleId === 'collaboration-intelligence' ||
        (c.categories ?? []).some((x) =>
          ['Collaboration Memory', 'Experience Lab', 'World Compiler'].includes(x),
        ),
      'Collaboration Intelligence deltas — shorthand, patterns, lessons, goosebump moments.',
    ),
  );
  fs.writeFileSync(
    path.join(packDir, 'UPDATED_FOUNDER_PREFERENCES.md'),
    buildSectionFromChanges(
      'UPDATED FOUNDER PREFERENCES',
      changes,
      (c) =>
        /founder_preference/i.test(c.relPath ?? '') ||
        (c.categories ?? []).includes('Founder Preference'),
      'Founder preference changes discovered through collaboration.',
    ),
  );
  fs.writeFileSync(path.join(packDir, 'UPDATED_CANON.md'), buildUpdatedCanon(canon, changes));
  fs.writeFileSync(
    path.join(packDir, 'UPDATED_HANDOFF.md'),
    buildSectionFromChanges(
      'UPDATED HANDOFF',
      changes,
      (c) =>
        /current_handoff|known_blockers|project_changelog/i.test(c.relPath ?? '') ||
        (c.categories ?? []).some((x) => ['Current Handoff', 'Blockers', 'Implementation Status'].includes(x)),
      'Operational handoff and blocker updates.',
    ),
  );

  writeChangePayloads(packDir, changes);

  const metadata = {
    schemaVersion: 1,
    capsuleType: 'delta-context',
    deltaVersion: meta.deltaVersion,
    deltaSequence: (baseline.deltaSequence ?? 0) + 1,
    generatedAt,
    gitCommit,
    baseOnboardingVersionRequired: meta.baseOnboardingVersion,
    currentOnboardingPackVersion: meta.currentOnboardingVersion,
    compatibilityStatus: meta.compatibilityStatus,
    buildNumber: meta.buildNumber,
    capsuleVersions: meta.capsuleVersions,
    changeCount: meta.changeCount,
    changes: changes.map((c) => ({
      type: c.type,
      capsuleId: c.capsuleId,
      capsuleLabel: c.capsuleLabel,
      path: c.relPath,
      categories: c.categories,
      hash: c.hash,
    })),
    categories: [...new Set(changes.flatMap((c) => c.categories ?? []))].sort(),
    canonSummary: canon,
    permanentLatestUrl: PERMANENT_LATEST_PATH,
    validationStatus: 'pass',
    generatorVersion: GENERATOR_VERSION,
    readyForDeltaSync: true,
  };

  fs.writeFileSync(path.join(packDir, METADATA_FILE), JSON.stringify(metadata, null, 2) + '\n');
  fs.writeFileSync(path.join(packDir, 'VALIDATION.md'), buildValidation(meta, '(pending)'));

  validateDeltaPack(packDir, metadata);

  const versionedName = `StudioOS_ContextUpdate_v${deltaVersion}.zip`;
  const publicOut = path.join(ROOT, 'public/downloads/context-updates');
  const archiveOut = path.join(publicOut, ARCHIVE_SUBDIR);
  const publicHub = path.join(ROOT, 'public/context-updates');
  fs.mkdirSync(archiveOut, { recursive: true });
  fs.mkdirSync(publicHub, { recursive: true });

  const zipPath = path.join(archiveOut, versionedName);
  execSync(`zip -r -q ${JSON.stringify(zipPath)} ${JSON.stringify(DELTA_FOLDER)}`, {
    cwd: stagingRoot,
    stdio: 'inherit',
  });
  verifyZip(zipPath);

  const checksumSha256 = sha256File(zipPath);
  const stat = fs.statSync(zipPath);
  metadata.checksumSha256 = checksumSha256;
  metadata.artifact = versionedName;
  fs.writeFileSync(path.join(packDir, METADATA_FILE), JSON.stringify(metadata, null, 2) + '\n');
  fs.writeFileSync(path.join(packDir, 'VALIDATION.md'), buildValidation(meta, checksumSha256));

  const stagingLatest = path.join(publicOut, '.latest-staging.zip');
  fs.copyFileSync(zipPath, stagingLatest);
  verifyZip(stagingLatest);
  fs.copyFileSync(stagingLatest, path.join(publicOut, LATEST_ALIAS));
  fs.unlinkSync(stagingLatest);

  const priorRelease = readJson('api/_lib/delta-context-release.json');
  const releaseHistory = priorRelease?.releaseHistory ?? [];
  releaseHistory.unshift({
    version: deltaVersion,
    generatedAt,
    gitCommit,
    checksumSha256,
    sizeBytes: stat.size,
    changeCount: meta.changeCount,
    baseOnboardingVersion: meta.baseOnboardingVersion,
    compatibilityStatus: meta.compatibilityStatus,
    downloadPath: `${DOWNLOAD_BASE}/${ARCHIVE_SUBDIR}/${versionedName}`,
    zipFileName: versionedName,
    validationStatus: 'pass',
  });

  const releaseManifest = {
    schemaVersion: 1,
    capsuleType: 'delta-context',
    currentVersion: deltaVersion,
    generatedAt,
    gitCommit,
    validationStatus: 'pass',
    changeCount: meta.changeCount,
    checksumSha256,
    artifact: versionedName,
    baseOnboardingVersionRequired: meta.baseOnboardingVersion,
    currentOnboardingPackVersion: meta.currentOnboardingVersion,
    compatibilityStatus: meta.compatibilityStatus,
    permanentLatestUrl: PERMANENT_LATEST_PATH,
    latestDownloadPath: PERMANENT_LATEST_PATH,
    legacyLatestDownloadPath: `${DOWNLOAD_BASE}/${LATEST_ALIAS}`,
    versionedDownloadPath: `${DOWNLOAD_BASE}/${ARCHIVE_SUBDIR}/${versionedName}`,
    categoriesIncluded: metadata.categories,
    packageHealth: 100,
    readyForDeltaSync: true,
    releaseHistory: releaseHistory.slice(0, 20),
  };

  writeJson('api/_lib/delta-context-release.json', releaseManifest);
  writeJson('api/_lib/delta-context-build-manifest.json', {
    ...releaseManifest,
    sizeBytes: stat.size,
    deltaSequence: metadata.deltaSequence,
  });
  writeJson(path.join(publicOut, RELEASE_MANIFEST), releaseManifest);
  writeJson(path.join(publicHub, RELEASE_MANIFEST), releaseManifest);

  const newBaseline = {
    schemaVersion: 1,
    deltaSequence: metadata.deltaSequence,
    onboardingPackVersion: meta.currentOnboardingVersion,
    publishedAt: generatedAt,
    gitCommit,
    capsuleVersions: current.versions,
    fileFingerprints: Object.fromEntries(
      Object.entries(current.files).map(([k, v]) => [k, v.hash]),
    ),
    lastDeltaVersion: deltaVersion,
  };
  writeJson(BASELINE_FILE, newBaseline);

  fs.rmSync(stagingRoot, { recursive: true, force: true });

  console.log('\nStudio OS Delta Context Capsule:');
  console.log(`  Delta version:    ${deltaVersion}`);
  console.log(`  Generated:        ${generatedAt}`);
  console.log(`  Validation:       pass`);
  console.log(`  Changes:          ${meta.changeCount}`);
  console.log(`  Compatibility:    ${meta.compatibilityStatus}`);
  console.log(`  Base onboarding:  ${meta.baseOnboardingVersion}`);
  console.log(`  Permanent latest: ${PERMANENT_LATEST_PATH}`);
  console.log(`  Dashboard:        /context-updates\n`);
}

packageDeltaContext();
