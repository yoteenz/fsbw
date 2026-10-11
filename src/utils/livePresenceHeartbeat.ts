/**
 * Sends anonymous page_view events with coarse geo for Admin Revenue Live View (globe).
 * Uses ipapi.co once per tab session (cached in sessionStorage), then heartbeats on interval.
 */
import { getOrCreateVisitorId } from './analyticsVisitor';

const SESSION_GEO_KEY = 'livePresenceGeoV1';
const HEARTBEAT_MS = 60_000;

type GeoPayload = {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
  country?: string;
};

function readCachedGeo(): GeoPayload | null {
  try {
    const raw = sessionStorage.getItem(SESSION_GEO_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as GeoPayload;
    if (typeof j.lat !== 'number' || typeof j.lng !== 'number') return null;
    return j;
  } catch {
    return null;
  }
}

async function fetchGeo(): Promise<GeoPayload | null> {
  const cached = readCachedGeo();
  if (cached) return cached;
  try {
    const res = await fetch('https://ipapi.co/json/', { credentials: 'omit' });
    if (!res.ok) return null;
    const j = (await res.json()) as Record<string, unknown>;
    const lat = Number(j.latitude);
    const lng = Number(j.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const payload: GeoPayload = {
      lat,
      lng,
      city: typeof j.city === 'string' ? j.city : undefined,
      region: typeof j.region === 'string' ? j.region : undefined,
      country: typeof j.country_name === 'string' ? j.country_name : undefined,
    };
    try {
      sessionStorage.setItem(SESSION_GEO_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
    return payload;
  } catch {
    return null;
  }
}

async function postPageView(path: string, geo: GeoPayload | null): Promise<void> {
  const visitorId = getOrCreateVisitorId();
  if (!visitorId || visitorId.length < 8) return;

  const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
  const url = base ? `${base}/api/analytics/event` : '/api/analytics/event';
  try {
    let userEmail: string | undefined;
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const u = JSON.parse(raw) as { email?: string };
        if (u?.email && String(u.email).includes('@')) userEmail = String(u.email).trim();
      }
    } catch {
      // ignore
    }
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        eventType: 'page_view',
        path: path.slice(0, 512),
        userEmail: userEmail ?? undefined,
        meta: geo
          ? {
              lat: geo.lat,
              lng: geo.lng,
              city: geo.city,
              region: geo.region,
              country: geo.country,
            }
          : {},
      }),
    });
  } catch {
    // non-fatal
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;
let started = false;
let visibilityResumeTimer: ReturnType<typeof setTimeout> | null = null;
let tickInFlight = false;

function shouldSendLivePresenceHeartbeat(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname || '';
  /** Admin sessions do not need storefront page_view heartbeats (globe reads all visitors). */
  if (path.startsWith('/admin')) return false;
  return true;
}

function clearHeartbeatInterval(): void {
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function scheduleHeartbeatInterval(tick: () => Promise<void>): void {
  clearHeartbeatInterval();
  intervalId = setInterval(() => {
    void tick();
  }, HEARTBEAT_MS);
}

/** Call once on app load (non-admin routes still contribute to "visitors" when browsing the storefront). */
export function startLivePresenceHeartbeat(): void {
  if (typeof window === 'undefined' || started) return;
  started = true;

  const tick = async () => {
    if (!shouldSendLivePresenceHeartbeat()) return;
    if (tickInFlight) return;
    tickInFlight = true;
    try {
      const geo = await fetchGeo();
      await postPageView(window.location.pathname + window.location.search, geo);
    } finally {
      tickInFlight = false;
    }
  };

  void tick();
  scheduleHeartbeatInterval(tick);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      clearHeartbeatInterval();
      if (visibilityResumeTimer != null) clearTimeout(visibilityResumeTimer);
      return;
    }
    if (visibilityResumeTimer != null) clearTimeout(visibilityResumeTimer);
    visibilityResumeTimer = setTimeout(() => {
      void tick();
      scheduleHeartbeatInterval(tick);
    }, 400);
  });
}

export function stopLivePresenceHeartbeatForTests(): void {
  clearHeartbeatInterval();
  if (visibilityResumeTimer != null) {
    clearTimeout(visibilityResumeTimer);
    visibilityResumeTimer = null;
  }
  started = false;
  tickInFlight = false;
}
