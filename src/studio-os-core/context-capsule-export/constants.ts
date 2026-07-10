/**
 * AI Context Capsule™ export constants — packaging only (does not modify capsule content).
 * API mirror: api/_lib/contextCapsuleConstants.ts (keep in sync).
 */

export const CONTEXT_CAPSULE_EXPORTS_CONFIG_KEY = 'studioOsContextCapsuleExports_v1';

export const CONTEXT_CAPSULE_GENERATOR_VERSION = '0.2.0';

export const CONTEXT_CAPSULE_METADATA_FILE = 'context-capsule.json';

export const CONTEXT_CAPSULE_DOWNLOAD_BASE = '/downloads/context-capsules';

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

/** Required section headings in ONBOARDING_REPORT.md template (v0.2). */
export const CONTEXT_CAPSULE_ONBOARDING_REPORT_SECTIONS = [
  '# Read Confirmation',
  '# Project Understanding',
  '# Founder Preference Verification',
  '# Canon Verification',
  '# Questions',
  '# Potential Inconsistencies',
  '# Outdated Documentation',
  '# Risk Assessment',
  '# Confidence Assessment',
  '# Recommended Next Steps',
  '# Waiting For Founder Approval',
] as const;

export const AI_ONBOARDING_PROMPT = `I uploaded the AI Context Capsule v0.2.

Follow README_FIRST.md exactly:

1. Read every document in MANIFEST reading order
2. Do not begin solving problems
3. Complete ONBOARDING_REPORT.md exactly as provided — every section, no structure changes
4. Wait for my approval before contributing`;

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

export function readingOrderChecksum(): string {
  return CONTEXT_CAPSULE_READING_ORDER.join('\n');
}
