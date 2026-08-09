type PsaTodayAnalyticsEvent =
  | 'psa_preview_started'
  | 'psa_preview_completed'
  | 'psa_slay_ticket_prompt_viewed'
  | 'psa_slay_ticket_redeemed'
  | 'psa_class_kit_opened'
  | 'psa_tool_clicked'
  | 'psa_full_kit_clicked'
  | 'psa_camera_b_started'
  | 'psa_episode_completed'
  | 'psa_saved'
  | 'psa_entitlement_created'
  | 'psa_watch_session_started'
  | 'psa_watch_threshold_progress'
  | 'psa_watch_consumed'
  | 'psa_watch_session_ended'
  | 'psa_watch_limit_reached'
  | 'psa_access_expired'
  | 'psa_episode_reredemption_started'
  | 'psa_episode_reredemed'
  | 'psa_related_slay_tip_clicked'
  | 'psa_unit_context_selected'
  | 'psa_unit_context_changed'
  | 'psa_chapter_started'
  | 'psa_chapter_completed'
  | 'psa_unit_specific_insert_viewed';

export type PsaTodayAnalyticsPayload = {
  episodeId: string;
  chapterId?: string;
  selectedEducationUnitId?: string;
  demonstrationUnitId?: string;
  unitContextSource?: string;
  generalMode?: boolean;
  mediaSource?: string;
  toolId?: string;
  destination?: 'fs' | 'amazon';
  [key: string]: unknown;
};

const listeners = new Set<(event: PsaTodayAnalyticsEvent, payload: PsaTodayAnalyticsPayload) => void>();

export function onPsaTodayAnalytics(
  fn: (event: PsaTodayAnalyticsEvent, payload: PsaTodayAnalyticsPayload) => void
): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function trackPsaTodayEvent(
  event: PsaTodayAnalyticsEvent,
  payload: PsaTodayAnalyticsPayload
): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[PSA Today]', event, payload);
  }
  listeners.forEach((fn) => {
    try {
      fn(event, payload);
    } catch {
      /* ignore listener errors */
    }
  });
}
