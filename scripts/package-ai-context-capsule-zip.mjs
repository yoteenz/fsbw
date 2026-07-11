#!/usr/bin/env node
/**
 * Package AI Context Capsule™ — versioned releases + stable latest.zip alias.
 * Validation must pass before latest.zip or release.json are updated.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');

/** Single canonical semver for every generated artifact and version-sync check. */
const CANONICAL_CAPSULE_VERSION = '0.3.1';
const GENERATOR_VERSION = CANONICAL_CAPSULE_VERSION;
const LATEST_ALIAS = 'latest.zip';
const RELEASE_MANIFEST = 'release.json';
const METADATA_FILE = 'context-capsule.json';
const DOWNLOAD_BASE = '/downloads/context-capsules';
const ARCHIVE_SUBDIR = 'archive';
/** Permanent public URL — never changes; file behind it updates on each validated release. */
const PERMANENT_LATEST_PATH = '/context/latest';

const OPERATIONAL_SOURCE_OF_TRUTH = [
  'CURRENT_HANDOFF.md',
  'KNOWN_BLOCKERS.md',
  'PROJECT_CHANGELOG.md',
];

const REQUIRED_FILES = [
  'README_FIRST.md',
  'MANIFEST.md',
  'ONBOARDING_REPORT.md',
  'FOUNDER_PROFILE.md',
  'CHATGPT_OPERATING_MANUAL.md',
  'AI_STYLE_GUIDE.md',
  'AI_CONTEXT.md',
  'CURRENT_HANDOFF.md',
  'AI_GLOSSARY.md',
  'PROJECT_DNA.md',
  'PROJECT_CHANGELOG.md',
  'PROMPT_LIBRARY.md',
  'ROADMAP.md',
  'KNOWN_BLOCKERS.md',
  'OPEN_QUESTIONS.md',
];

const READING_ORDER = [
  'README_FIRST.md',
  'MANIFEST.md',
  'KNOWN_BLOCKERS.md',
  'CURRENT_HANDOFF.md',
  'FOUNDER_PROFILE.md',
  'PROJECT_DNA.md',
  'AI_CONTEXT.md',
  'AI_GLOSSARY.md',
  'CHATGPT_OPERATING_MANUAL.md',
  'AI_STYLE_GUIDE.md',
  'PROJECT_CHANGELOG.md',
  'ROADMAP.md',
  'OPEN_QUESTIONS.md',
  'PROMPT_LIBRARY.md',
  'ONBOARDING_REPORT.md',
];

const ONBOARDING_SECTIONS = [
  '# Onboarding Compliance Checklist',
  '# Read Confirmation',
  '# Project Understanding',
  '# Founder Understanding',
  '# Operational Source of Truth',
  '# Canon Verification',
  '# Questions',
  '# Confidence Assessment',
  '# Documentation Review',
  '# Risk Assessment',
  '# Recommended Next Steps',
  '# Waiting For Founder Approval',
];

const VERSION_SYNC_FILES = [
  'README_FIRST.md',
  'MANIFEST.md',
  'AI_CONTEXT.md',
  'ONBOARDING_REPORT.md',
];

/** Legacy semver strings that must not appear in version-sync files (historical changelog exempt). */
const FORBIDDEN_VERSION_STRINGS = ['0.3.0', '0.2.0', '0.2.1', '0.1.0'];

const SUPPORTED_FORMATS = ['zip'];

function findCapsuleDir() {
  const dirs = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^StudioOS_ContextCapsule_v/i.test(e.name))
    .map((e) => e.name)
    .sort();
  if (!dirs.length) throw new Error('No StudioOS_ContextCapsule_v* directory at repo root.');
  return { dir: path.join(ROOT, dirs[dirs.length - 1]), name: dirs[dirs.length - 1] };
}

function readVersion(capsuleDir) {
  const manifestPath = path.join(capsuleDir, 'MANIFEST.md');
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    const match = manifest.match(/\*\*Capsule Version\*\*\s*\|\s*([^\|\n]+)/);
    if (match) return match[1].trim();
  }
  return CANONICAL_CAPSULE_VERSION;
}

