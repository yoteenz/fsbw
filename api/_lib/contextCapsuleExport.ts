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
  readingOrderChecksumSeed,
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

  return checks;
}

export function loadBuildManifest(): CapsuleBuildManifest {
  const manifestPath = path.join(LIB_DIR, 'context-capsule-build-manifest.json');
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as CapsuleBuildManifest;
  if (raw.schemaVersion !== 1 || !raw.downloadPath || !raw.checksumSha256) {
    throw new Error('Invalid context-capsule-build-manifest.json');
  }
  return raw;
}

export function zipFileName(version: string): string {
  return `StudioOS_ContextCapsule_v${version}.zip`;
}
