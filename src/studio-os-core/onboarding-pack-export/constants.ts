/**
 * Unified Onboarding Pack export constants.
 * Keep in sync with api/_lib/onboardingPackConstants.ts
 */

export const ONBOARDING_PACK_VERSION = '1.0.0';

export const ONBOARDING_PACK_DOWNLOAD_BASE = '/downloads/onboarding-packs';

export const ONBOARDING_PACK_PERMANENT_LATEST_PATH = '/onboarding/latest';

export const ONBOARDING_PACK_PUBLIC_HUB_PATH = '/onboarding';

export const ONBOARDING_PACK_PUBLIC_RELEASE_PATH = '/onboarding/release.json';

export const UNIFIED_ONBOARDING_PROMPT = `I uploaded the Studio OS Unified Onboarding Pack (latest validated release).

Download: https://fsbw.vercel.app/onboarding/latest

Follow START_HERE.md exactly:

1. Read every file in MASTER_MANIFEST.md order — completely, not skimmed
2. Read ONBOARDING_GUIDE.md for source-of-truth hierarchy and fact classification
3. Do NOT stop after inspecting archive contents
4. Do NOT produce intermediate summaries
5. Do NOT begin implementation, sprints, or architecture changes
6. Use ONBOARDING_REPORT_TEMPLATE.md as the required structure — populate every section in your own words based on what you read. Do not copy blank instructional text as answers.
7. Generate ONE final onboarding report for the entire pack
8. Stop and wait for my approval before contributing`;

export function versionedOnboardingPackZipFileName(version: string): string {
  return `StudioOS_OnboardingPack_v${version}.zip`;
}
