#!/usr/bin/env node
/**
 * Package AI Context Capsule™ — ZIP download artifact.
 *
 * Zips StudioOS_ContextCapsule_v* at repo root preserving folder structure.
 * Outputs:
 *   public/downloads/StudioOS_ContextCapsule_v{version}.zip  (Vercel static URL)
 *   releases/downloads/StudioOS_ContextCapsule_v{version}.zip  (repo release artifact)
 *
 * Usage:
 *   node scripts/package-ai-context-capsule-zip.mjs
 *   npm run download:ai-context-capsule
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');

function findCapsuleDir() {
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory() && /^StudioOS_ContextCapsule_v/i.test(e.name))
    .map((e) => e.name)
    .sort();
  if (dirs.length === 0) {
    throw new Error(
      'No StudioOS_ContextCapsule_v* directory at repo root. Create the capsule folder first.',
    );
  }
  return path.join(ROOT, dirs[dirs.length - 1]);
}

function readCapsuleVersion(capsuleDir) {
  const manifestPath = path.join(capsuleDir, 'MANIFEST.md');
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    const match = manifest.match(/\*\*Capsule Version\*\*\s*\|\s*([^\|\n]+)/);
    if (match) {
      return match[1].trim();
    }
  }
  const base = path.basename(capsuleDir);
  const folderMatch = base.match(/v([\d.]+)$/i);
  if (folderMatch) {
    const raw = folderMatch[1];
    return raw.includes('.') ? raw : `${raw}.0`;
  }
  return '0.1.0';
}

function listMarkdownFiles(capsuleDir) {
  return fs
    .readdirSync(capsuleDir)
    .filter((f) => f.endsWith('.md'))
    .sort();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeDownloadManifest(outDir, zipName, capsuleDir, version, files) {
  const manifest = {
    schemaVersion: 1,
    artifact: zipName,
    capsuleVersion: version,
    capsuleFolder: path.basename(capsuleDir),
    generatedAt: new Date().toISOString(),
    fileCount: files.length,
    files,
    downloadUrls: {
      production: `/downloads/${zipName}`,
      note: 'After deploy, fetch from https://fsbw.vercel.app/downloads/' + zipName,
    },
  };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}

function packageCapsule() {
  const capsuleDir = findCapsuleDir();
  const capsuleFolderName = path.basename(capsuleDir);
  const version = readCapsuleVersion(capsuleDir);
  const zipName = `StudioOS_ContextCapsule_v${version}.zip`;

  const mdFiles = listMarkdownFiles(capsuleDir);
  if (mdFiles.length === 0) {
    throw new Error(`No markdown files in ${capsuleFolderName}`);
  }

  const publicOut = path.join(ROOT, 'public/downloads');
  const releasesOut = path.join(ROOT, 'releases/downloads');
  ensureDir(publicOut);
  ensureDir(releasesOut);

  const publicZip = path.join(publicOut, zipName);
  const releasesZip = path.join(releasesOut, zipName);

  // Remove stale zips with same prefix
  for (const outDir of [publicOut, releasesOut]) {
    for (const f of fs.readdirSync(outDir)) {
      if (f.startsWith('StudioOS_ContextCapsule_v') && f.endsWith('.zip') && f !== zipName) {
        fs.unlinkSync(path.join(outDir, f));
      }
    }
  }

  // Build zip from repo root so archive contains StudioOS_ContextCapsule_v0.1/...
  const zipCmd = `zip -r -q ${JSON.stringify(publicZip)} ${JSON.stringify(capsuleFolderName)}`;
  execSync(zipCmd, { cwd: ROOT, stdio: 'inherit' });

  fs.copyFileSync(publicZip, releasesZip);
  writeDownloadManifest(publicOut, zipName, capsuleDir, version, mdFiles);
  writeDownloadManifest(releasesOut, zipName, capsuleDir, version, mdFiles);

  const stat = fs.statSync(publicZip);
  console.log('');
  console.log('AI Context Capsule™ — download package ready');
  console.log(`  Version:     ${version}`);
  console.log(`  Folder:      ${capsuleFolderName}/ (${mdFiles.length} markdown files)`);
  console.log(`  ZIP:         ${zipName} (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log(`  Public URL:  /downloads/${zipName}`);
  console.log(`  Local paths:`);
  console.log(`    ${path.relative(ROOT, publicZip)}`);
  console.log(`    ${path.relative(ROOT, releasesZip)}`);
  console.log('');
  console.log('Download action: npm run download:ai-context-capsule');
}

packageCapsule();
