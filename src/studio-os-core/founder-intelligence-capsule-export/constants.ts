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

export const FOUNDER_INTELLIGENCE_ONBOARDING_NOTE = `Preferred complete handoff: Unified Onboarding Pack — https://fsbw.vercel.app/onboarding/latest

Follow START_HERE.md → MASTER_MANIFEST.md → ONBOARDING_GUIDE.md → ONBOARDING_REPORT_TEMPLATE.md (one report, then wait for approval).

Individual capsules (optional):
1. AI Context — https://fsbw.vercel.app/context/latest
2. Founder Intelligence — https://fsbw.vercel.app/founder-intelligence/latest
3. Studio DNA — only if included in unified pack or downloaded separately`;
