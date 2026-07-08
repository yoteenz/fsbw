import type { CertificationUnlock } from '../certifications/schema';

export type ExchangeCreditBalance = {
  citizenId: string;
  organizationId: string;
  balance: number;
  updatedAt: string;
};

export type RewardGrant = {
  grantId: string;
  licenseId: string;
  rewardKind: 'mentor-points' | 'exchange-credits' | 'hero-object' | 'expansion-discount' | 'unlock';
  label: string;
  value: number | string;
  grantedAt: string;
};

export type CertificationRewardBundle = {
  certificationId: string;
  unlocks: CertificationUnlock[];
  exchangeCredits?: number;
  mentorPoints?: number;
  heroObjectIds?: string[];
};
