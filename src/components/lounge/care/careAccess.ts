import type { CareGuide, CarePurchaseProfile, ResolvedPsaSeasonAccess } from '../../../content/education/types';
import type { ResolvedCareContentEntitlement, YourOwnedUnit } from '../../../content/education/care/ownedUnitModel';
import { apiFetch } from '../../../utils/api';

export type CareAccessResponse = {
  purchaseProfiles: CarePurchaseProfile[];
  ownedUnits?: YourOwnedUnit[];
  careGuideEntitlements?: ResolvedCareContentEntitlement[];
  /** @deprecated use careGuideEntitlements */
  careContentEntitlements?: ResolvedCareContentEntitlement[];
  unlockedGuideIds?: string[];
  /** @deprecated use unlockedGuideIds */
  unlockedLessonIds: string[];
  access: Array<{ guideId?: string; lessonId: string; unlocked: boolean; lockedReason?: string }>;
  careMasterySeasonAccess?: ResolvedPsaSeasonAccess;
  guides?: Array<{ id: string; unlocked: boolean }>;
  /** @deprecated use guides */
  lessons?: Array<{ id: string; unlocked: boolean }>;
};

export async function fetchCareAccess(): Promise<CareAccessResponse | null> {
  const res = await apiFetch('/api/care/access');
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return (await res.json()) as CareAccessResponse;
}

export function isCareGuideUnlocked(
  guideId: string,
  unlockedIds: Set<string> | string[]
): boolean {
  const set = unlockedIds instanceof Set ? unlockedIds : new Set(unlockedIds);
  return set.has(guideId);
}

/** @deprecated Use isCareGuideUnlocked */
export const isCareLessonUnlocked = isCareGuideUnlocked;

/** Owner-exclusive Care Guides — not purchasable separately. */
export const CARE_GUIDE_LOCKED_LABEL = 'INCLUDED WITH QUALIFYING HAIR PURCHASE';

/** @deprecated Use CARE_GUIDE_LOCKED_LABEL */
export const CARE_LOCKED_LABEL = CARE_GUIDE_LOCKED_LABEL;

export const CARE_GUIDE_INCLUDED_BADGE = 'INCLUDED WITH YOUR PURCHASE';

export function careIncludesEducationBadge(): string {
  return 'COMPLIMENTARY CARE GUIDES INCLUDED';
}

/** Deep-link path segment for order/product Care routing (future surfaces). */
export function careGuideDeepLink(guide: CareGuide): string {
  return `/lounge?care-guide=${encodeURIComponent(guide.slug)}`;
}

/** @deprecated Use careGuideDeepLink */
export function careLessonDeepLink(lesson: CareGuide): string {
  return careGuideDeepLink(lesson);
}