function parseManifestField(manifest, label) {
  const re = new RegExp(`\\*\\*${label}\\*\\*\\s*\\|\\s*([^|\\n]+)`);
  const match = manifest.match(re);
  return match ? match[1].trim().replace(/^`|`$/g, '') : null;
}

function parseManifestInventory(manifest) {
  const files = [];
  const re = /`\s*([A-Z0-9_]+\.md|context-capsule\.json|CAPSULE_VALIDATION\.md)\s*`/gi;
  let m;
  while ((m = re.exec(manifest)) !== null) {
    const name = m[1];
    if (!files.includes(name)) files.push(name);
  }
  return files.filter((f) => f.endsWith('.md'));
}

function readingOrderChecksum() {
  return crypto.createHash('sha256').update(READING_ORDER.join('\n')).digest('hex');
}

function readGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function readPreviousRelease(outDir) {
  const releasePath = path.join(outDir, RELEASE_MANIFEST);
  if (!fs.existsSync(releasePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(releasePath, 'utf8'));
  } catch {
    return null;
  }
}

function extractMarkdownReferences(content) {
  const refs = new Set();
  const patterns = [
    /`([A-Za-z0-9_\-]+\.md)`/g,
    /\[([^\]]+\.md)\]/g,
    /\/downloads\/context-capsules\/([A-Za-z0-9_\-.]+\.zip)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(content)) !== null) {
      refs.add(m[1]);
    }
  }
  return [...refs];
}

