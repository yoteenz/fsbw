/**
 * AI Context Capsule™ export constants — API-safe (no src/ imports).
 * Keep in sync with src/studio-os-core/context-capsule-export/constants.ts
 */

export const CONTEXT_CAPSULE_EXPORTS_CONFIG_KEY = 'studioOsContextCapsuleExports_v1';

/** Fixed capsule folder at repo root — included via vercel.json includeFiles. */
export const CONTEXT_CAPSULE_FOLDER_NAME = 'StudioOS_ContextCapsule_v0.1';

export const CONTEXT_CAPSULE_DOWNLOAD_BASE = '/downloads/context-capsules';

export const CONTEXT_CAPSULE_REQUIRED_FILES = [
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
] as const;

export type ContextCapsuleValidationCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
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
};
