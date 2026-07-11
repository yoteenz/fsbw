/**
 * AI Context Capsule™ export constants — packaging only (does not modify capsule content).
 * API mirror: api/_lib/contextCapsuleConstants.ts (keep in sync).
 */

export const CONTEXT_CAPSULE_EXPORTS_CONFIG_KEY = 'studioOsContextCapsuleExports_v1';

export const CONTEXT_CAPSULE_GENERATOR_VERSION = '0.3.1';

export const CONTEXT_CAPSULE_METADATA_FILE = 'context-capsule.json';

export const CONTEXT_CAPSULE_RELEASE_MANIFEST_FILE = 'release.json';

/** Stable alias file — synced on each validated prebuild. */
export const CONTEXT_CAPSULE_LATEST_ALIAS = 'latest.zip';

export const CONTEXT_CAPSULE_DOWNLOAD_BASE = '/downloads/context-capsules';

export const CONTEXT_CAPSULE_ARCHIVE_SUBPATH = 'archive';

/** Permanent URL — never changes; always serves newest validated capsule (via Vercel rewrite). */
export const CONTEXT_CAPSULE_PERMANENT_LATEST_PATH = '/context/latest';

/** Legacy alias — same underlying file as permanent latest. */
export const CONTEXT_CAPSULE_LATEST_DOWNLOAD_PATH = `${CONTEXT_CAPSULE_DOWNLOAD_BASE}/${CONTEXT_CAPSULE_LATEST_ALIAS}`;

export const CONTEXT_CAPSULE_RELEASE_MANIFEST_PATH = `${CONTEXT_CAPSULE_DOWNLOAD_BASE}/${CONTEXT_CAPSULE_RELEASE_MANIFEST_FILE}`;

/** Public download hub + release.json mirror for the founder workflow. */
export const CONTEXT_CAPSULE_PUBLIC_HUB_PATH = '/context';

export const CONTEXT_CAPSULE_PUBLIC_RELEASE_PATH = '/context/release.json';

/** Supported distribution formats (extensible — ZIP is primary today). */
export const CONTEXT_CAPSULE_SUPPORTED_FORMATS = ['zip'] as const;

/** Required markdown files — must exist in capsule folder before export. */
export const CONTEXT_CAPSULE_REQUIRED_FILES = [
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
] as const;

export const CONTEXT_CAPSULE_READING_ORDER = [
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
] as const;

/** Required section headings in ONBOARDING_REPORT.md template (v0.3). */
export const CONTEXT_CAPSULE_ONBOARDING_REPORT_SECTIONS = [
  '# Onboarding Compliance Checklist',
  '# Read Confirmation',
  '# Project Understanding',
  '# Founder Understanding',
  '# Operational Source of Truth',
  '# Canon Verification',
  '# Questions',
  '# Confidence Assessment',
  '# Documentation Review',
  '# Risk Assessment',
  '# Recommended Next Steps',
  '# Waiting For Founder Approval',
] as const;

export const AI_ONBOARDING_PROMPT = `I uploaded the AI Context Capsule (latest validated release).

Download all three onboarding capsules (permanent URLs — always current):
1. Context (WHAT): https://fsbw.vercel.app/context/latest
2. DNA (HOW): https://fsbw.vercel.app/downloads/studio-dna-capsules/latest.zip
3. Founder Intelligence (WHY): https://fsbw.vercel.app/founder-intelligence/latest

Follow README_FIRST.md in the Context Capsule exactly:

1. Read every document in MANIFEST reading order
2. Do not begin solving problems
3. Complete ONBOARDING_REPORT.md exactly — including the Compliance Checklist and Operational Source of Truth sections
4. Distinguish documented facts from inference; state "not documented within the current capsule" when uncertain
5. Wait for my approval before contributing`;

export type ContextCapsuleValidationCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
};

export type ContextCapsuleReleaseEntry = {
  version: string;
  generatedAt: string;
  gitCommit: string;
  checksumSha256: string;
  sizeBytes: number;
  downloadPath: string;
  zipFileName: string;
  validationStatus: 'pass' | 'fail';
};

export type ContextCapsuleReleaseManifest = {
  schemaVersion: 1;
  currentVersion: string;
  previousVersion: string | null;
  generatedAt: string;
  gitCommit: string;
  validationStatus: 'pass' | 'fail';
  documentCount: number;
  manifestDocumentCount?: number;
  checksumSha256: string;
  generatorVersion: string;
  artifact: string;
  latestAlias: string;
  latestDownloadPath: string;
  permanentLatestUrl?: string;
  legacyLatestDownloadPath?: string;
  versionedDownloadPath?: string;
  archiveBasePath?: string;
  packageHealth?: number;
  readyForAiOnboarding?: boolean;
  supportedFormats: readonly string[];
  releaseHistory: ContextCapsuleReleaseEntry[];
};

export type ContextCapsuleExportRecord = {
  id: string;
  version: string;
  zipFileName: string;
  generatedAt: string;
  projectVersion: string;
  studioOsVersion: string;
  documentCount: number;
  checksumSha256: string;
  sizeBytes: number;
  downloadPath: string;
  validationPassed: boolean;
};

export type ContextCapsuleExportsState = {
  schemaVersion: 1;
  exports: ContextCapsuleExportRecord[];
  lastExportId: string | null;
};

export type ContextCapsuleStatus = {
  capsuleVersion: string;
  capsuleFolder: string;
  lastGenerated: string | null;
  projectVersion: string;
  studioOsVersion: string;
  documentCount: number;
  packageHealth: number;
  checksumSha256: string | null;
  generationStatus: 'idle' | 'ready' | 'error';
  compatibility: string;
  aiManualVersion: string;
  founderProfileVersion: string;
  sprintVersion: string;
  validation: ContextCapsuleValidationCheck[];
  currentDownloadPath: string | null;
  currentZipFileName: string | null;
  latestDownloadPath: string;
  permanentLatestUrl?: string;
  legacyLatestDownloadPath?: string;
  archiveBasePath?: string;
  manifestDocumentCount?: number;
  versionedDownloadPath: string;
  validationStatus: 'pass' | 'fail' | 'unknown';
  readyForAiOnboarding?: boolean;
  gitCommit: string | null;
  previousVersion: string | null;
  releaseHistory: ContextCapsuleReleaseEntry[];
};

export function readingOrderChecksum(): string {
  return CONTEXT_CAPSULE_READING_ORDER.join('\n');
}

export function versionedZipFileName(version: string): string {
  return `StudioOS_ContextCapsule_v${version}.zip`;
}
