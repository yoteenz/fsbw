/**
 * Founder Intelligence Capsule™ export constants — shared with admin UI.
 * Keep in sync with api/_lib/founderIntelligenceCapsuleConstants.ts
 */

export const FOUNDER_INTELLIGENCE_CAPSULE_FOLDER_NAME = 'founder-intelligence';

export const FOUNDER_INTELLIGENCE_CAPSULE_GENERATOR_VERSION = '1.0.0';

export const FOUNDER_INTELLIGENCE_CAPSULE_DOWNLOAD_BASE = '/downloads/founder-intelligence-capsules';

export const FOUNDER_INTELLIGENCE_CAPSULE_LATEST_ALIAS = 'latest.zip';

export const FOUNDER_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH = '/founder-intelligence/latest';

export const FOUNDER_INTELLIGENCE_CAPSULE_LATEST_DOWNLOAD_PATH = `${FOUNDER_INTELLIGENCE_CAPSULE_DOWNLOAD_BASE}/${FOUNDER_INTELLIGENCE_CAPSULE_LATEST_ALIAS}`;

export const FOUNDER_INTELLIGENCE_CAPSULE_PUBLIC_HUB_PATH = '/founder-intelligence';

export const FOUNDER_INTELLIGENCE_CAPSULE_PUBLIC_RELEASE_PATH = '/founder-intelligence/release.json';

export function versionedFounderIntelligenceZipFileName(version: string): string {
  return `Founder_Intelligence_Capsule_v${version}.zip`;
}

export const FOUNDER_INTELLIGENCE_ONBOARDING_NOTE = `Complete onboarding requires all three capsules:
1. AI Context Capsule — https://fsbw.vercel.app/context/latest
2. Studio DNA Capsule — https://fsbw.vercel.app/downloads/studio-dna-capsules/latest.zip
3. Founder Intelligence Capsule — https://fsbw.vercel.app/founder-intelligence/latest`;
