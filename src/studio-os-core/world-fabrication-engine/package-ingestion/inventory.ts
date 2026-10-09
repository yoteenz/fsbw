import { createHash } from 'node:crypto';
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { PackageFileInventoryEntry, PackageFileRole, PackageInventory } from './types';

const FULL_REVIEW_PACKAGE_PATHS = [
  '02_EXPORTS/SITE00_Build_Object_V2_High.glb',
  '02_EXPORTS/SITE00_Build_Object_V2_DCC.fbx',
  '03_RENDERS/',
  '04_COMPARISONS/',
  '01_SOURCE/serve-viewer.cjs',
  '01_SOURCE/validate_v2.py',
];

function guessMime(path: string): string {
  if (path.endsWith('.glb')) return 'model/gltf-binary';
  if (path.endsWith('.fbx')) return 'application/octet-stream';
  if (path.endsWith('.blend')) return 'application/x-blender';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.md')) return 'text/markdown';
  if (path.endsWith('.py')) return 'text/x-python';
  return 'application/octet-stream';
}

function classifyRole(relativePath: string): PackageFileRole {
  const p = relativePath.replace(/\\/g, '/');
  if (p.endsWith('.blend')) return 'SOURCE_BLEND';
  if (p.includes('02_EXPORTS/') && p.endsWith('_Web.glb')) return 'RUNTIME_GLB';
  if (p.includes('02_EXPORTS/') && p.endsWith('_High.glb')) return 'RUNTIME_GLB_HIGH';
  if (p.includes('02_EXPORTS/') && p.endsWith('.fbx')) return 'RUNTIME_FBX';
  if (p.includes('01_SOURCE/') && p.endsWith('.py')) return 'SOURCE_SCRIPT';
  if (p.includes('materials/') && p.endsWith('.png')) return 'SOURCE_TEXTURE';
  if (p === '05_DOCUMENTATION/export-validation-report.json') return 'VALIDATION_REPORT';
  if (p === '05_DOCUMENTATION/module-manifest.json') return 'MODULE_MANIFEST';
  if (p === '05_DOCUMENTATION/material-manifest.json') return 'MATERIAL_MANIFEST';
  if (p === '05_DOCUMENTATION/version-manifest.json') return 'VERSION_MANIFEST';
  if (p.startsWith('05_DOCUMENTATION/')) return 'DOCUMENTATION';
  if (p.startsWith('03_RENDERS/')) return 'RENDER_EVIDENCE';
  if (p.startsWith('04_COMPARISONS/')) return 'COMPARISON';
  if (p.endsWith('fabrication-parameters.json') || p.endsWith('camera-match.json')) return 'SOURCE_CONFIG';
  return 'UNKNOWN';
}

function assetTier(role: PackageFileRole): PackageFileInventoryEntry['assetTier'] {
  if (role === 'SOURCE_BLEND' || role === 'SOURCE_SCRIPT' || role === 'SOURCE_TEXTURE' || role === 'SOURCE_CONFIG') {
    return 'SOURCE';
  }
  if (role === 'RUNTIME_GLB' || role === 'RUNTIME_GLB_HIGH' || role === 'RUNTIME_FBX') return 'DERIVED';
  if (role === 'VALIDATION_REPORT' || role === 'RENDER_EVIDENCE' || role === 'COMPARISON') return 'EVIDENCE';
  return 'DOCUMENTATION';
}

function walkFiles(root: string, dir: string, acc: string[]): void {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) walkFiles(root, full, acc);
    else if (!name.name.startsWith('.')) acc.push(relative(root, full));
  }
}

export function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function inventoryPackageDirectory(
  packageRoot: string,
  options?: { sourceArchivePath?: string; inventoryId?: string }
): PackageInventory {
  const files: PackageFileInventoryEntry[] = [];
  const paths: string[] = [];
  walkFiles(packageRoot, packageRoot, paths);

  let totalBytes = 0;
  for (const rel of paths.sort()) {
    const abs = join(packageRoot, rel);
    const st = statSync(abs);
    totalBytes += st.size;
    const role = classifyRole(rel);
    files.push({
      relativePath: rel.replace(/\\/g, '/'),
      bytes: st.size,
      sha256: sha256File(abs),
      mimeGuess: guessMime(rel),
      role,
      assetTier: assetTier(role),
      dependencies: [],
      productionVersion: 'V2',
    });
  }

  const present = new Set(files.map((f) => f.relativePath));
  const missingFromFullReviewPackage: string[] = [];
  for (const expected of FULL_REVIEW_PACKAGE_PATHS) {
    if (expected.endsWith('/')) {
      const prefix = expected.slice(0, -1);
      if (!files.some((f) => f.relativePath.startsWith(prefix + '/'))) {
        missingFromFullReviewPackage.push(expected + '*');
      }
    } else if (!present.has(expected)) {
      missingFromFullReviewPackage.push(expected);
    }
  }

  const warnings: string[] = [];
  if (missingFromFullReviewPackage.length > 0) {
    warnings.push(
      `Fixture appears to be a reduced archive (missing ${missingFromFullReviewPackage.length} paths from full review package README)`
    );
  }

  let sourceArchiveSha256: string | undefined;
  if (options?.sourceArchivePath) {
    sourceArchiveSha256 = sha256File(options.sourceArchivePath);
  }

  return {
    inventoryId: options?.inventoryId ?? `inv-${Date.now()}`,
    packageRoot,
    sourceArchivePath: options?.sourceArchivePath,
    sourceArchiveSha256,
    extractedAt: new Date().toISOString(),
    fileCount: files.length,
    totalBytes,
    files,
    missingFromFullReviewPackage,
    warnings,
  };
}
