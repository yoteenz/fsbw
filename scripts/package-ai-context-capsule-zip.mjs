#!/usr/bin/env node
/**
 * Package AI Context Capsule™ — ZIP download artifact (prebuild + CLI).
 * Does not modify capsule source files.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');

const REQUIRED_FILES = [
  'README_FIRST.md',
  'MANIFEST.md',
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
  return folderMatch ? (folderMatch[1].includes('.') ? folderMatch[1] : `${folderMatch[1]}.0`) : '0.1.0';
}

function parseManifestField(manifest, label) {
  const re = new RegExp(`\\*\\*${label}\\*\\*\\s*\\|\\s*([^|\\n]+)`);
  const match = manifest.match(re);
  return match ? match[1].trim().replace(/^`|`$/g, '') : null;
}

function validate(capsuleDir, version) {
  const present = fs.readdirSync(capsuleDir).filter((f) => f.endsWith('.md'));
  const missing = REQUIRED_FILES.filter((f) => !present.includes(f));
  if (missing.length) throw new Error(`Missing files: ${missing.join(', ')}`);
  const manifest = fs.readFileSync(path.join(capsuleDir, 'MANIFEST.md'), 'utf8');
  const manifestVersion = parseManifestField(manifest, 'Capsule Version');
  if (manifestVersion && manifestVersion !== version) {
    throw new Error(`Version mismatch: package ${version} vs manifest ${manifestVersion}`);
  }
  return present;
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
  const generatedAt = new Date().toISOString();
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
  };
  fs.writeFileSync(
    path.join(ROOT, 'api/_lib/context-capsule-build-manifest.json'),
    JSON.stringify(apiBuildManifest, null, 2) + '\n',
  );

  console.log(`\nAI Context Capsule™ packaged: ${downloadPath} (${(stat.size / 1024).toFixed(1)} KB)\n`);
}

packageCapsule();
