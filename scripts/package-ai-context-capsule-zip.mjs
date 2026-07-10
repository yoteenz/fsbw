#!/usr/bin/env node
/**
 * Package AI Context Capsule™ — ZIP download artifact (prebuild + CLI).
 * Does not modify capsule markdown source except regenerating context-capsule.json metadata.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');

const GENERATOR_VERSION = '0.2.0';

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

const METADATA_FILE = 'context-capsule.json';

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

function validate(capsuleDir, version) {
  const presentMd = fs.readdirSync(capsuleDir).filter((f) => f.endsWith('.md'));
  const missing = REQUIRED_FILES.filter((f) => !presentMd.includes(f));
  if (missing.length) {
    console.error('\n❌ Context Capsule validation failed — missing required documents:\n');
    for (const f of missing) console.error(`   • ${f}`);
    console.error('\nDo not package ZIP until resolved.\n');
    process.exit(1);
  }

  const onboarding = fs.readFileSync(path.join(capsuleDir, 'ONBOARDING_REPORT.md'), 'utf8');
  const missingSections = ONBOARDING_SECTIONS.filter((h) => !onboarding.includes(h));
  if (missingSections.length) {
    console.error('\n❌ ONBOARDING_REPORT.md missing required sections:\n');
    for (const h of missingSections) console.error(`   • ${h}`);
    process.exit(1);
  }

  const manifest = fs.readFileSync(path.join(capsuleDir, 'MANIFEST.md'), 'utf8');
  const manifestVersion = parseManifestField(manifest, 'Capsule Version');
  if (manifestVersion && manifestVersion !== version) {
    throw new Error(`Version mismatch: package ${version} vs manifest ${manifestVersion}`);
  }

  return presentMd;
}

function writeContextCapsuleMetadata(capsuleDir, capsuleFolderName, version, generatedAt, validationPassed) {
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
    validationStatus: validationPassed ? 'pass' : 'fail',
    generatorVersion: GENERATOR_VERSION,
    onboardingFeatures: [
      'standardized-onboarding-report',
      'founder-preference-verification',
      'canon-verification',
      'confidence-assessment',
      'export-validation-gate',
    ],
    futureModules: [
      'knowledge-quizzes',
      'architecture-verification',
      'founder-updates',
      'project-health-summary',
      'governance-checks',
      'model-compatibility',
      'onboarding-analytics',
    ],
  };
  fs.writeFileSync(
    path.join(capsuleDir, METADATA_FILE),
    JSON.stringify(payload, null, 2) + '\n',
  );
  return payload;
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
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

function packageCapsule() {
  const { dir: capsuleDir, name: capsuleFolderName } = findCapsuleDir();
  const version = readVersion(capsuleDir, capsuleFolderName);
  const fileName = `StudioOS_ContextCapsule_v${version}.zip`;
  validate(capsuleDir, version);

  const generatedAt = new Date().toISOString();
  writeContextCapsuleMetadata(capsuleDir, capsuleFolderName, version, generatedAt, true);

  const publicOut = path.join(ROOT, 'public/downloads/context-capsules');
  const releasesOut = path.join(ROOT, 'releases/downloads/context-capsules');
  fs.mkdirSync(publicOut, { recursive: true });
  fs.mkdirSync(releasesOut, { recursive: true });

  const publicZip = path.join(publicOut, fileName);
  const zipCmd = `zip -r -q ${JSON.stringify(publicZip)} ${JSON.stringify(capsuleFolderName)}`;
  execSync(zipCmd, { cwd: ROOT, stdio: 'inherit' });

  fs.copyFileSync(publicZip, path.join(releasesOut, fileName));
  fs.copyFileSync(publicZip, path.join(ROOT, 'public/downloads', fileName));

  const manifestText = fs.readFileSync(path.join(capsuleDir, 'MANIFEST.md'), 'utf8');
  const checksumSha256 = sha256File(publicZip);
  const stat = fs.statSync(publicZip);
  const downloadPath = `/downloads/context-capsules/${fileName}`;

  const record = {
    id: `prebuild-${generatedAt.replace(/[:.]/g, '-')}`,
    version,
    zipFileName: fileName,
    generatedAt,
    projectVersion: parseManifestField(manifestText, 'Project Version') ?? '0.0.0',
    studioOsVersion: parseManifestField(manifestText, 'Studio OS Version') ?? 'unknown',
    checksumSha256,
    sizeBytes: stat.size,
    downloadPath,
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
    downloadUrls: { production: downloadPath },
  };
  fs.writeFileSync(path.join(publicOut, 'manifest.json'), JSON.stringify(sidecar, null, 2) + '\n');
  fs.writeFileSync(path.join(releasesOut, 'manifest.json'), JSON.stringify(sidecar, null, 2) + '\n');

  const apiBuildManifest = {
    schemaVersion: 1,
    artifact: fileName,
    capsuleVersion: version,
    capsuleFolder: capsuleFolderName,
    generatedAt,
    fileCount: REQUIRED_FILES.length,
    checksumSha256,
    sizeBytes: stat.size,
    downloadPath,
    generatorVersion: GENERATOR_VERSION,
  };
  fs.writeFileSync(
    path.join(ROOT, 'api/_lib/context-capsule-build-manifest.json'),
    JSON.stringify(apiBuildManifest, null, 2) + '\n',
  );

  console.log(`\nAI Context Capsule™ packaged: ${downloadPath} (${(stat.size / 1024).toFixed(1)} KB)\n`);
}

packageCapsule();
