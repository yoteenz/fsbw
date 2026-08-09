type EducationHierarchyEvent =
  | 'season_pass_acquired'
  | 'episode_announced'
  | 'episode_preview_available'
  | 'episode_released'
  | 'season_pass_episode_unlocked'
  | 'education_season_completed'
  | 'education_certification_earned'
  | 'education_certification_reveal_viewed'
  | 'education_certification_opened'
  | 'education_certification_rewards_room_clicked'
  | 'collectibles_gallery_opened'
  | 'collectible_opened'
  | 'collectible_filter_changed'
  | 'season_certification_progress_viewed'
  | 'psa_season_access_granted'
  | 'psa_season_purchase_blocked_already_entitled'
  | 'psa_product_entitlement_resolved'
  | 'psa_existing_access_preserved';

export type EducationHierarchyPayload = {
  masteryId?: string;
  seasonId?: string;
  episodeId?: string;
  [key: string]: unknown;
};

const listeners = new Set<(event: EducationHierarchyEvent, payload: EducationHierarchyPayload) => void>();

export function trackEducationHierarchyEvent(
  event: EducationHierarchyEvent,
  payload: EducationHierarchyPayload = {}
): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[EducationHierarchy]', event, payload);
  }
  listeners.forEach((fn) => {
    try {
      fn(event, payload);
    } catch {
      /* ignore */
    }
  });
}
