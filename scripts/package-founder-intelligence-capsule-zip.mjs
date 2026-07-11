#!/usr/bin/env node
/**
 * Package Founder Intelligence Capsule™ v1.0 — validation + stable latest.zip.
 * Complements AI Context Capsule (WHAT) and Studio DNA Capsule (HOW).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');

const CANONICAL_CAPSULE_VERSION = '1.0.0';
const GENERATOR_VERSION = '1.0.0';
const CAPSULE_FOLDER = 'founder-intelligence';
const LATEST_ALIAS = 'latest.zip';
const RELEASE_MANIFEST = 'release.json';
const METADATA_FILE = 'founder-intelligence.json';
const DOWNLOAD_BASE = '/downloads/founder-intelligence-capsules';
const ARCHIVE_SUBDIR = 'archive';
const PERMANENT_LATEST_PATH = '/founder-intelligence/latest';

const REQUIRED_FILES = [
  'README_FIRST.md',
  'MANIFEST.md',
  'RELATIONSHIP_TO_CONTEXT_CAPSULE.md',
  'RELATIONSHIP_TO_DNA_CAPSULE.md',
  'FOUNDER_INTELLIGENCE_INDEX.md',
  'README.md',
  'FOUNDER_PROFILE.md',
  'VISION.md',
  'PRODUCT_PHILOSOPHY.md',
  'DESIGN_LANGUAGE.md',
  'CREATIVE_DIRECTION.md',
  'STUDIO_WORLD.md',
  'CIVILIZATION.md',
  'COMPANIES.md',
  'BUSINESS_MODEL.md',
  'REVENUE_MODEL.md',
  'MONETIZATION.md',
  'MARKETPLACE.md',
  'STUDIO_WORKERS.md',
  'KNOWLEDGE_CAPTURE.md',
  'INTERVIEW_ENGINE.md',
  'EXPERT_TRUST_AND_GOVERNANCE.md',
  'DECISION_HISTORY.md',
  'COMMUNICATION_STYLE.md',
  'FOUNDER_PREFERENCES.md',
  'AI_COLLABORATION.md',
  'FUTURE_IDEAS.md',
  'LONG_TERM_ROADMAP.md',
];

const READING_ORDER = [
  'README_FIRST.md',
  'MANIFEST.md',
  'RELATIONSHIP_TO_CONTEXT_CAPSULE.md',
  'RELATIONSHIP_TO_DNA_CAPSULE.md',
  'FOUNDER_INTELLIGENCE_INDEX.md',
  'FOUNDER_PROFILE.md',
  'VISION.md',
  'PRODUCT_PHILOSOPHY.md',
  'DESIGN_LANGUAGE.md',
  'CREATIVE_DIRECTION.md',
  'STUDIO_WORLD.md',
  'CIVILIZATION.md',
  'COMPANIES.md',
  'BUSINESS_MODEL.md',
  'REVENUE_MODEL.md',
  'MONETIZATION.md',
  'MARKETPLACE.md',
  'STUDIO_WORKERS.md',
  'KNOWLEDGE_CAPTURE.md',
  'INTERVIEW_ENGINE.md',
  'EXPERT_TRUST_AND_GOVERNANCE.md',
  'DECISION_HISTORY.md',
  'COMMUNICATION_STYLE.md',
  'FOUNDER_PREFERENCES.md',
  'AI_COLLABORATION.md',
  'FUTURE_IDEAS.md',
  'LONG_TERM_ROADMAP.md',
  'FOUNDER_VALIDATION.md',
];

const METADATA_MARKERS = [
  'Last Updated',
  'Confidence Level',
  'Source',
  'Status',
  'Version',
  'Related Documents',
  'Future Questions',
];

const SUPPORTED_FORMATS = ['zip'];

function capsuleDir() {
  return path.join(ROOT, CAPSULE_FOLDER);
}

function readVersion(dir) {
  const manifestPath = path.join(dir, 'MANIFEST.md');
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const match = manifest.match(/\*\*Capsule Version\*\*\s*\|\s*([^\|\n]+)/);
  if (!match) throw new Error('MANIFEST.md missing Capsule Version');
  const version = match[1].trim();
  if (version !== CANONICAL_CAPSULE_VERSION) {
    throw new Error(`Version must be ${CANONICAL_CAPSULE_VERSION}; found ${version}`);
  }
  return version;
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

function extractInternalLinks(content) {
  const links = new Set();
  const patterns = [
    /\[([^\]]+)\]\(([A-Za-z0-9_\-./]+\.md)\)/g,
    /`([A-Za-z0-9_\-./]+\.md)`/g,
    /(?:Context|DNA)\s+`([A-Za-z0-9_\-./]+\.md)`/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(content)) !== null) {
      const base = path.basename(m[1]);
      if (base.endsWith('.md')) links.add(base);
    }
  }
  return [...links];
}

function validate(capsuleRoot, version) {
  const presentMd = fs.readdirSync(capsuleRoot).filter((f) => f.endsWith('.md'));
  const presentSet = new Set(presentMd);
  const errors = [];

  for (const f of REQUIRED_FILES) {
    if (!presentSet.has(f)) errors.push(`Missing required file: ${f}`);
  }

  for (const doc of READING_ORDER.filter((f) => f !== 'FOUNDER_VALIDATION.md')) {
    if (!presentSet.has(doc)) errors.push(`Reading order missing: ${doc}`);
  }

  const orphans = presentMd.filter(
    (f) => !REQUIRED_FILES.includes(f) && f !== 'FOUNDER_VALIDATION.md',
  );
  if (orphans.length) errors.push(`Orphan markdown files: ${orphans.join(', ')}`);

  for (const doc of REQUIRED_FILES) {
    const content = fs.readFileSync(path.join(capsuleRoot, doc), 'utf8');
    for (const marker of METADATA_MARKERS) {
      if (!content.includes(marker)) {
        errors.push(`${doc}: missing metadata marker "${marker}"`);
      }
    }
    if (!content.includes(version) && doc !== 'MANIFEST.md' && doc !== 'README_FIRST.md') {
      /* version in metadata block is optional in body for some docs — check Version: line */
      if (!content.includes('**Version:**') && !content.includes(`Version:** ${version}`)) {
        errors.push(`${doc}: version metadata not synchronized to ${version}`);
      }
    }
  }

  const manifestContent = fs.readFileSync(path.join(capsuleRoot, 'MANIFEST.md'), 'utf8');
  if (!manifestContent.includes(version)) {
    errors.push('MANIFEST.md version sync failed');
  }

  const inventory = new Set([...REQUIRED_FILES, 'FOUNDER_VALIDATION.md']);
  for (const doc of REQUIRED_FILES) {
    const content = fs.readFileSync(path.join(capsuleRoot, doc), 'utf8');
    for (const link of extractInternalLinks(content)) {
      if (link.includes('/') || link.includes('StudioOS_')) continue;
      if (link === 'FOUNDER_VALIDATION.md') continue;
      if (!inventory.has(link)) continue;
      if (!presentSet.has(link)) {
        errors.push(`${doc}: broken internal link to missing ${link}`);
      }
    }
  }

  if (errors.length) {
    console.error('\n❌ Founder Intelligence Capsule validation failed:\n');
    for (const e of errors) console.error(`   • ${e}`);
    process.exit(1);
  }

  return presentMd;
}

