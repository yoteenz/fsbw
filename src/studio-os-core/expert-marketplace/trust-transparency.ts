import { TRUST_DISCLAIMER_LEVELS } from './constants';
import type { ExpertProfile, ExpertTrustLevel } from './types';

export function getTrustDisclaimer(level: ExpertTrustLevel): string {
  return TRUST_DISCLAIMER_LEVELS[level];
}

export function formatTrustBadge(profile: ExpertProfile): string {
  const labels: Record<ExpertTrustLevel, string> = {
    educational: 'EDUCATIONAL GUIDANCE',
    preparation: 'PROFESSIONAL PREPARATION',
    consultation: 'PROFESSIONAL CONSULTATION',
    licensed: 'LICENSED SERVICES · REVIEW REQUIRED',
  };
  return `${labels[profile.trustLevel]} · ${profile.trustDisclaimer}`;
}

export function requiresLicensedReview(profile: ExpertProfile): boolean {
  return profile.trustLevel === 'licensed' || profile.trustLevel === 'consultation';
}