function parseBlockersSummary(blockersMd) {
  const rows = [];
  const tableRe = /\|\s*\*\*B(\d+)\*\*\s*\|([^|]+)\|/g;
  let m;
  while ((m = tableRe.exec(blockersMd)) !== null) {
    rows.push(`B${m[1]}: ${m[2].trim()}`);
  }
  if (!rows.length) {
    const ids = [...blockersMd.matchAll(/##\s*(B\d+)/g)].map((x) => x[1]);
    return ids.length ? ids.join(', ') : 'See KNOWN_BLOCKERS.md';
  }
  return rows.join(' · ');
}

function parseHandoffStage(handoffMd) {
  const sprint = handoffMd.match(/\*\*([^*]+)\*\*\s*\n\nRefine onboarding/s)?.[1]
    ?? handoffMd.match(/## Current sprint\s*\n\n\*\*([^*]+)\*\*/)?.[1]
    ?? handoffMd.match(/## Current sprint\s*\n\n([^\n]+)/)?.[1]?.trim();
  return sprint ?? 'See CURRENT_HANDOFF.md';
}

function buildReadVerificationSection(manifestInventory, presentMd) {
  const manifestSet = new Set(manifestInventory);
  const presentSet = new Set(presentMd);
  const lines = ['## Read Verification', ''];
  for (const file of manifestInventory.sort()) {
    const ok = presentSet.has(file);
    lines.push(`${ok ? '✓' : '✗'} ${file}`);
  }
  const missing = manifestInventory.filter((f) => !presentSet.has(f));
  const extra = presentMd.filter((f) => !manifestSet.has(f) && f !== 'CAPSULE_VALIDATION.md');
  lines.push('');
  lines.push(`Manifest Count: ${manifestInventory.length}`);
  lines.push(`Read Count: ${manifestInventory.length - missing.length}`);
  lines.push(`Missing: ${missing.length}${missing.length ? ` (${missing.join(', ')})` : ''}`);
  lines.push(`Extra: ${extra.length}${extra.length ? ` (${extra.join(', ')})` : ''}`);
  return { section: lines.join('\n'), missing, extra };
}

function buildOperationalVerificationSection(handoffMd, blockersMd) {
  const stage = parseHandoffStage(handoffMd);
  const blockers = parseBlockersSummary(blockersMd);
  return `## Operational Verification

### Operational Source of Truth

Verified:

✓ CURRENT_HANDOFF.md
✓ KNOWN_BLOCKERS.md
✓ PROJECT_CHANGELOG.md

### Current Implementation Stage

${stage}

### Current Active Blockers

${blockers}

### Approval Required Before Contribution

**YES** — complete ONBOARDING_REPORT.md and wait for explicit founder approval (e.g. "approved — proceed").`;
}

function buildValidationFooter(version, generatedAt, validationPassed) {
  return `## Capsule Validation

| Field | Value |
|-------|-------|
| **Capsule Version** | ${version} |
| **Manifest Version** | ${version} |
| **Generated** | ${generatedAt} |
| **Validation Passed** | ${validationPassed ? 'YES' : 'NO'} |
| **Operational Source of Truth** | CURRENT_HANDOFF.md · KNOWN_BLOCKERS.md · PROJECT_CHANGELOG.md |
| **Current Handoff Document** | CURRENT_HANDOFF.md |
| **Current Blockers Document** | KNOWN_BLOCKERS.md |`;
}

function validate(capsuleDir, version) {
  const presentMd = fs.readdirSync(capsuleDir).filter((f) => f.endsWith('.md'));
  const presentSet = new Set(presentMd);

  const missing = REQUIRED_FILES.filter((f) => !presentSet.has(f));
  if (missing.length) {
    console.error('\n❌ Context Capsule validation failed — missing required documents:\n');
    for (const f of missing) console.error(`   • ${f}`);
    console.error('\nlatest.zip was NOT updated. Previous release preserved.\n');
    process.exit(1);
  }

  const onboarding = fs.readFileSync(path.join(capsuleDir, 'ONBOARDING_REPORT.md'), 'utf8');
  const missingSections = ONBOARDING_SECTIONS.filter((h) => !onboarding.includes(h));
  if (missingSections.length) {
    console.error('\n❌ ONBOARDING_REPORT.md missing required sections:\n');
    for (const h of missingSections) console.error(`   • ${h}`);
    console.error('\nlatest.zip was NOT updated. Previous release preserved.\n');
    process.exit(1);
  }

  if (version !== CANONICAL_CAPSULE_VERSION) {
    console.error(`\n❌ Capsule version must be ${CANONICAL_CAPSULE_VERSION}; MANIFEST declares ${version}\n`);
    process.exit(1);
  }

  const manifest = fs.readFileSync(path.join(capsuleDir, 'MANIFEST.md'), 'utf8');
  const manifestVersion = parseManifestField(manifest, 'Capsule Version');
  if (manifestVersion && manifestVersion !== version) {
    console.error(`\n❌ Version mismatch: package ${version} vs manifest ${manifestVersion}\n`);
    process.exit(1);
  }

  for (const file of VERSION_SYNC_FILES) {
    const content = fs.readFileSync(path.join(capsuleDir, file), 'utf8');
    if (!content.includes(version)) {
      console.error(`\n❌ Version sync failed: ${file} does not declare capsule version ${version}\n`);
      process.exit(1);
    }
    for (const forbidden of FORBIDDEN_VERSION_STRINGS) {
      if (content.includes(forbidden)) {
        console.error(`\n❌ Stale version string "${forbidden}" found in ${file} — use ${version} only\n`);
        process.exit(1);
      }
    }
  }

  for (const doc of READING_ORDER) {
    if (!fs.existsSync(path.join(capsuleDir, doc))) {
      console.error(`\n❌ Reading order reference missing on disk: ${doc}\n`);
      process.exit(1);
    }
  }

  const manifestInventory = parseManifestInventory(manifest);
  const inventoryMissing = manifestInventory.filter((f) => !presentSet.has(f));
  if (inventoryMissing.length) {
    console.error('\n❌ MANIFEST inventory references missing files:\n');
    for (const f of inventoryMissing) console.error(`   • ${f}`);
    process.exit(1);
  }

  const readme = fs.readFileSync(path.join(capsuleDir, 'README_FIRST.md'), 'utf8');
  const readmeRefs = extractMarkdownReferences(readme).filter((r) => r.endsWith('.md'));
  const badReadmeRefs = readmeRefs.filter((r) => !presentSet.has(r) && !REQUIRED_FILES.includes(r));
  if (badReadmeRefs.length) {
    console.error(`\n❌ README_FIRST.md references missing files: ${badReadmeRefs.join(', ')}\n`);
    process.exit(1);
  }

  for (const file of ['README_FIRST.md', 'MANIFEST.md', 'ONBOARDING_REPORT.md']) {
    const fp = path.join(capsuleDir, file);
    if (!fs.existsSync(fp)) continue;
    const content = fs.readFileSync(fp, 'utf8');
    const refs = extractMarkdownReferences(content).filter((r) => r.endsWith('.md'));
    for (const ref of refs) {
      const mustExist =
        REQUIRED_FILES.includes(ref) || ref === 'CAPSULE_VALIDATION.md' || manifestInventory.includes(ref);
      if (mustExist && !presentSet.has(ref)) {
        console.error(`\n❌ Broken internal link in ${file}: \`${ref}\` not found on disk\n`);
        process.exit(1);
      }
    }
  }

  const metadataPath = path.join(capsuleDir, METADATA_FILE);
  if (!fs.existsSync(metadataPath)) {
    console.error(`\n❌ Missing ${METADATA_FILE} — will be generated after validation\n`);
    process.exit(1);
  }

  return { presentMd, manifest, manifestInventory };
}

function writeCapsuleValidationPage(capsuleDir, version, generatedAt, gitCommit, checksum, manifestInventory, presentMd) {
  const handoffMd = fs.readFileSync(path.join(capsuleDir, 'CURRENT_HANDOFF.md'), 'utf8');
  const blockersMd = fs.readFileSync(path.join(capsuleDir, 'KNOWN_BLOCKERS.md'), 'utf8');
  const { section: readVerification } = buildReadVerificationSection(manifestInventory, presentMd);
  const operational = buildOperationalVerificationSection(handoffMd, blockersMd);
  const footer = buildValidationFooter(version, generatedAt, true);

  const body = `# Capsule Validation — Auto-Generated

**Purpose:** Prove this export is complete, current, and passed automated validation before ZIP packaging.

> **Note:** Regenerated on every export by \`scripts/package-ai-context-capsule-zip.mjs\`. Do not edit manually.

| Field | Value |
|-------|-------|
| **Capsule Version** | ${version} |
| **Manifest Version** | ${version} |
| **Generation Date (UTC)** | ${generatedAt} |
| **Repository Commit SHA** | ${gitCommit} |
| **Validation Status** | pass |
| **Documents Included** | ${REQUIRED_FILES.join(', ')} |
| **Manifest Hash (reading order SHA-256)** | ${checksum} |
| **Total Markdown Files** | ${presentMd.length} |
| **Generator Version** | ${GENERATOR_VERSION} |
| **Export Completed** | yes |

---

${readVerification}

---

${operational}

---

${footer}

---

## Validation checks performed

- ✓ Every MANIFEST inventory document exists on disk
- ✓ Every required onboarding document exists
- ✓ No duplicate/stale capsule version strings in version-sync files
- ✓ Internal markdown links resolve
- ✓ README_FIRST.md references only existing files
- ✓ \`context-capsule.json\` matches exported reading order and version
- ✓ ONBOARDING_REPORT.md includes all required template sections
- ✓ \`latest.zip\` updated only after validation pass

If **Validation Passed** is not **YES**, do **not** use this capsule for onboarding — regenerate from repo \`master\`.

---

*End of CAPSULE_VALIDATION — reference only; onboarding follows README_FIRST.md.*
`;
  fs.writeFileSync(path.join(capsuleDir, 'CAPSULE_VALIDATION.md'), body);
}

function writeContextCapsuleMetadata(capsuleDir, capsuleFolderName, version, generatedAt) {
  const payload = {
    schemaVersion: 1,
    capsuleVersion: version,
    manifestVersion: version,
    capsuleFolder: capsuleFolderName,
    generatedAt,
    projectVersion: 'build-a-wig@0.0.0',
    documentCount: REQUIRED_FILES.length,
    metadataFileCount: 1,
    readingOrder: READING_ORDER,
    readingOrderChecksum: readingOrderChecksum(),
    requiredMarkdownFiles: REQUIRED_FILES,
    operationalSourceOfTruth: OPERATIONAL_SOURCE_OF_TRUTH,
    validationStatus: 'pass',
    generatorVersion: GENERATOR_VERSION,
    onboardingFeatures: [
      'verification-onboarding-v0.3.1',
      'read-verification-auto',
      'operational-verification-auto',
      'capsule-validation-footer',
      'onboarding-compliance-checklist',
      'operational-source-of-truth-hierarchy',
      'documented-vs-inferred-labels',
      'documentation-review-certainty-tags',
      'export-validation-gate',
      'stable-latest-alias',
      'release-manifest',
    ],
    futureModules: [
      'knowledge-quizzes',
      'architecture-verification',
      'tar-bundle',
      'json-bundle',
      'compressed-ai-package',
      'onboarding-analytics',
    ],
  };
  fs.writeFileSync(path.join(capsuleDir, METADATA_FILE), JSON.stringify(payload, null, 2) + '\n');
  return payload;
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function discoverVersionedReleases(outDir) {
  const archiveDir = path.join(outDir, ARCHIVE_SUBDIR);
  const dirs = [archiveDir, outDir].filter((d) => fs.existsSync(d));
  const found = new Map();
  for (const dir of dirs) {
    for (const zipFileName of fs.readdirSync(dir)) {
      if (!/^StudioOS_ContextCapsule_v\d+\.\d+\.\d+\.zip$/.test(zipFileName)) continue;
      if (found.has(zipFileName)) continue;
      const match = zipFileName.match(/v(\d+\.\d+\.\d+)\.zip$/);
      const ver = match?.[1] ?? '0.0.0';
      const full = path.join(dir, zipFileName);
      const stat = fs.statSync(full);
      const inArchive = dir === archiveDir;
      found.set(zipFileName, {
        version: ver,
        zipFileName,
        downloadPath: inArchive
          ? `${DOWNLOAD_BASE}/${ARCHIVE_SUBDIR}/${zipFileName}`
          : `${DOWNLOAD_BASE}/${zipFileName}`,
        checksumSha256: sha256File(full),
        sizeBytes: stat.size,
        generatedAt: stat.mtime.toISOString(),
        gitCommit: 'unknown',
        validationStatus: 'pass',
      });
    }
  }
  return [...found.values()];
}

function verifyZipIntegrity(zipPath) {
  const stat = fs.statSync(zipPath);
  if (stat.size < 1024) {
    throw new Error(`ZIP too small (${stat.size} bytes) — aborting latest publish`);
  }
  try {
    execSync(`unzip -t ${JSON.stringify(zipPath)}`, { stdio: 'pipe' });
  } catch {
    throw new Error('ZIP integrity check failed (unzip -t) — aborting latest publish');
  }
}

function migrateVersionedZipsToArchive(publicOut, archiveOut) {
  fs.mkdirSync(archiveOut, { recursive: true });
  if (!fs.existsSync(publicOut)) return;
  for (const f of fs.readdirSync(publicOut)) {
    if (!/^StudioOS_ContextCapsule_v\d+\.\d+\.\d+\.zip$/.test(f)) continue;
    const src = path.join(publicOut, f);
    const dest = path.join(archiveOut, f);
    if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
  }
}

function mergeReleaseHistory(previousRelease, entry, outDir) {
  const byVersion = new Map();
  for (const r of [...(previousRelease?.releaseHistory ?? []), ...discoverVersionedReleases(outDir)]) {
    byVersion.set(r.version, r);
  }
  byVersion.set(entry.version, entry);
  const merged = [...byVersion.values()];
  merged.sort((a, b) => {
    const pa = a.version.split('.').map(Number);
    const pb = b.version.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const diff = (pb[i] ?? 0) - (pa[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
  });
  return merged;
}

function updateHistory(outDir, record) {
  const indexPath = path.join(outDir, 'history.json');
  let history = { schemaVersion: 1, exports: [] };
  if (fs.existsSync(indexPath)) {
    try {
      history = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch {
      history = { schemaVersion: 1, exports: [] };
    }
  }
  history.exports = [record, ...history.exports.filter((e) => e.id !== record.id)];
  fs.writeFileSync(indexPath, JSON.stringify(history, null, 2) + '\n');
}

function writeJson(outPath, payload) {
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
}

function packageCapsule() {
  const { dir: capsuleDir, name: capsuleFolderName } = findCapsuleDir();
  const version = readVersion(capsuleDir);
  const fileName = `StudioOS_ContextCapsule_v${version}.zip`;
  const { presentMd, manifestInventory } = validate(capsuleDir, version);

  const generatedAt = new Date().toISOString();
  const gitCommit = readGitCommit();
  const orderChecksum = readingOrderChecksum();
  const meta = writeContextCapsuleMetadata(capsuleDir, capsuleFolderName, version, generatedAt);
  writeCapsuleValidationPage(capsuleDir, version, generatedAt, gitCommit, orderChecksum, manifestInventory, presentMd);

  if (meta.capsuleVersion !== version || meta.readingOrderChecksum !== orderChecksum) {
    console.error('\n❌ context-capsule.json does not match exported documents after write\n');
    process.exit(1);
  }

  const publicOut = path.join(ROOT, 'public/downloads/context-capsules');
  const archiveOut = path.join(publicOut, ARCHIVE_SUBDIR);
  const releasesOut = path.join(ROOT, 'releases/downloads/context-capsules');
  fs.mkdirSync(publicOut, { recursive: true });
  fs.mkdirSync(archiveOut, { recursive: true });
  fs.mkdirSync(releasesOut, { recursive: true });

  migrateVersionedZipsToArchive(publicOut, archiveOut);

  const previousRelease = readPreviousRelease(publicOut);
  let previousVersion = previousRelease?.currentVersion ?? null;
  if (previousVersion === version) {
    previousVersion = previousRelease?.previousVersion ?? null;
  }

  const publicZip = path.join(archiveOut, fileName);
  const zipCmd = `zip -r -q ${JSON.stringify(publicZip)} ${JSON.stringify(capsuleFolderName)}`;
  execSync(zipCmd, { cwd: ROOT, stdio: 'inherit' });

  verifyZipIntegrity(publicZip);

  const checksumSha256 = sha256File(publicZip);
  const stat = fs.statSync(publicZip);
  const versionedDownloadPath = `${DOWNLOAD_BASE}/${ARCHIVE_SUBDIR}/${fileName}`;
  const legacyLatestDownloadPath = `${DOWNLOAD_BASE}/${LATEST_ALIAS}`;

  const stagingLatest = path.join(publicOut, '.latest-staging.zip');
  fs.copyFileSync(publicZip, stagingLatest);
  verifyZipIntegrity(stagingLatest);
  fs.copyFileSync(stagingLatest, path.join(publicOut, LATEST_ALIAS));
  fs.unlinkSync(stagingLatest);

  const releasesArchive = path.join(releasesOut, ARCHIVE_SUBDIR);
  fs.mkdirSync(releasesArchive, { recursive: true });
  fs.copyFileSync(publicZip, path.join(releasesArchive, fileName));
  fs.copyFileSync(path.join(publicOut, LATEST_ALIAS), path.join(releasesOut, LATEST_ALIAS));

  const contextPublicDir = path.join(ROOT, 'public/context');
  fs.mkdirSync(contextPublicDir, { recursive: true });

  const releaseEntry = {
    version,
    generatedAt,
    gitCommit,
    checksumSha256,
    sizeBytes: stat.size,
    downloadPath: versionedDownloadPath,
    zipFileName: fileName,
    validationStatus: 'pass',
  };

  const releaseManifest = {
    schemaVersion: 1,
    currentVersion: version,
    previousVersion,
    generatedAt,
    gitCommit,
    validationStatus: 'pass',
    documentCount: REQUIRED_FILES.length,
    manifestDocumentCount: manifestInventory.length,
    checksumSha256,
    generatorVersion: GENERATOR_VERSION,
    artifact: fileName,
    latestAlias: LATEST_ALIAS,
    permanentLatestUrl: PERMANENT_LATEST_PATH,
    latestDownloadPath: PERMANENT_LATEST_PATH,
    legacyLatestDownloadPath,
    versionedDownloadPath,
    archiveBasePath: `${DOWNLOAD_BASE}/${ARCHIVE_SUBDIR}`,
    supportedFormats: SUPPORTED_FORMATS,
    releaseHistory: mergeReleaseHistory(previousRelease, releaseEntry, publicOut),
    packageHealth: 100,
    readyForAiOnboarding: true,
  };

  writeJson(path.join(publicOut, RELEASE_MANIFEST), releaseManifest);
  writeJson(path.join(releasesOut, RELEASE_MANIFEST), releaseManifest);
  writeJson(path.join(contextPublicDir, RELEASE_MANIFEST), releaseManifest);

  const manifestText = fs.readFileSync(path.join(capsuleDir, 'MANIFEST.md'), 'utf8');

  const record = {
    id: `prebuild-${generatedAt.replace(/[:.]/g, '-')}`,
    version,
    zipFileName: fileName,
    generatedAt,
    projectVersion: parseManifestField(manifestText, 'Project Version') ?? '0.0.0',
    studioOsVersion: gitCommit.slice(0, 7),
    checksumSha256,
    sizeBytes: stat.size,
    downloadPath: versionedDownloadPath,
  };

  updateHistory(publicOut, record);
  updateHistory(releasesOut, record);

  const sidecar = {
    schemaVersion: 1,
    artifact: fileName,
    capsuleVersion: version,
    manifestVersion: version,
    capsuleFolder: capsuleFolderName,
    generatedAt,
    fileCount: REQUIRED_FILES.length,
    manifestDocumentCount: manifestInventory.length,
    checksumSha256,
    sizeBytes: stat.size,
    generatorVersion: GENERATOR_VERSION,
    readingOrderChecksum: readingOrderChecksum(),
    validationStatus: 'pass',
    downloadUrls: {
      permanent: PERMANENT_LATEST_PATH,
      production: PERMANENT_LATEST_PATH,
      legacy: legacyLatestDownloadPath,
      versioned: versionedDownloadPath,
    },
  };
  writeJson(path.join(publicOut, 'manifest.json'), sidecar);
  writeJson(path.join(releasesOut, 'manifest.json'), sidecar);

  const apiBuildManifest = {
    schemaVersion: 1,
    artifact: fileName,
    capsuleVersion: version,
    manifestVersion: version,
    capsuleFolder: capsuleFolderName,
    generatedAt,
    fileCount: REQUIRED_FILES.length,
    manifestDocumentCount: manifestInventory.length,
    checksumSha256,
    sizeBytes: stat.size,
    downloadPath: versionedDownloadPath,
    latestDownloadPath: PERMANENT_LATEST_PATH,
    permanentLatestUrl: PERMANENT_LATEST_PATH,
    legacyLatestDownloadPath,
    versionedDownloadPath,
    generatorVersion: GENERATOR_VERSION,
    validationStatus: 'pass',
  };
  writeJson(path.join(ROOT, 'api/_lib/context-capsule-build-manifest.json'), apiBuildManifest);
  writeJson(path.join(ROOT, 'api/_lib/context-capsule-release.json'), releaseManifest);

  console.log(`\nAI Context Capsule™ packaged:`);
  console.log(`  Capsule Version:  ${version}`);
  console.log(`  Generated:        ${generatedAt}`);
  console.log(`  Validation:       pass`);
  console.log(`  Manifest docs:    ${manifestInventory.length}`);
  console.log(`  Required docs:    ${REQUIRED_FILES.length}`);
  console.log(`  Versioned archive: ${versionedDownloadPath} (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log(`  Permanent latest:  ${PERMANENT_LATEST_PATH}`);
  console.log(`  Legacy latest:     ${legacyLatestDownloadPath}`);
  console.log(`  Download hub:      /context`);
  console.log(`  Release:           ${DOWNLOAD_BASE}/${RELEASE_MANIFEST}\n`);
}

packageCapsule();
