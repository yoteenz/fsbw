type CareAnalyticsEvent =
  | 'care_entitlement_resolved'
  | 'care_entitlement_granted'
  | 'care_content_unlocked_from_product'
  | 'care_content_applies_to_unit'
  | 'care_future_content_inherited'
  | 'care_guide_entitlement_resolved'
  | 'care_guide_added_to_library'
  | 'care_guide_opened'
  | 'care_guide_completed'
  | 'care_guide_future_unlock'
  | 'care_guide_related_mastery_clicked'
  | 'care_lesson_started'
  | 'care_lesson_resumed'
  | 'care_lesson_completed'
  | 'care_lesson_opened'
  | 'care_locked_lesson_viewed';

export type CareAnalyticsPayload = {
  contentId?: string;
  guideId?: string;
  lessonId?: string;
  ownedUnitId?: string;
  careRuleId?: string;
  source?: 'qualifying_product' | 'paid_episode' | 'paid_season';
  unitCount?: number;
  guideCount?: number;
  [key: string]: unknown;
};

const listeners = new Set<(event: CareAnalyticsEvent, payload: CareAnalyticsPayload) => void>();

export function onCareAnalytics(
  fn: (event: CareAnalyticsEvent, payload: CareAnalyticsPayload) => void
): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function trackCareEvent(event: CareAnalyticsEvent, payload: CareAnalyticsPayload): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[Care]', event, payload);
  }
  listeners.forEach((fn) => {
    try {
      fn(event, payload);
    } catch {
      /* ignore */
    }
  });
}
