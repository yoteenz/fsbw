import type { CONCIERGE_LIVING_STATUSES } from './constants';

export type ConciergeLivingStatus = (typeof CONCIERGE_LIVING_STATUSES)[number];
export type TimePhase = 'morning' | 'afternoon' | 'evening' | 'night';

export type OrganizationalMoment = {
  id: string;
  message: string;
  category: 'publishing' | 'render' | 'campaign' | 'executive' | 'knowledge' | 'revenue' | 'relationship' | 'insight';
  quiet: true;
};

export type MorningArrivalUpdate = {
  headline: string;
  items: string[];
};

export type LivingPresenceStore = {
  version: string;
  lastUpdatedAt: string;
  lastVisitAt: string | null;
  morningArrivalShownSession: boolean;
  dismissedMomentIds: string[];
  philosophy: string[];
};