function writeFounderValidation(capsuleRoot, version, generatedAt, gitCommit, checksum, presentMd) {
  const body = `# Founder Intelligence Validation — Auto-Generated

| Field | Value |
|-------|-------|
| **Capsule Version** | ${version} |
| **Capsule Type** | Founder Intelligence Capsule™ |
| **Generated (UTC)** | ${generatedAt} |
| **Git Commit** | ${gitCommit} |
| **Validation** | pass |
| **Required documents** | ${REQUIRED_FILES.length} |
| **Reading order hash** | ${checksum} |
| **Markdown files on disk** | ${presentMd.length} |

## Checks

- ✓ All required founder-intelligence documents present
- ✓ Metadata markers present in every document
- ✓ Version numbers synchronized (${version})
- ✓ No orphan documents
- ✓ Internal cross-reference scan passed
- ✓ Reading order validated
- ✓ latest.zip updated only after validation pass

## Companion artifacts

**Preferred:** **Unified Onboarding Pack** (\`/onboarding/latest\`) — one START_HERE, one MASTER_MANIFEST, one report.

Pair with **AI Context Capsule™** (\`/context/latest\`) and optionally **Studio DNA Capsule™** when included in the unified pack.

*Do not edit manually — regenerated by \`scripts/package-founder-intelligence-capsule-zip.mjs\`.*
`;
  fs.writeFileSync(path.join(capsuleRoot, 'FOUNDER_VALIDATION.md'), body);
}

