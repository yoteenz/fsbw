#!/usr/bin/env node
/**
 * Copy + safe-extract SITE 00 V2 reduced benchmark zip into WFE fixture paths.
 * Usage: node scripts/wfe-prepare-benchmark-fixture.mjs [/path/to/Under4MB.zip]
 */
import { createHash } from 'node:crypto';
import { copyFileSync, createReadStream, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const CANONICAL_SHA256 = '82c98b0f5c4bac57372b91a13d6b59a7550ab73e03069189b68d88ec7e7c8ab2';
const BASE = join(
  process.cwd(),
  'src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-v2'
);
const INCOMING = join(BASE, 'incoming');
const FIXTURE = join(BASE, 'fixture');

function sha256File(path) {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash('sha256');
    createReadStream(path)
      .on('data', (d) => hash.update(d))
      .on('end', () => resolvePromise(hash.digest('hex')))
      .on('error', reject);
  });
}

function safeExtractZip(archivePath, destDir) {
  mkdirSync(destDir, { recursive: true });
  const destRoot = resolve(destDir) + '/';
  const listing = execSync(`unzip -Z1 "${archivePath}"`, { encoding: 'utf8' });
  for (const entry of listing.split('\n').filter(Boolean)) {
    const normalized = entry.replace(/^(\.\.(\/|\\|$))+/, '');
    const target = resolve(destDir, normalized);
    if (!target.startsWith(destRoot)) {
      throw new Error(`Zip slip blocked: ${entry}`);
    }
  }
  execSync(`unzip -o "${archivePath}" -d "${destDir}"`, { stdio: 'pipe' });
}

const source = process.argv[2] || process.env.WFE_REDUCED_PACKAGE_PATH;
if (!source || !existsSync(source)) {
  console.error('Missing zip. Pass path or set WFE_REDUCED_PACKAGE_PATH.');
  process.exit(1);
}

const sha = await sha256File(source);
if (sha !== CANONICAL_SHA256) {
  console.error(`SHA-256 mismatch: got ${sha}, expected ${CANONICAL_SHA256}`);
  process.exit(1);
}

mkdirSync(INCOMING, { recursive: true });
const destName = `SITE00_Build_Object_V2_Under4MB_${sha.slice(0, 4)}.zip`;
const incomingCopy = join(INCOMING, destName);
copyFileSync(source, incomingCopy);
safeExtractZip(incomingCopy, FIXTURE);

const blend = join(FIXTURE, '01_SOURCE/SITE00_Build_Object_V2.blend');
const manifest = join(FIXTURE, '05_DOCUMENTATION/module-manifest.json');
if (!existsSync(blend) || !existsSync(manifest)) {
  console.error('Extract incomplete: blend or module-manifest missing');
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, incomingCopy, fixture: FIXTURE, sha256: sha }, null, 2));
