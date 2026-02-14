/**
 * Social click/follow tracking for admin analytics.
 * Events are stored in localStorage and read by the admin Analytics page.
 */

const STORAGE_KEY = 'socialClickAnalytics';
const MAX_EVENTS = 5000;

export type SocialPlatform = 'instagram' | 'twitter' | 'facebook' | 'tiktok';
export type SocialSource = 'menu' | 'more_ways_to_earn';

export interface SocialClickEvent {
  platform: SocialPlatform;
  source: SocialSource;
  timestamp: number;
  userId?: string;
}

function getStoredEvents(): SocialClickEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredEvents(events: SocialClickEvent[]) {
  try {
    const toStore = events.slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // ignore quota or parse errors
  }
}

/**
 * Record a social link click (menu or more ways to earn).
 * Call this before navigating so the event is stored even if the user leaves.
 */
export function recordSocialClick(platform: SocialPlatform, source: SocialSource): void {
  try {
    let userId: string | undefined;
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        userId = user?.id ?? user?.email ?? undefined;
      }
    } catch {
      // ignore
    }
    const events = getStoredEvents();
    events.push({
      platform,
      source,
      timestamp: Date.now(),
      userId,
    });
    setStoredEvents(events);
  } catch {
    // fail silently so we don't break the link
  }
}

/**
 * Get all social click events for the admin analytics page.
 */
export function getSocialClickEvents(): SocialClickEvent[] {
  return getStoredEvents();
}

/**
 * Get aggregated counts by platform and source for admin display.
 */
export function getSocialAnalyticsSummary(): {
  byPlatform: Record<SocialPlatform, number>;
  bySource: Record<SocialSource, number>;
  byPlatformAndSource: Record<SocialPlatform, Record<SocialSource, number>>;
  total: number;
  recentEvents: SocialClickEvent[];
} {
  const events = getStoredEvents();
  const byPlatform: Record<SocialPlatform, number> = {
    instagram: 0,
    twitter: 0,
    facebook: 0,
    tiktok: 0,
  };
  const bySource: Record<SocialSource, number> = {
    menu: 0,
    more_ways_to_earn: 0,
  };
  const byPlatformAndSource: Record<SocialPlatform, Record<SocialSource, number>> = {
    instagram: { menu: 0, more_ways_to_earn: 0 },
    twitter: { menu: 0, more_ways_to_earn: 0 },
    facebook: { menu: 0, more_ways_to_earn: 0 },
    tiktok: { menu: 0, more_ways_to_earn: 0 },
  };

  for (const e of events) {
    byPlatform[e.platform]++;
    bySource[e.source]++;
    byPlatformAndSource[e.platform][e.source]++;
  }

  const recentEvents = [...events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);

  return {
    byPlatform,
    bySource,
    byPlatformAndSource,
    total: events.length,
    recentEvents,
  };
}
