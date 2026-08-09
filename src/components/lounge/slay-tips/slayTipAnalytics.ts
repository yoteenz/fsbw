type SlayTipAnalyticsEvent =
  | 'slay_tip_opened'
  | 'slay_tip_unlock_prompt_viewed'
  | 'slay_tip_redeemed'
  | 'slay_tip_page_viewed'
  | 'slay_tip_completed'
  | 'slay_tip_related_psa_clicked'
  | 'psa_related_slay_tip_clicked';

export type SlayTipAnalyticsPayload = {
  tipId: string;
  pageId?: string;
  pageIndex?: number;
  relatedPsaEpisodeId?: string;
  [key: string]: unknown;
};

const listeners = new Set<(event: SlayTipAnalyticsEvent, payload: SlayTipAnalyticsPayload) => void>();

export function onSlayTipAnalytics(
  fn: (event: SlayTipAnalyticsEvent, payload: SlayTipAnalyticsPayload) => void
): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function trackSlayTipEvent(
  event: SlayTipAnalyticsEvent,
  payload: SlayTipAnalyticsPayload
): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[Slay Tip]', event, payload);
  }
  listeners.forEach((fn) => {
    try {
      fn(event, payload);
    } catch {
      /* ignore */
    }
  });
}
