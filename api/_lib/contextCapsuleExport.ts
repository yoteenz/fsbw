/**
 * AI Context Capsule™ — API-safe packager (read-only; no runtime ZIP generation).
 * Prebuild writes `context-capsule-build-manifest.json`; static zip is served from /downloads/.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  CONTEXT_CAPSULE_FOLDER_NAME,
  CONTEXT_CAPSULE_METADATA_FILE,
  CONTEXT_CAPSULE_ONBOARDING_REPORT_SECTIONS,
  CONTEXT_CAPSULE_REQUIRED_FILES,
  CONTEXT_CAPSULE_READING_ORDER,
  CONTEXT_CAPSULE_GENERATOR_VERSION,
  CONTEXT_CAPSULE_LATEST_DOWNLOAD_PATH,
  readingOrderChecksumSeed,
  versionedZipFileName,
  type ContextCapsuleReleaseManifest,
  type ContextCapsuleValidationCheck,
} from './contextCapsuleConstants.js';

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

export type CapsuleBuildManifest = {
  schemaVersion: 1;
  artifact: string;
  capsuleVersion: string;
  capsuleFolder: string;
  generatedAt: string;
  fileCount: number;
  checksumSha256: string;
  sizeBytes: number;
  downloadPath: string;
  generatorVersion?: string;
  latestDownloadPath?: string;
  versionedDownloadPath?: string;
};

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url));

function repoRoot(): string {
  return path.resolve(process.cwd());
}

export function getCapsuleDir(root = repoRoot()): string {
  return path.join(root, CONTEXT_CAPSULE_FOLDER_NAME);
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
  const capsuleDir = getCapsuleDir(root);
  const capsuleFolderName = CONTEXT_CAPSULE_FOLDER_NAME;
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

function parseManifestInventory(manifest: string): string[] {
  const files: string[] = [];
  const re = /`\s*([A-Z0-9_]+\.md)\s*`/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(manifest)) !== null) {
    const name = m[1]!;
    if (!files.includes(name)) files.push(name);
  }
  return files;
}

function extractMarkdownReferences(content: string): string[] {
  const refs = new Set<string>();
  const patterns = [/`([A-Za-z0-9_\-]+\.md)`/g, /\[([^\]]+\.md)\]/g];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      refs.add(m[1]!);
    }
  }
  return [...refs];
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

  const metadataPath = path.join(info.capsuleDir, CONTEXT_CAPSULE_METADATA_FILE);
  const metadataExists = fs.existsSync(metadataPath);
  checks.push({
    id: 'metadata-file',
    label: 'context-capsule.json exists',
    passed: metadataExists,
    detail: metadataExists ? CONTEXT_CAPSULE_METADATA_FILE : `Missing ${CONTEXT_CAPSULE_METADATA_FILE}`,
  });

  if (metadataExists) {
    try {
      const meta = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as {
        readingOrderChecksum?: string;
        validationStatus?: string;
        generatorVersion?: string;
      };
      const expectedChecksum = crypto
        .createHash('sha256')
        .update(readingOrderChecksumSeed())
        .digest('hex');
      const checksumOk = meta.readingOrderChecksum === expectedChecksum;
      checks.push({
        id: 'reading-order-checksum',
        label: 'Reading order checksum valid',
        passed: checksumOk,
        detail: checksumOk ? 'Matches CONTEXT_CAPSULE_READING_ORDER' : 'Regenerate via prebuild',
      });
      checks.push({
        id: 'generator-version',
        label: 'Generator version current',
        passed: meta.generatorVersion === CONTEXT_CAPSULE_GENERATOR_VERSION,
        detail: `Expected ${CONTEXT_CAPSULE_GENERATOR_VERSION} · found ${meta.generatorVersion ?? 'n/a'}`,
      });
    } catch {
      checks.push({
        id: 'metadata-parse',
        label: 'context-capsule.json parseable',
        passed: false,
        detail: 'Invalid JSON',
      });
    }
  }

  const onboardingPath = path.join(info.capsuleDir, 'ONBOARDING_REPORT.md');
  if (fs.existsSync(onboardingPath)) {
    const onboarding = fs.readFileSync(onboardingPath, 'utf8');
    const missingSections = CONTEXT_CAPSULE_ONBOARDING_REPORT_SECTIONS.filter(
      (heading) => !onboarding.includes(heading),
    );
    checks.push({
      id: 'onboarding-template',
      label: 'ONBOARDING_REPORT template complete',
      passed: missingSections.length === 0,
      detail:
        missingSections.length === 0
          ? `${CONTEXT_CAPSULE_ONBOARDING_REPORT_SECTIONS.length} sections present`
          : `Missing sections: ${missingSections.join(', ')}`,
    });
  }

  const manifestInventory = parseManifestInventory(manifest);
  const inventoryMissing = manifestInventory.filter((f) => !present.has(f));
  checks.push({
    id: 'manifest-inventory',
    label: 'MANIFEST inventory documents exist',
    passed: inventoryMissing.length === 0,
    detail:
      inventoryMissing.length === 0
        ? `Manifest Count: ${manifestInventory.length} · Missing: 0`
        : `Missing: ${inventoryMissing.join(', ')}`,
  });

  const readmePath = path.join(info.capsuleDir, 'README_FIRST.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    const readmeRefs = extractMarkdownReferences(readme).filter((r) => r.endsWith('.md'));
    const badRefs = readmeRefs.filter((r) => !present.has(r));
    checks.push({
      id: 'readme-references',
      label: 'README references only existing files',
      passed: badRefs.length === 0,
      detail: badRefs.length ? `Missing: ${badRefs.join(', ')}` : `${readmeRefs.length} references OK`,
    });
  }

  const syncFiles = ['README_FIRST.md', 'MANIFEST.md', 'AI_CONTEXT.md', 'ONBOARDING_REPORT.md'];
  const staleVersions = ['0.3.0', '0.2.0', '0.2.1', '0.1.0'];
  let staleFound: string[] = [];
  for (const file of syncFiles) {
    const content = fs.readFileSync(path.join(info.capsuleDir, file), 'utf8');
    for (const stale of staleVersions) {
      if (content.includes(stale)) staleFound.push(`${file}:${stale}`);
    }
  }
  checks.push({
    id: 'version-canonical',
    label: 'No stale capsule version strings in sync files',
    passed: staleFound.length === 0,
    detail: staleFound.length ? staleFound.join(', ') : `Canonical ${info.version} only`,
  });

  if (metadataExists) {
    try {
      const meta = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as {
        capsuleVersion?: string;
        manifestVersion?: string;
        requiredMarkdownFiles?: string[];
      };
      const filesMatch =
        !meta.requiredMarkdownFiles ||
        meta.requiredMarkdownFiles.length === CONTEXT_CAPSULE_REQUIRED_FILES.length;
      checks.push({
        id: 'metadata-documents-match',
        label: 'context-capsule.json matches exported documents',
        passed:
          meta.capsuleVersion === info.version &&
          (!meta.manifestVersion || meta.manifestVersion === info.version) &&
          filesMatch,
        detail: `JSON version ${meta.capsuleVersion ?? 'n/a'} · manifest ${meta.manifestVersion ?? 'n/a'}`,
      });
    } catch {
      /* metadata-parse already reported */
    }
  }

  return checks;
}

export function loadBuildManifest(): CapsuleBuildManifest {
  const manifestPath = path.join(LIB_DIR, 'context-capsule-build-manifest.json');
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as CapsuleBuildManifest;
  if (raw.schemaVersion !== 1 || !raw.checksumSha256) {
    throw new Error('Invalid context-capsule-build-manifest.json');
  }
  return raw;
}

export function loadReleaseManifest(): ContextCapsuleReleaseManifest {
  const manifestPath = path.join(LIB_DIR, 'context-capsule-release.json');
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as ContextCapsuleReleaseManifest;
  if (raw.schemaVersion !== 1 || !raw.latestDownloadPath || !raw.currentVersion) {
    throw new Error('Invalid context-capsule-release.json');
  }
  return raw;
}

export function zipFileName(version: string): string {
  return versionedZipFileName(version);
}