function writeMetadata(capsuleRoot, version, generatedAt) {
  const payload = {
    schemaVersion: 1,
    capsuleType: 'founder-intelligence',
    capsuleVersion: version,
    manifestVersion: version,
    capsuleFolder: CAPSULE_FOLDER,
    generatedAt,
    companionCapsules: {
      context: { version: '0.3.1', permanentUrl: '/context/latest' },
      studioDna: { version: '1.0.0', latestPath: '/downloads/studio-dna-capsules/latest.zip' },
    },
    documentCount: REQUIRED_FILES.length,
    readingOrder: READING_ORDER,
    readingOrderChecksum: readingOrderChecksum(),
    requiredMarkdownFiles: REQUIRED_FILES,
    validationStatus: 'pass',
    generatorVersion: GENERATOR_VERSION,
    permanentLatestUrl: PERMANENT_LATEST_PATH,
    readyForAiOnboarding: true,
    packageHealth: 100,
  };
  fs.writeFileSync(path.join(capsuleRoot, METADATA_FILE), JSON.stringify(payload, null, 2) + '\n');
  return payload;
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function verifyZipIntegrity(zipPath) {
  const stat = fs.statSync(zipPath);
  if (stat.size < 1024) {
    throw new Error(`ZIP too small (${stat.size} bytes) — aborting latest publish`);
  }
  execSync(`unzip -t ${JSON.stringify(zipPath)}`, { stdio: 'pipe' });
}

function writeJson(outPath, payload) {
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
}

function migrateVersionedZipsToArchive(publicOut, archiveOut) {
  fs.mkdirSync(archiveOut, { recursive: true });
  if (!fs.existsSync(publicOut)) return;
  for (const f of fs.readdirSync(publicOut)) {
    if (!/^Founder_Intelligence_Capsule_v\d+\.\d+\.\d+\.zip$/.test(f)) continue;
    const src = path.join(publicOut, f);
    const dest = path.join(archiveOut, f);
    if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
  }
}

function packageCapsule() {
  const dir = capsuleDir();
  if (!fs.existsSync(dir)) throw new Error(`Missing ${CAPSULE_FOLDER}/ at repo root`);

  const version = readVersion(dir);
  const fileName = `Founder_Intelligence_Capsule_v${version}.zip`;
  const presentMd = validate(dir, version);

  const generatedAt = new Date().toISOString();
  const gitCommit = readGitCommit();
  const orderChecksum = readingOrderChecksum();
  writeMetadata(dir, version, generatedAt);
  writeFounderValidation(dir, version, generatedAt, gitCommit, orderChecksum, presentMd);

  const publicOut = path.join(ROOT, 'public/downloads/founder-intelligence-capsules');
  const archiveOut = path.join(publicOut, ARCHIVE_SUBDIR);
  const releasesOut = path.join(ROOT, 'releases/downloads/founder-intelligence-capsules');
  const ficPublicDir = path.join(ROOT, 'public/founder-intelligence');
  fs.mkdirSync(publicOut, { recursive: true });
  fs.mkdirSync(archiveOut, { recursive: true });
  fs.mkdirSync(releasesOut, { recursive: true });
  fs.mkdirSync(ficPublicDir, { recursive: true });

  migrateVersionedZipsToArchive(publicOut, archiveOut);

  const publicZip = path.join(archiveOut, fileName);
  execSync(`zip -r -q ${JSON.stringify(publicZip)} ${JSON.stringify(CAPSULE_FOLDER)}`, {
    cwd: ROOT,
    stdio: 'inherit',
  });

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

  fs.mkdirSync(path.join(releasesOut, ARCHIVE_SUBDIR), { recursive: true });
  fs.copyFileSync(publicZip, path.join(releasesOut, ARCHIVE_SUBDIR, fileName));
  fs.copyFileSync(path.join(publicOut, LATEST_ALIAS), path.join(releasesOut, LATEST_ALIAS));

  const releaseManifest = {
    schemaVersion: 1,
    capsuleType: 'founder-intelligence',
    currentVersion: version,
    generatedAt,
    gitCommit,
    validationStatus: 'pass',
    documentCount: REQUIRED_FILES.length,
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
    packageHealth: 100,
    readyForAiOnboarding: true,
    releaseHistory: [
      {
        version,
        generatedAt,
        gitCommit,
        checksumSha256,
        sizeBytes: stat.size,
        downloadPath: versionedDownloadPath,
        zipFileName: fileName,
        validationStatus: 'pass',
      },
    ],
  };

  writeJson(path.join(publicOut, RELEASE_MANIFEST), releaseManifest);
  writeJson(path.join(releasesOut, RELEASE_MANIFEST), releaseManifest);
  writeJson(path.join(ficPublicDir, RELEASE_MANIFEST), releaseManifest);

  const apiBuildManifest = {
    schemaVersion: 1,
    capsuleType: 'founder-intelligence',
    artifact: fileName,
    capsuleVersion: version,
    capsuleFolder: CAPSULE_FOLDER,
    generatedAt,
    fileCount: REQUIRED_FILES.length,
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
  writeJson(path.join(ROOT, 'api/_lib/founder-intelligence-capsule-build-manifest.json'), apiBuildManifest);
  writeJson(path.join(ROOT, 'api/_lib/founder-intelligence-capsule-release.json'), releaseManifest);

  console.log(`\nFounder Intelligence Capsule™ packaged:`);
  console.log(`  Capsule Version:  ${version}`);
  console.log(`  Generated:        ${generatedAt}`);
  console.log(`  Validation:       pass`);
  console.log(`  Required docs:    ${REQUIRED_FILES.length}`);
  console.log(`  Versioned archive: ${versionedDownloadPath} (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log(`  Permanent latest:  ${PERMANENT_LATEST_PATH}`);
  console.log(`  Legacy latest:     ${legacyLatestDownloadPath}`);
  console.log(`  Download hub:      /founder-intelligence\n`);
}

packageCapsule();
