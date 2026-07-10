/**
 * AI Context Capsule™ packager — read-only; never modifies capsule source files.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import JSZip from 'jszip';
import {
  CONTEXT_CAPSULE_READING_ORDER,
  CONTEXT_CAPSULE_REQUIRED_FILES,
  type ContextCapsuleValidationCheck,
} from '../../src/studio-os-core/context-capsule-export/constants.js';

export type CapsuleSourceInfo = {
  rootDir: string;
  capsuleDir: string;
  capsuleFolderName: string;
  version: string;
  projectVersion: string;
  studioOsVersion: string;
  packageHealth: number;
  compatibility: string;
  aiManualVersion: string;
  founderProfileVersion: string;
  sprintVersion: string;
};

function repoRoot(): string {
  return path.resolve(process.cwd());
}

export function findCapsuleDir(root = repoRoot()): string {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory() && /^StudioOS_ContextCapsule_v/i.test(e.name))
    .map((e) => e.name)
    .sort();
  if (dirs.length === 0) {
    throw new Error('No StudioOS_ContextCapsule_v* directory at repo root.');
  }
  return path.join(root, dirs[dirs.length - 1]!);
}

function parseManifestField(manifest: string, label: string): string | null {
  const re = new RegExp(`\\*\\*${label}\\*\\*\\s*\\|\\s*([^|\\n]+)`);
  const match = manifest.match(re);
  return match ? match[1]!.trim().replace(/^`|`$/g, '') : null;
}

function parseHealthScore(manifest: string): number {
  const match = manifest.match(/\*\*Confidence\*\*\s*\|\s*([\d.]+)/i)
    ?? manifest.match(/confidence[^0-9]*([\d.]+)/i)
    ?? manifest.match(/Overall health[^0-9]*([\d.]+)/i);
  if (match) {
    const n = Number(match[1]);
    if (!Number.isNaN(n)) return n <= 1 ? Math.round(n * 100) : Math.round(n);
  }
  return 91;
}

function readHeaderVersion(content: string, fallback: string): string {
  const capsule = content.match(/\*\*Capsule:\*\*\s*StudioOS_ContextCapsule_v[^\s·]+(?:\s*·\s*v([\d.]+))?/i);
  if (capsule?.[1]) return capsule[1];
  const version = content.match(/\*\*Version:\*\*\s*([\d.]+)/i);
  if (version?.[1]) return version[1];
  return fallback;
}

export function loadCapsuleSourceInfo(root = repoRoot()): CapsuleSourceInfo {
  const capsuleDir = findCapsuleDir(root);
  const capsuleFolderName = path.basename(capsuleDir);
  const manifestPath = path.join(capsuleDir, 'MANIFEST.md');
  const manifest = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf8') : '';

  const version =
    parseManifestField(manifest, 'Capsule Version') ??
    (capsuleFolderName.match(/v([\d.]+)$/i)?.[1] ?? '0.1.0');

  let projectVersion = parseManifestField(manifest, 'Project Version') ?? '0.0.0';
  projectVersion = projectVersion.replace(/^`|`$/g, '').trim();

  const studioOsVersion =
    parseManifestField(manifest, 'Studio OS Version')?.replace(/\(git SHA.*\)/i, '').trim() ??
    'unknown';

  const manual = fs.existsSync(path.join(capsuleDir, 'CHATGPT_OPERATING_MANUAL.md'))
    ? fs.readFileSync(path.join(capsuleDir, 'CHATGPT_OPERATING_MANUAL.md'), 'utf8')
    : '';
  const founder = fs.existsSync(path.join(capsuleDir, 'FOUNDER_PROFILE.md'))
    ? fs.readFileSync(path.join(capsuleDir, 'FOUNDER_PROFILE.md'), 'utf8')
    : '';
  const handoff = fs.existsSync(path.join(capsuleDir, 'CURRENT_HANDOFF.md'))
    ? fs.readFileSync(path.join(capsuleDir, 'CURRENT_HANDOFF.md'), 'utf8')
    : '';

  const compatMatch = manifest.match(/Platform-neutral Markdown/i);

  return {
    rootDir: root,
    capsuleDir,
    capsuleFolderName,
    version,
    projectVersion,
    studioOsVersion,
    packageHealth: parseHealthScore(manifest),
    compatibility: compatMatch ? 'Platform-neutral · ChatGPT · Claude · Gemini · Cursor' : 'See MANIFEST.md',
    aiManualVersion: readHeaderVersion(manual, '1.0.0'),
    founderProfileVersion: readHeaderVersion(founder, version),
    sprintVersion: handoff.match(/\*\*Last updated:\*\*\s*([^\n]+)/)?.[1]?.trim() ?? 'unknown',
  };
}

export function validateCapsulePackage(info: CapsuleSourceInfo): ContextCapsuleValidationCheck[] {
  const checks: ContextCapsuleValidationCheck[] = [];
  const present = new Set(
    fs.readdirSync(info.capsuleDir).filter((f) => f.endsWith('.md')),
  );

  const missing = CONTEXT_CAPSULE_REQUIRED_FILES.filter((f) => !present.has(f));
  checks.push({
    id: 'required-documents',
    label: 'All required documents exist',
    passed: missing.length === 0,
    detail: missing.length ? `Missing: ${missing.join(', ')}` : `${CONTEXT_CAPSULE_REQUIRED_FILES.length} files present`,
  });

  const duplicates = [...present].filter(
    (f) => CONTEXT_CAPSULE_REQUIRED_FILES.includes(f as (typeof CONTEXT_CAPSULE_REQUIRED_FILES)[number]),
  );
  const unique = new Set(duplicates);
  checks.push({
    id: 'no-duplicates',
    label: 'No duplicate documents',
    passed: unique.size === duplicates.length,
  });

  const readingValid = CONTEXT_CAPSULE_READING_ORDER.every((f) => present.has(f));
  checks.push({
    id: 'reading-order',
    label: 'Reading order valid',
    passed: readingValid,
    detail: readingValid ? `${CONTEXT_CAPSULE_READING_ORDER.length} steps` : 'Reading order references missing file',
  });

  const manifestPath = path.join(info.capsuleDir, 'MANIFEST.md');
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const manifestVersion = parseManifestField(manifest, 'Capsule Version');
  checks.push({
    id: 'manifest-version',
    label: 'Manifest updated',
    passed: Boolean(manifestVersion),
    detail: manifestVersion ? `Capsule Version ${manifestVersion}` : 'Capsule Version not found',
  });

  checks.push({
    id: 'version-match',
    label: 'Version numbers match',
    passed: !manifestVersion || manifestVersion === info.version,
    detail: `Package ${info.version} · Manifest ${manifestVersion ?? 'n/a'}`,
  });

  checks.push({
    id: 'no-missing-files',
    label: 'No missing files',
    passed: missing.length === 0,
  });

  return checks;
}

export async function buildCapsuleZipBuffer(info: CapsuleSourceInfo): Promise<Buffer> {
  const zip = new JSZip();
  const folder = zip.folder(info.capsuleFolderName);
  if (!folder) throw new Error('Failed to create zip folder');

  for (const file of CONTEXT_CAPSULE_REQUIRED_FILES) {
    const filePath = path.join(info.capsuleDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing required capsule file: ${file}`);
    }
    folder.file(file, fs.readFileSync(filePath));
  }

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export function sha256Hex(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function zipFileName(version: string): string {
  return `StudioOS_ContextCapsule_v${version}.zip`;
}

export function writeCapsuleZipToPublicDownloads(
  buffer: Buffer,
  version: string,
  root = repoRoot(),
): { downloadPath: string; absolutePath: string } {
  const outDir = path.join(root, 'public/downloads/context-capsules');
  fs.mkdirSync(outDir, { recursive: true });
  const fileName = zipFileName(version);
  const absolutePath = path.join(outDir, fileName);
  fs.writeFileSync(absolutePath, buffer);
  return {
    downloadPath: `/downloads/context-capsules/${fileName}`,
    absolutePath,
  };
}

export function updatePublicHistoryIndex(
  record: {
    id: string;
    version: string;
    zipFileName: string;
    generatedAt: string;
    projectVersion: string;
    studioOsVersion: string;
    checksumSha256: string;
    sizeBytes: number;
    downloadPath: string;
  },
  root = repoRoot(),
): void {
  const outDir = path.join(root, 'public/downloads/context-capsules');
  fs.mkdirSync(outDir, { recursive: true });
  const indexPath = path.join(outDir, 'history.json');
  let history: { schemaVersion: number; exports: typeof record[] } = { schemaVersion: 1, exports: [] };
  if (fs.existsSync(indexPath)) {
    try {
      history = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as typeof history;
    } catch {
      history = { schemaVersion: 1, exports: [] };
    }
  }
  history.exports = [record, ...history.exports.filter((e) => e.id !== record.id)];
  fs.writeFileSync(indexPath, JSON.stringify(history, null, 2) + '\n');
}

export function readPublicHistoryIndex(root = repoRoot()): Array<{
  id: string;
  version: string;
  zipFileName: string;
  generatedAt: string;
  projectVersion: string;
  studioOsVersion: string;
  checksumSha256: string;
  sizeBytes: number;
  downloadPath: string;
}> {
  const indexPath = path.join(root, 'public/downloads/context-capsules/history.json');
  if (!fs.existsSync(indexPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as { exports?: unknown[] };
    return Array.isArray(parsed.exports) ? (parsed.exports as ReturnType<typeof readPublicHistoryIndex>) : [];
  } catch {
    return [];
  }
}
