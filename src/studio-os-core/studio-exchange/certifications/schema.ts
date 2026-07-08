import type { CareerWorldId } from '../../career-worlds/types';

export type CertificationUnlockKind =
  | 'district'
  | 'business'
  | 'client-tier'
  | 'mentorship'
  | 'competition'
  | 'teaching-right'
  | 'exchange-discount'
  | 'hero-object'
  | 'industry-event'
  | 'advanced-mentor';

export type CertificationUnlock = {
  kind: CertificationUnlockKind;
  targetId: string;
  label: string;
};

export type ExchangeCertificationDefinition = {
  id: string;
  careerWorldId: CareerWorldId;
  displayName: string;
  ceremonyTemplateId: string;
  requiredProgressPercent: number;
  unlocks: CertificationUnlock[];
  professionalMemoryTopicIds: string[];
};

export type CertificationProgressRecord = {
  certificationId: string;
  progressPercent: number;
  status: 'locked' | 'in-progress' | 'ready-for-ceremony' | 'earned';
  earnedAt?: string;
  ceremonyId?: string;
};
