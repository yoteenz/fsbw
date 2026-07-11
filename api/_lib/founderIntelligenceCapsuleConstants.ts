/**
 * Founder Intelligence Capsule™ export constants — API-safe.
 * Keep in sync with src/studio-os-core/founder-intelligence-capsule-export/constants.ts
 */

export const FOUNDER_INTELLIGENCE_CAPSULE_FOLDER_NAME = 'founder-intelligence';

export const FOUNDER_INTELLIGENCE_CAPSULE_GENERATOR_VERSION = '1.0.0';

export const FOUNDER_INTELLIGENCE_CAPSULE_DOWNLOAD_BASE = '/downloads/founder-intelligence-capsules';

export const FOUNDER_INTELLIGENCE_CAPSULE_LATEST_ALIAS = 'latest.zip';

export const FOUNDER_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH = '/founder-intelligence/latest';

export const FOUNDER_INTELLIGENCE_CAPSULE_LATEST_DOWNLOAD_PATH = `${FOUNDER_INTELLIGENCE_CAPSULE_DOWNLOAD_BASE}/${FOUNDER_INTELLIGENCE_CAPSULE_LATEST_ALIAS}`;

export function versionedFounderIntelligenceZipFileName(version: string): string {
  return `Founder_Intelligence_Capsule_v${version}.zip`;
}
