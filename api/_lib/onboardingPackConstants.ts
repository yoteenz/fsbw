/** Unified Onboarding Pack constants — API-safe */

export const ONBOARDING_PACK_VERSION = '1.2.0';

export const ONBOARDING_PACK_PERMANENT_LATEST_PATH = '/onboarding/latest';

export function versionedOnboardingPackZipFileName(version: string): string {
  return `StudioOS_OnboardingPack_v${version}.zip`;
}
