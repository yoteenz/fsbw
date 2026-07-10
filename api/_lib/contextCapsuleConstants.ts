/**
 * AI Context Capsule™ export constants — API-safe (no src/ imports).
 * Keep in sync with src/studio-os-core/context-capsule-export/constants.ts
 */

export const CONTEXT_CAPSULE_EXPORTS_CONFIG_KEY = 'studioOsContextCapsuleExports_v1';

/** Fixed capsule folder at repo root — included via vercel.json includeFiles. */
export const CONTEXT_CAPSULE_FOLDER_NAME = 'StudioOS_ContextCapsule_v0.1';

export const CONTEXT_CAPSULE_GENERATOR_VERSION = '0.3.0';

export const CONTEXT_CAPSULE_METADATA_FILE = 'context-capsule.json';

export const CONTEXT_CAPSULE_RELEASE_MANIFEST_FILE = 'release.json';

export const CONTEXT_CAPSULE_LATEST_ALIAS = 'latest.zip';

export const CONTEXT_CAPSULE_DOWNLOAD_BASE = '/downloads/context-capsules';

export const CONTEXT_CAPSULE_LATEST_DOWNLOAD_PATH = `${CONTEXT_CAPSULE_DOWNLOAD_BASE}/${CONTEXT_CAPSULE_LATEST_ALIAS}`;

export const CONTEXT_CAPSULE_SUPPORTED_FORMATS = ['zip'] as const;

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
  checksumSha256: string;
  generatorVersion: string;
  artifact: string;
  latestAlias: string;
  latestDownloadPath: string;
  versionedDownloadPath: string;
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
  validationStatus: 'pass' | 'fail' | 'unknown';
  gitCommit: string | null;
  previousVersion: string | null;
  releaseHistory: ContextCapsuleReleaseEntry[];
};

export function readingOrderChecksumSeed(): string {
  return CONTEXT_CAPSULE_READING_ORDER.join('\n');
}

export function versionedZipFileName(version: string): string {
  return `StudioOS_ContextCapsule_v${version}.zip`;
}
