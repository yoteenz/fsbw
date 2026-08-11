type LoungeEngagementAnalyticsEvent =
  | 'lounge_content_view_qualified'
  | 'lounge_content_helpful_added'
  | 'lounge_content_helpful_removed'
  | 'lounge_discussion_opened'
  | 'lounge_comment_created'
  | 'lounge_comment_replied'
  | 'lounge_content_saved';

export type LoungeEngagementAnalyticsPayload = {
  contentType: string;
  contentId: string;
  contentTitle?: string;
  [key: string]: unknown;
};

const listeners = new Set<
  (event: LoungeEngagementAnalyticsEvent, payload: LoungeEngagementAnalyticsPayload) => void
>();

export function onLoungeEngagementAnalytics(
  fn: (event: LoungeEngagementAnalyticsEvent, payload: LoungeEngagementAnalyticsPayload) => void
): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function trackLoungeEngagementEvent(
  event: LoungeEngagementAnalyticsEvent,
  payload: LoungeEngagementAnalyticsPayload
): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[Lounge Engagement]', event, payload);
  }
  listeners.forEach((fn) => {
    try {
      fn(event, payload);
    } catch {
      /* ignore */
    }
  });
}
