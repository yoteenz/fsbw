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

const GENERATOR_VERSION = '0.2.1';
const LATEST_ALIAS = 'latest.zip';
const RELEASE_MANIFEST = 'release.json';
const METADATA_FILE = 'context-capsule.json';
const DOWNLOAD_BASE = '/downloads/context-capsules';

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
  '# Read Confirmation',
  '# Project Understanding',
  '# Founder Preference Verification',
  '# Canon Verification',
  '# Questions',
  '# Potential Inconsistencies',
  '# Outdated Documentation',
  '# Risk Assessment',
  '# Confidence Assessment',
  '# Recommended Next Steps',
  '# Waiting For Founder Approval',
];

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

function readVersion(capsuleDir, folderName) {
  const manifestPath = path.join(capsuleDir, 'MANIFEST.md');
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    const match = manifest.match(/\*\*Capsule Version\*\*\s*\|\s*([^\|\n]+)/);
    if (match) return match[1].trim();
  }
  const folderMatch = folderName.match(/v([\d.]+)$/i);
  return folderMatch ? (folderMatch[1].includes('.') ? folderMatch[1] : `${folderMatch[1]}.0`) : '0.2.0';
}

function parseManifestField(manifest, label) {
  const re = new RegExp(`\\*\\*${label}\\*\\*\\s*\\|\\s*([^|\\n]+)`);
  const match = manifest.match(re);
  return match ? match[1].trim().replace(/^`|`$/g, '') : null;
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

function validate(capsuleDir, version) {
  const presentMd = fs.readdirSync(capsuleDir).filter((f) => f.endsWith('.md'));
  const missing = REQUIRED_FILES.filter((f) => !presentMd.includes(f));
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

  const metadataPath = path.join(capsuleDir, METADATA_FILE);
  if (!fs.existsSync(metadataPath)) {
    console.error(`\n❌ Missing ${METADATA_FILE} in capsule folder.\n`);
    process.exit(1);
  }

  const manifest = fs.readFileSync(path.join(capsuleDir, 'MANIFEST.md'), 'utf8');
  const manifestVersion = parseManifestField(manifest, 'Capsule Version');
  if (manifestVersion && manifestVersion !== version) {
    console.error(`\n❌ Version mismatch: package ${version} vs manifest ${manifestVersion}\n`);
    process.exit(1);
  }

  return presentMd;
}

function writeContextCapsuleMetadata(capsuleDir, capsuleFolderName, version, generatedAt) {
  const payload = {
    schemaVersion: 1,
    capsuleVersion: version,
    capsuleFolder: capsuleFolderName,
    generatedAt,
    projectVersion: 'build-a-wig@0.0.0',
    documentCount: REQUIRED_FILES.length,
    metadataFileCount: 1,
    readingOrder: READING_ORDER,
    readingOrderChecksum: readingOrderChecksum(),
    requiredMarkdownFiles: REQUIRED_FILES,
    validationStatus: 'pass',
    generatorVersion: GENERATOR_VERSION,
    onboardingFeatures: [
      'standardized-onboarding-report',
      'founder-preference-verification',
      'canon-verification',
      'confidence-assessment',
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
  if (!fs.existsSync(outDir)) return [];
  return fs
    .readdirSync(outDir)
    .filter((f) => /^StudioOS_ContextCapsule_v\d+\.\d+\.\d+\.zip$/.test(f))
    .map((zipFileName) => {
      const match = zipFileName.match(/v(\d+\.\d+\.\d+)\.zip$/);
      const version = match?.[1] ?? '0.0.0';
      const full = path.join(outDir, zipFileName);
      const stat = fs.statSync(full);
      return {
        version,
        zipFileName,
        downloadPath: `${DOWNLOAD_BASE}/${zipFileName}`,
        checksumSha256: sha256File(full),
        sizeBytes: stat.size,
        generatedAt: stat.mtime.toISOString(),
        gitCommit: 'unknown',
        validationStatus: 'pass',
      };
    });
}

function mergeReleaseHistory(previousRelease, entry, outDir) {
  const byVersion = new Map();
  for (const r of [
    ...discoverVersionedReleases(outDir),
    ...(previousRelease?.releaseHistory ?? []),
  ]) {
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
  const version = readVersion(capsuleDir, capsuleFolderName);
  const fileName = `StudioOS_ContextCapsule_v${version}.zip`;
  validate(capsuleDir, version);

  const generatedAt = new Date().toISOString();
  writeContextCapsuleMetadata(capsuleDir, capsuleFolderName, version, generatedAt);

  const publicOut = path.join(ROOT, 'public/downloads/context-capsules');
  const releasesOut = path.join(ROOT, 'releases/downloads/context-capsules');
  fs.mkdirSync(publicOut, { recursive: true });
  fs.mkdirSync(releasesOut, { recursive: true });

  const previousRelease = readPreviousRelease(publicOut);
  let previousVersion = previousRelease?.currentVersion ?? null;
  if (previousVersion === version) {
    previousVersion = previousRelease?.previousVersion ?? null;
  }

  const publicZip = path.join(publicOut, fileName);
  const zipCmd = `zip -r -q ${JSON.stringify(publicZip)} ${JSON.stringify(capsuleFolderName)}`;
  execSync(zipCmd, { cwd: ROOT, stdio: 'inherit' });

  const checksumSha256 = sha256File(publicZip);
  const stat = fs.statSync(publicZip);
  const versionedDownloadPath = `${DOWNLOAD_BASE}/${fileName}`;
  const latestDownloadPath = `${DOWNLOAD_BASE}/${LATEST_ALIAS}`;
  const gitCommit = readGitCommit();

  fs.copyFileSync(publicZip, path.join(publicOut, LATEST_ALIAS));
  fs.copyFileSync(publicZip, path.join(releasesOut, fileName));
  fs.copyFileSync(publicZip, path.join(releasesOut, LATEST_ALIAS));
  fs.copyFileSync(publicZip, path.join(ROOT, 'public/downloads', fileName));

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
    checksumSha256,
    generatorVersion: GENERATOR_VERSION,
    artifact: fileName,
    latestAlias: LATEST_ALIAS,
    latestDownloadPath,
    versionedDownloadPath,
    supportedFormats: SUPPORTED_FORMATS,
    releaseHistory: mergeReleaseHistory(previousRelease, releaseEntry, publicOut),
  };

  writeJson(path.join(publicOut, RELEASE_MANIFEST), releaseManifest);
  writeJson(path.join(releasesOut, RELEASE_MANIFEST), releaseManifest);

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
    capsuleFolder: capsuleFolderName,
    generatedAt,
    fileCount: REQUIRED_FILES.length,
    checksumSha256,
    sizeBytes: stat.size,
    generatorVersion: GENERATOR_VERSION,
    readingOrderChecksum: readingOrderChecksum(),
    validationStatus: 'pass',
    downloadUrls: {
      production: latestDownloadPath,
      versioned: versionedDownloadPath,
    },
  };
  writeJson(path.join(publicOut, 'manifest.json'), sidecar);
  writeJson(path.join(releasesOut, 'manifest.json'), sidecar);

  const apiBuildManifest = {
    schemaVersion: 1,
    artifact: fileName,
    capsuleVersion: version,
    capsuleFolder: capsuleFolderName,
    generatedAt,
    fileCount: REQUIRED_FILES.length,
    checksumSha256,
    sizeBytes: stat.size,
    downloadPath: versionedDownloadPath,
    latestDownloadPath,
    versionedDownloadPath,
    generatorVersion: GENERATOR_VERSION,
  };
  writeJson(path.join(ROOT, 'api/_lib/context-capsule-build-manifest.json'), apiBuildManifest);
  writeJson(path.join(ROOT, 'api/_lib/context-capsule-release.json'), releaseManifest);

  console.log(`\nAI Context Capsule™ packaged:`);
  console.log(`  Versioned: ${versionedDownloadPath} (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log(`  Latest:    ${latestDownloadPath}`);
  console.log(`  Release:   ${DOWNLOAD_BASE}/${RELEASE_MANIFEST}\n`);
}

packageCapsule();
