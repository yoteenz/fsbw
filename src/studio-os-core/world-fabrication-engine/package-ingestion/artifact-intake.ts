import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, normalize, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import type { PackageInventory } from './types';
import { inventoryPackageDirectory } from './inventory';

export const WFE_ARTIFACT_INCOMING_DIR =
  process.env.WFE_ARTIFACT_INCOMING_DIR ??
  join(process.cwd(), 'src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-v2/incoming');

export const FULL_V2_PACKAGE_CANONICAL_NAME = 'SITE00_Build_Object_V2_Review_Package.zip';

export type FullPackageIntakeResult =
  | { status: 'FOUND'; archivePath: string; sha256: string; extractDir: string; inventory: PackageInventory }
  | { status: 'MISSING'; expectedPaths: string[]; intakeInstructions: string }
  | { status: 'INVALID'; error: string };

function sha256File(path: string): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash('sha256');
    createReadStream(path)
      .on('data', (d) => hash.update(d))
      .on('end', () => resolvePromise(hash.digest('hex')))
      .on('error', reject);
  });
}

/** Safe extract — rejects zip-slip paths. Requires `unzip` on PATH. */
export function safeExtractZip(archivePath: string, destDir: string): void {
  mkdirSync(destDir, { recursive: true });
  const destRoot = resolve(destDir) + '/';
  const listing = execSync(`unzip -Z1 "${archivePath}"`, { encoding: 'utf8' });
  for (const entry of listing.split('\n').filter(Boolean)) {
    const normalized = normalize(entry).replace(/^(\.\.(\/|\\|$))+/, '');
    const target = resolve(destDir, normalized);
    if (!target.startsWith(destRoot)) {
      throw new Error(`Zip slip blocked: ${entry}`);
    }
  }
  execSync(`unzip -o "${archivePath}" -d "${destDir}"`, { stdio: 'pipe' });
}

export async function resolveFullV2ReviewPackage(): Promise<FullPackageIntakeResult> {
  const candidates = [
    join(WFE_ARTIFACT_INCOMING_DIR, FULL_V2_PACKAGE_CANONICAL_NAME),
    process.env.WFE_FULL_V2_PACKAGE_PATH,
    '/home/ubuntu/.cursor/projects/workspace/uploads/SITE00_Build_Object_V2_Review_Package.zip',
  ].filter(Boolean) as string[];

  for (const archivePath of candidates) {
    if (existsSync(archivePath)) {
      const sha256 = await sha256File(archivePath);
      const extractDir = join(WFE_ARTIFACT_INCOMING_DIR, 'extracted-full-v2');
      safeExtractZip(archivePath, extractDir);
      const inventory = inventoryPackageDirectory(extractDir, {
        sourceArchivePath: archivePath,
        inventoryId: 'full-v2-review-package',
      });
      const hasHigh = inventory.files.some((f) => f.relativePath.includes('_High.glb'));
      const hasFbx = inventory.files.some((f) => f.relativePath.endsWith('.fbx'));
      if (!hasHigh || !hasFbx) {
        return {
          status: 'INVALID',
          error: 'Archive present but missing expected High GLB or FBX — not full review package',
        };
      }
      return { status: 'FOUND', archivePath, sha256, extractDir, inventory };
    }
  }

  return {
    status: 'MISSING',
    expectedPaths: candidates,
    intakeInstructions: `Upload ${FULL_V2_PACKAGE_CANONICAL_NAME} to ${WFE_ARTIFACT_INCOMING_DIR} or set WFE_FULL_V2_PACKAGE_PATH (no chat attachment size limit on internal path).`,
  };
}

export function writeMissingFullPackageReport(reportPath: string, result: Extract<FullPackageIntakeResult, { status: 'MISSING' }>): void {
  mkdirSync(join(reportPath, '..'), { recursive: true });
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        fullPackage: FULL_V2_PACKAGE_CANONICAL_NAME,
        status: 'MISSING',
        searched: result.expectedPaths,
        intakeInstructions: result.intakeInstructions,
        reducedFixtureAvailable: true,
      },
      null,
      2
    )
  );
}
