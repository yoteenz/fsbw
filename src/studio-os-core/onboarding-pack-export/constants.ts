/**
 * Unified Onboarding Pack export constants.
 * Keep in sync with api/_lib/onboardingPackConstants.ts
 */

export const ONBOARDING_PACK_VERSION = '1.2.1';

export const ONBOARDING_PACK_DOWNLOAD_BASE = '/downloads/onboarding-packs';

export const ONBOARDING_PACK_PERMANENT_LATEST_PATH = '/onboarding/latest';

export const ONBOARDING_PACK_PUBLIC_HUB_PATH = '/onboarding';

export const ONBOARDING_PACK_PUBLIC_RELEASE_PATH = '/onboarding/release.json';

export const UNIFIED_ONBOARDING_PROMPT = `I uploaded the Studio OS Unified Onboarding Pack (latest validated release).

Download: https://fsbw.vercel.app/onboarding/latest

Follow START_HERE.md exactly:

1. Validate pack structure using onboarding-state.json and companion index files (onboarding-index.json, coverage-map.json, cross-capsule-map.json, topic-index.json, source-of-truth-map.json)
2. Read every file in MASTER_MANIFEST.md order — completely, not skimmed
3. Order: AI Context → Founder Intelligence → Studio DNA (if included) → Collaboration Intelligence → CURRENT_HANDOFF
4. Read ONBOARDING_GUIDE.md for source-of-truth hierarchy and fact classification
5. Do NOT stop after inspecting archive contents
6. Do NOT produce intermediate summaries
7. Do NOT begin implementation, sprints, or architecture changes
8. Use ONBOARDING_REPORT_TEMPLATE.md as the required structure — populate every section in your own words
9. Generate ONE final onboarding report for the entire pack
10. Cite which capsule informed each major understanding area
11. Stop and wait for my approval before contributing`;

export function versionedOnboardingPackZipFileName(version: string): string {
  return `StudioOS_OnboardingPack_v${version}.zip`;
}
