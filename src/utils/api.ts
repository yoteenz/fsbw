/**
 * API client for backend sync (profile, orders, cart, wishlist).
 * Sends the Supabase session access_token as Bearer so the API can identify the user.
 */

import type { MembershipPaymentRecord } from './membershipPayments';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

/** Same key Supabase client uses for `sb-<projectRef>-auth-token` (see `sessionRestore.ts`). */
function getSupabaseAuthStorageKey(): string | null {
  const url = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  if (!url) return null;
  try {
    const projectRef = new URL(url).hostname.split('.')[0];
    return projectRef ? `sb-${projectRef}-auth-token` : null;
  } catch {
    return null;
  }
}

/** Persisted Supabase session JSON under `sb-*-auth-token` (same shape as `sessionRestore`). */
type SupabaseSessionBlob = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
};

/** Read persisted Supabase session blob (access + refresh) when `getSession()` lags. */
function readSupabaseSessionBlobFromStorage(): SupabaseSessionBlob | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const key = getSupabaseAuthStorageKey();
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SupabaseSessionBlob;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function readAccessTokenFromSupabaseStorage(): string | null {
  const blob = readSupabaseSessionBlobFromStorage();
  const t = typeof blob?.access_token === 'string' ? blob.access_token.trim() : '';
  return t || null;
}

/** JWT exp is seconds since epoch; refresh slightly before expiry so API `getUser` does not reject. */
function isAccessTokenLikelyExpired(token: string, skewSeconds = 90): boolean {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(payload)) as { exp?: number };
    if (typeof json.exp !== 'number') return false;
    return Date.now() / 1000 >= json.exp - skewSeconds;
  } catch {
    return false;
  }
}

/**
 * Ensure the Supabase client has a session when `localStorage` already has `sb-*-auth-token`.
 * `refreshSession()` without args only works if the client already holds a session with `refresh_token`;
 * after a reload / race, that can be missing even though storage is populated — `setSession` fixes it.
 */
async function hydrateSupabaseSessionFromStorageIfNeeded(
  supabase: NonNullable<Awaited<ReturnType<(typeof import('./supabase'))['getSupabase']>>>
): Promise<void> {
  try {
    const blob = readSupabaseSessionBlobFromStorage();
    const access = typeof blob?.access_token === 'string' ? blob.access_token.trim() : '';
    const refresh = typeof blob?.refresh_token === 'string' ? blob.refresh_token.trim() : '';
    if (!access || !refresh) return;

    const { data: { session } } = await supabase.auth.getSession();
    const mem = session?.access_token?.trim();
    if (mem && !isAccessTokenLikelyExpired(mem)) {
      return;
    }
    /** Expired or missing in-memory session — re-hydrate; `setSession` refreshes if access JWT is expired. */
    await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
  } catch {
    /* ignore — caller will fall back to refresh / storage read */
  }
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = (await import('./supabase')).getSupabase();
  if (!supabase) {
    return readAccessTokenFromSupabaseStorage();
  }

  await hydrateSupabaseSessionFromStorageIfNeeded(supabase);

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token && !isAccessTokenLikelyExpired(session.access_token)) {
    return session.access_token;
  }

  const blob = readSupabaseSessionBlobFromStorage();
  if (blob?.refresh_token) {
    try {
      await supabase.auth.refreshSession({ refresh_token: blob.refresh_token });
      const { data: { session: s2 } } = await supabase.auth.getSession();
      if (s2?.access_token) return s2.access_token;
    } catch {
      /* fall through */
    }
  }

  try {
    await supabase.auth.refreshSession();
    const { data: { session: s3 } } = await supabase.auth.getSession();
    if (s3?.access_token) return s3.access_token;
  } catch {
    /* ignore */
  }

  try {
    if (typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true') {
      await hydrateSupabaseSessionFromStorageIfNeeded(supabase);
      const { data: { session: s4 } } = await supabase.auth.getSession();
      if (s4?.access_token) return s4.access_token;
    }
  } catch {
    /* ignore */
  }

  return readAccessTokenFromSupabaseStorage();
}

/** Options for apiFetch; body can be any JSON-serializable value (not limited to RequestInit.body). */
type ApiFetchOptions = Omit<RequestInit, 'body'> & { body?: unknown };

async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const token = await getAccessToken();
  const url = `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const body: BodyInit | null | undefined =
    options.body !== undefined ? JSON.stringify(options.body) : undefined;
  const { body: _omit, ...rest } = options;
  return fetch(url, {
    ...rest,
    headers,
    body,
  });
}

/** Chrome/Safari often surface failed `fetch()` as "Load failed" / "Failed to fetch" with no HTTP body. */
function isLikelyBrowserFetchNetworkError(message: string): boolean {
  return /failed to fetch|load failed|networkrequestfailed|request failed|network error/i.test(message);
}

function rethrowWithNetworkHint(err: unknown, shortLabel: string): never {
  const raw = err instanceof Error ? err.message : String(err);
  if (isLikelyBrowserFetchNetworkError(raw)) {
    throw new Error(
      `${shortLabel}: connection dropped or timed out before the server answered (browsers often show this as "Load failed"). For styling, try regen L, then M, then R one at a time, or set WIG_PREVIEW_FAL_STYLING_RESOLUTION=2K on Vercel so each request finishes sooner.`
    );
  }
  throw err instanceof Error ? err : new Error(String(err));
}

export async function getProfile(): Promise<Record<string, unknown> | null> {
  const res = await apiFetch('/api/profile');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data as Record<string, unknown> | null;
}

export type SyncProfilePayload = {
  profile: Record<string, unknown> | null;
  activeOrders: unknown[];
  pastOrders: unknown[];
  cart: { items: unknown[] };
  wishlist: { items: unknown[] };
};

/** Admin sync using session token (no password). POST /api/admin/sync-profile with Authorization: Bearer <token>. */
export async function syncProfileWithToken(): Promise<SyncProfilePayload | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const base = API_BASE.replace(/\/$/, '');
  const url = base ? `${base}/api/admin/sync-profile` : '/api/admin/sync-profile';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

/** Admin sync without session: POST email + password to /api/admin/sync-profile, returns profile + orders + cart + wishlist. */
export async function syncProfileWithPassword(
  email: string,
  password: string
): Promise<SyncProfilePayload> {
  const base = API_BASE.replace(/\/$/, '');
  const url = base ? `${base}/api/admin/sync-profile` : '/api/admin/sync-profile';
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: (email || '').trim().toLowerCase(), password }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/failed to fetch|load failed|network|request failed/i.test(msg)) {
      throw new Error('Sync request failed. Check your connection and try again.');
    }
    throw err;
  }
  const text = await res.text();
  if (!res.ok) {
    try {
      const json = JSON.parse(text) as { error?: string };
      if (typeof json?.error === 'string' && json.error.trim()) {
        if (res.status === 401) throw new Error('Invalid Supabase password. Use the same password you use to sign in with Supabase.');
        throw new Error(json.error);
      }
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message.includes('Supabase password')) throw parseErr;
    }
    if (res.status === 401) throw new Error('Invalid Supabase password. Use the same password you use to sign in with Supabase.');
    if (res.status === 403) throw new Error('Sync not allowed for this account.');
    if (res.status >= 500) {
      const fallback = text && text.length < 200 ? text : 'Server error during sync. Try again later. Check Vercel function logs for details.';
      throw new Error(fallback);
    }
    throw new Error(text || 'Sync failed.');
  }
  return text ? JSON.parse(text) : {};
}

export async function patchProfile(profile: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await apiFetch('/api/profile', { method: 'PATCH', body: profile });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Record<string, unknown>;
}

/** True when Vercel has Stripe secret + three recurring price ids configured. */
export async function fetchStripeMembershipAvailable(): Promise<boolean> {
  const base = API_BASE.replace(/\/$/, '');
  const url = base ? `${base}/api/stripe/membership-available` : '/api/stripe/membership-available';
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = (await res.json()) as { available?: boolean };
    return Boolean(data?.available);
  } catch {
    return false;
  }
}

/**
 * Starts Stripe Checkout for a premium subscription (3 / 6 / 12 months).
 * Requires Supabase session (Bearer). Redirect URL is returned.
 */
export async function createStripeMembershipCheckoutSession(
  tier: '3months' | '6months' | '12months',
  /** Subscription upgrade checkout (`/checkout/upgrade`) — Stripe return + success handling live there. */
  returnPath = '/checkout/upgrade'
): Promise<
  | { mode: 'checkout'; url: string; sessionId?: string }
  | {
      mode: 'subscription_updated';
      changeType: 'upgrade' | 'downgrade' | 'none';
      message?: string;
      nextBillingAt?: string;
      refundAmountUsd?: number;
    }
> {
  const res = await apiFetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    body: { tier, returnPath },
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string' && j.error.trim()) msg = j.error;
    } catch {
      /* use raw text */
    }
    throw new Error(msg || 'Checkout failed');
  }
  const data = JSON.parse(text) as {
    mode?: string;
    url?: string;
    sessionId?: string;
    changeType?: 'upgrade' | 'downgrade' | 'none';
    message?: string;
    nextBillingAt?: string;
    refundAmountUsd?: number;
  };
  if (data.mode === 'subscription_updated') {
    return {
      mode: 'subscription_updated',
      changeType: data.changeType === 'upgrade' || data.changeType === 'downgrade' ? data.changeType : 'none',
      message: data.message,
      nextBillingAt: data.nextBillingAt,
      refundAmountUsd:
        typeof data.refundAmountUsd === 'number' && Number.isFinite(data.refundAmountUsd)
          ? data.refundAmountUsd
          : undefined,
    };
  }
  if (!data?.url) throw new Error('No checkout URL returned');
  return { mode: 'checkout', url: data.url, sessionId: data.sessionId };
}

/**
 * Product cart PaymentIntent — amount is computed only on the server (`/api/stripe/create-product-payment-intent`).
 * Requires Supabase session. Cart must only contain server-resolvable lines (see `/api/checkout/quote`).
 * Wire Stripe.js `confirmCardPayment(clientSecret)` when you replace the founder card flow.
 */
export async function createProductPaymentIntent(lines: unknown[]): Promise<{
  clientSecret: string | null;
  paymentIntentId: string;
  quote: unknown;
}> {
  const res = await apiFetch('/api/stripe/create-product-payment-intent', {
    method: 'POST',
    body: { lines },
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string' && j.error.trim()) msg = j.error;
    } catch {
      /* use raw */
    }
    throw new Error(msg || 'Payment intent failed');
  }
  const data = JSON.parse(text) as { clientSecret?: string; paymentIntentId?: string; quote?: unknown };
  return {
    clientSecret: data.clientSecret ?? null,
    paymentIntentId: typeof data.paymentIntentId === 'string' ? data.paymentIntentId : '',
    quote: data.quote,
  };
}

/** Admin: list membership charges from Supabase (Stripe webhooks). */
export async function getAdminMembershipPayments(): Promise<MembershipPaymentRecord[]> {
  const res = await apiFetch('/api/admin/membership-payments');
  if (res.status === 403 || res.status === 401) return [];
  const text = await res.text();
  if (!res.ok) return [];
  try {
    const data = JSON.parse(text) as { payments?: MembershipPaymentRecord[] };
    return Array.isArray(data.payments) ? data.payments : [];
  } catch {
    return [];
  }
}

/** Upload a profile image data URL to Supabase Storage and store resulting URL in profile.profile_image. */
export async function uploadProfileImage(imageDataUrl: string): Promise<{ profileImage: string }> {
  const res = await apiFetch('/api/profile-image', {
    method: 'POST',
    body: { imageDataUrl },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { profileImage?: string };
  if (!data.profileImage) throw new Error('Upload succeeded but no profile URL returned.');
  return { profileImage: data.profileImage };
}

/** Public read of admin special-offer card JSON (no auth). Used by concierge; returns null if missing or API unreachable. */
export async function getSpecialOfferAdminConfig(): Promise<Record<string, unknown> | null> {
  const base = API_BASE.replace(/\/$/, '');
  const url = base ? `${base}/api/special-offer-config` : '/api/special-offer-config';
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { config?: unknown };
    const c = data?.config;
    if (c != null && typeof c === 'object' && !Array.isArray(c)) return c as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

/** Admin: upsert special-offer marketing JSON to Supabase via API (requires admin session). */
export async function putAdminSpecialOfferConfig(config: Record<string, unknown>): Promise<void> {
  const res = await apiFetch('/api/admin/special-offer-config', { method: 'PUT', body: config });
  if (!res.ok) throw new Error(await res.text());
}

/** Delete the current user from Supabase Auth so they cannot sign back in. Call before sign-out when user confirms delete account. Throws if unauthenticated (401), not configured (503), or any API error so the UI does not sign out and pretend success. */
export async function deleteAccount(options?: { deletedFrom?: string }): Promise<void> {
  const token = await getAccessToken();
  const base = API_BASE.replace(/\/$/, '');
  const qs =
    options?.deletedFrom != null && String(options.deletedFrom).trim()
      ? `?deletedFrom=${encodeURIComponent(String(options.deletedFrom).trim())}`
      : '';
  const path = `/api/delete-account${qs}`;
  const url = base ? `${base}${path}` : path;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string' && j.error.trim()) message = j.error.trim();
    } catch {
      /* use raw text */
    }
    if (res.status === 401) throw new Error('Not signed in. Sign in and try again.');
    if (res.status === 403) throw new Error(message || 'This action is not allowed.');
    if (res.status === 503) throw new Error('Account deletion is not available. Please contact support.');
    throw new Error(message || 'Failed to delete account');
  }
}

/** Record activity for admin Activity tab. Uses same-origin `/api/activity` when VITE_API_BASE is empty. No-op if not authenticated (401). */
export async function recordActivity(eventType: string, payload?: Record<string, unknown>): Promise<void> {
  const res = await apiFetch('/api/activity', { method: 'POST', body: payload ? { eventType, payload } : { eventType } });
  if (res.status === 401) return;
  if (!res.ok) throw new Error(await res.text());
}

export async function getOrders(): Promise<{ activeOrders: unknown[]; pastOrders: unknown[] }> {
  const res = await apiFetch('/api/orders');
  if (res.status === 401) return { activeOrders: [], pastOrders: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    activeOrders: Array.isArray(data.activeOrders) ? data.activeOrders : [],
    pastOrders: Array.isArray(data.pastOrders) ? data.pastOrders : [],
  };
}

export async function putOrders(
  activeOrders: unknown[],
  pastOrders: unknown[]
): Promise<{ activeOrders: unknown[]; pastOrders: unknown[] }> {
  const res = await apiFetch('/api/orders', {
    method: 'PUT',
    body: { activeOrders, pastOrders },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    activeOrders: Array.isArray(data.activeOrders) ? data.activeOrders : [],
    pastOrders: Array.isArray(data.pastOrders) ? data.pastOrders : [],
  };
}

export async function getCart(): Promise<{ items: unknown[]; version?: number }> {
  const res = await apiFetch('/api/cart');
  if (res.status === 401) return { items: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { items?: unknown; version?: unknown };
  const items = Array.isArray(data.items) ? data.items : [];
  const version =
    typeof data.version === 'number' && Number.isFinite(data.version) && data.version >= 1
      ? Math.floor(data.version)
      : undefined;
  return { items, version };
}

export class CartVersionConflictError extends Error {
  readonly serverVersion: number | null;
  constructor(serverVersion: number | null, message?: string) {
    super(message || 'cart_version_conflict');
    this.name = 'CartVersionConflictError';
    this.serverVersion = serverVersion;
  }
}

export async function putCart(
  items: unknown[],
  baseVersion?: number | null
): Promise<{ items: unknown[]; version?: number }> {
  const body: Record<string, unknown> = { items };
  if (baseVersion != null && Number.isFinite(baseVersion) && baseVersion >= 1) {
    body.baseVersion = Math.floor(baseVersion);
  }
  const res = await apiFetch('/api/cart', { method: 'PUT', body });
  const text = await res.text();
  if (res.status === 409) {
    let serverVersion: number | null = null;
    try {
      const j = JSON.parse(text) as { serverVersion?: unknown };
      if (typeof j.serverVersion === 'number' && Number.isFinite(j.serverVersion)) {
        serverVersion = Math.floor(j.serverVersion);
      }
    } catch {
      /* ignore */
    }
    throw new CartVersionConflictError(serverVersion);
  }
  if (!res.ok) throw new Error(text || 'putCart failed');
  const data = JSON.parse(text) as { items?: unknown; version?: unknown };
  const version =
    typeof data.version === 'number' && Number.isFinite(data.version) && data.version >= 1
      ? Math.floor(data.version)
      : undefined;
  return { items: Array.isArray(data.items) ? data.items : [], version };
}

export async function getWishlist(): Promise<{ items: unknown[] }> {
  const res = await apiFetch('/api/wishlist');
  if (res.status === 401) return { items: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { items: Array.isArray(data.items) ? data.items : [] };
}

/** Admin-sent alert rows stored on the user's notifications row in Supabase. */
export async function getNotifications(): Promise<{ items: unknown[] }> {
  const res = await apiFetch('/api/notifications');
  if (res.status === 401) return { items: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { items?: unknown };
  return { items: Array.isArray(data.items) ? data.items : [] };
}

export async function putWishlist(items: unknown[]): Promise<{ items: unknown[] }> {
  const res = await apiFetch('/api/wishlist', { method: 'PUT', body: { items } });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { items: unknown[] };
}

/** Admin: fetch all clients (profiles + auth users). Requires admin session and SUPABASE_SERVICE_ROLE_KEY on API. */
export async function getAdminClients(): Promise<{ clients: Record<string, unknown>[]; error?: 'forbidden' | 'service_unavailable' }> {
  const res = await apiFetch('/api/admin/clients');
  if (res.status === 403) return { clients: [], error: 'forbidden' };
  if (res.status === 503) return { clients: [], error: 'service_unavailable' };
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const clients = Array.isArray(data) ? data : [];
  return { clients };
}

export type AdminNewsletterSendResult = {
  ok?: boolean;
  sent?: number;
  failed?: { email: string; error: string }[];
  attempted?: number;
  error?: string;
};

/** Admin: send newsletter email via Resend (requires RESEND_API_KEY on server). Max 100 recipients per call. */
export async function sendAdminNewsletter(payload: {
  subject: string;
  html: string;
  to: string[];
}): Promise<AdminNewsletterSendResult> {
  const res = await apiFetch('/api/admin/newsletter-send', { method: 'POST', body: payload });
  const text = await res.text();
  let data: AdminNewsletterSendResult = {};
  try {
    data = text ? (JSON.parse(text) as AdminNewsletterSendResult) : {};
  } catch {
    data = { error: text || 'Invalid response' };
  }
  if (!res.ok) {
    const err =
      typeof data.error === 'string' && data.error.trim()
        ? data.error
        : text && text.length < 500
          ? text
          : `HTTP ${res.status}`;
    return { error: err };
  }
  return data;
}

/** Admin: fetch orders for a user by Supabase user id. Requires admin session. */
export async function getAdminOrders(userId: string): Promise<{ activeOrders: unknown[]; pastOrders: unknown[] }> {
  const res = await apiFetch(`/api/admin/orders?user_id=${encodeURIComponent(userId)}`);
  if (res.status === 403 || res.status === 400) return { activeOrders: [], pastOrders: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    activeOrders: Array.isArray(data.activeOrders) ? data.activeOrders : [],
    pastOrders: Array.isArray(data.pastOrders) ? data.pastOrders : [],
  };
}

/** Admin: dashboard stats and recent activity. */
export async function getAdminDashboard(): Promise<{
  stats: { activeClients: number; clientsWithDeliveredOrder?: number; referralCount: number; signUpsThisMonth?: number; totalRevenue?: number; totalOrders?: number; pendingForms?: number };
  clients: Record<string, unknown>[];
  bookings: Array<{ status: string; appointment_date?: string; service_name?: string; client_name?: string }>;
  revenue: { date: string; amount: number; status: string }[];
  notifications: Array<{ id: number; text: string }>;
}> {
  const res = await apiFetch('/api/admin/dashboard');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    stats: data.stats ?? { activeClients: 0, referralCount: 0 },
    clients: Array.isArray(data.clients) ? data.clients : [],
    bookings: Array.isArray(data.bookings) ? data.bookings : [],
    revenue: Array.isArray(data.revenue) ? data.revenue : [],
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
  };
}

/** Admin: revenue totals and breakdown. */
export async function getAdminRevenue(): Promise<{ totalRevenue: number; totalOrders: number; breakdown: { month: string; value: number }[] }> {
  const res = await apiFetch('/api/admin/revenue');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    totalRevenue: Number(data.totalRevenue) || 0,
    totalOrders: Number(data.totalOrders) || 0,
    breakdown: Array.isArray(data.breakdown) ? data.breakdown : [],
  };
}

export type AdminPendingReviewBreakdown = {
  total: number;
  withPhotos: number;
  withVideos: number;
  textOnly: number;
};

/** Admin: pending counts (reviews + orders). */
export async function getAdminPending(): Promise<{
  pendingReviews: number;
  orderForms: number;
  pendingItems: { label: string; value: string }[];
  pendingReviewBreakdown: AdminPendingReviewBreakdown;
}> {
  const res = await apiFetch('/api/admin/pending');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const br = data.pendingReviewBreakdown;
  const breakdown: AdminPendingReviewBreakdown =
    br && typeof br === 'object'
      ? {
          total: Number(br.total) || 0,
          withPhotos: Number(br.withPhotos) || 0,
          withVideos: Number(br.withVideos) || 0,
          textOnly: Number(br.textOnly) || 0,
        }
      : { total: 0, withPhotos: 0, withVideos: 0, textOnly: 0 };
  return {
    pendingReviews: Number(data.pendingReviews) || 0,
    orderForms: Number(data.orderForms) || 0,
    pendingItems: Array.isArray(data.pendingItems) ? data.pendingItems : [],
    pendingReviewBreakdown: breakdown,
  };
}

/** Admin: referrals log (empty until table exists). */
export async function getAdminReferrals(): Promise<{ log: unknown[]; totalEarned: number; inviteeCount: number; byReferrer: Record<string, { count: number; earned: number }> }> {
  const res = await apiFetch('/api/admin/referrals');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    log: Array.isArray(data.log) ? data.log : [],
    totalEarned: Number(data.totalEarned) || 0,
    inviteeCount: Number(data.inviteeCount) || 0,
    byReferrer: data.byReferrer && typeof data.byReferrer === 'object' ? data.byReferrer : {},
  };
}

export type AdminReviewsApiResponse = {
  reviews: unknown[];
  averageRating: number;
  totalReviews: number;
  reviewsWithMedia?: number;
  contentReviewsPercent?: number;
  positiveSentimentPercent?: number;
};

/** Admin: reviews list (empty until table exists). */
export async function getAdminReviews(): Promise<AdminReviewsApiResponse> {
  const res = await apiFetch('/api/admin/reviews');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    averageRating: Number(data.averageRating) || 0,
    totalReviews: Number(data.totalReviews) || 0,
    reviewsWithMedia: Number(data.reviewsWithMedia) || 0,
    contentReviewsPercent: Number(data.contentReviewsPercent) || 0,
    positiveSentimentPercent: Number(data.positiveSentimentPercent) || 0,
  };
}

export type AdminPendingQueueResponse = {
  orderForms: unknown[];
  affiliate: unknown[];
  reviewSupplemental: unknown[];
  dbReviews: unknown[];
};

/** Admin: server-backed pending queues (cross-device). */
export async function getAdminPendingQueue(): Promise<AdminPendingQueueResponse> {
  const res = await apiFetch('/api/admin/pending-queue');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    orderForms: Array.isArray(data.orderForms) ? data.orderForms : [],
    affiliate: Array.isArray(data.affiliate) ? data.affiliate : [],
    reviewSupplemental: Array.isArray(data.reviewSupplemental) ? data.reviewSupplemental : [],
    dbReviews: Array.isArray(data.dbReviews) ? data.dbReviews : [],
  };
}

export async function patchAdminPendingQueue(body: {
  type: 'order_form' | 'affiliate' | 'review_supplemental' | 'db_review';
  id: string;
  decision: 'approve' | 'decline';
  reason?: string;
}): Promise<void> {
  const res = await apiFetch('/api/admin/pending-queue', { method: 'PATCH', body });
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
}

/** Authenticated client: write to server pending queues / profile JSON. */
export async function postClientSubmission(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await apiFetch('/api/client/submissions', { method: 'POST', body });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Record<string, unknown>;
}

/** Admin: meetings list (empty until table exists). */
export async function getAdminMeetings(): Promise<{ meetings: unknown[] }> {
  const res = await apiFetch('/api/admin/meetings');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { meetings: Array.isArray(data.meetings) ? data.meetings : [] };
}

/** Admin: brand metrics. */
export async function getAdminBrand(): Promise<Record<string, string | number>> {
  const res = await apiFetch('/api/admin/brand');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Record<string, string | number>;
}

/** Admin: deleted accounts list (empty until table exists). */
export async function getAdminDeletedAccounts(): Promise<{ deleted: unknown[] }> {
  const res = await apiFetch('/api/admin/deleted-accounts');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { deleted: Array.isArray(data.deleted) ? data.deleted : [] };
}

/** Admin: social analytics aggregates + recent events (Supabase `site_analytics_events` when configured). */
export async function getAdminAnalytics(): Promise<{
  total: number;
  bySource: Record<string, number>;
  byPlatform: Record<string, number>;
  byPlatformAndSource: Record<string, Record<string, number>>;
  recentEvents?: Array<{
    platform: string;
    source: string;
    timestamp: number;
    visitorId?: string;
    userEmail?: string | null;
  }>;
}> {
  const res = await apiFetch('/api/admin/analytics');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

/** Admin: live visitors (page_view heartbeats with geo, last ~24h, deduped per visitor) for Revenue Live View globe. */
export async function getAdminLivePresence(): Promise<{
  visitorsNow: number;
  visitors: Array<{
    visitor_id: string;
    lat: number;
    lng: number;
    path: string | null;
    city?: string;
    region?: string;
    country?: string;
    lastAt: number;
  }>;
}> {
  /** Avoid 304 + empty body (browser revalidation): `JSON.parse('')` throws and looked like a hard failure. */
  const res = await apiFetch('/api/admin/live-presence', { cache: 'no-store' });
  const text = await res.text();
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  const trimmed = text.trim();
  if (trimmed === '') {
    return { visitorsNow: 0, visitors: [] };
  }
  try {
    return JSON.parse(trimmed) as {
      visitorsNow: number;
      visitors: Array<{
        visitor_id: string;
        lat: number;
        lng: number;
        path: string | null;
        city?: string;
        region?: string;
        country?: string;
        lastAt: number;
      }>;
    };
  } catch {
    throw new Error(
      text.trim().startsWith('<')
        ? 'live-presence returned HTML (not JSON) — redeploy API or check VITE_API_BASE.'
        : 'live-presence returned invalid JSON'
    );
  }
}

/** Public POST — no auth. Records marketing events (e.g. social clicks) for admin analytics. */
export async function postAnalyticsEvent(payload: {
  visitorId: string;
  eventType: 'social_click';
  platform: string;
  source: string;
  path?: string;
  userEmail?: string | null;
}): Promise<boolean> {
  const base = API_BASE.replace(/\/$/, '');
  const path = 'api/analytics/event';
  const url = base ? `${base}/${path}` : `/${path}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: payload.visitorId,
        eventType: payload.eventType,
        platform: payload.platform,
        source: payload.source,
        path: payload.path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
        userEmail: payload.userEmail ?? undefined,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Admin: list auth users (paginated). */
export async function getAdminUsers(page = 1, perPage = 50): Promise<{ users: Array<{ id: string; email: string; created_at?: string; last_sign_in_at?: string; banned_until?: string; email_confirmed_at?: string }>; total?: number }> {
  const res = await apiFetch(`/api/admin/users?page=${page}&per_page=${perPage}`);
  if (res.status === 403) return { users: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { users: Array.isArray(data.users) ? data.users : [], total: data.total };
}

/** Admin: user action (disable | enable | trigger-password-reset). */
export async function postAdminUserAction(action: 'disable' | 'enable' | 'trigger-password-reset', payload: { userId?: string; email?: string }): Promise<{ success?: boolean; error?: string }> {
  const res = await apiFetch('/api/admin/users', { method: 'POST', body: { action, ...payload } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText);
  return data as { success?: boolean };
}

/** Admin: get cart for a user. */
export async function getAdminCart(userId: string): Promise<{ items: unknown[] }> {
  const res = await apiFetch(`/api/admin/cart?user_id=${encodeURIComponent(userId)}`);
  if (res.status === 403 || res.status === 400) return { items: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { items: Array.isArray(data.items) ? data.items : [] };
}

/** Admin: get wishlist for a user. */
export async function getAdminWishlist(userId: string): Promise<{ items: unknown[] }> {
  const res = await apiFetch(`/api/admin/wishlist?user_id=${encodeURIComponent(userId)}`);
  if (res.status === 403 || res.status === 400) return { items: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { items: Array.isArray(data.items) ? data.items : [] };
}

/** Admin: get activity log for a user (newest first). */
export async function getAdminActivity(userId: string, limit = 200): Promise<Array<{ id: string; eventType: string; payload?: unknown; createdAt: string }>> {
  const res = await apiFetch(`/api/admin/activity?user_id=${encodeURIComponent(userId)}&limit=${limit}`);
  if (res.status === 403 || res.status === 400) return [];
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Admin: list notifications (optionally by user_id). */
export async function getAdminNotifications(userId?: string): Promise<Array<{ userId: string; items: unknown[]; updatedAt?: string }>> {
  const url = userId ? `/api/admin/notifications?user_id=${encodeURIComponent(userId)}` : '/api/admin/notifications';
  const res = await apiFetch(url);
  if (res.status === 403) return [];
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Admin: send notification to a user. */
export async function postAdminNotification(userId: string, message: string): Promise<void> {
  const res = await apiFetch('/api/admin/notifications', { method: 'POST', body: { userId, message } });
  if (!res.ok) throw new Error(await res.text());
}

/** Admin: audit log list. */
export async function getAdminAuditLog(limit = 50, offset = 0): Promise<Array<{ id: string; actorEmail?: string; action: string; resourceType: string; resourceId?: string; details?: unknown; createdAt: string }>> {
  const res = await apiFetch(`/api/admin/audit-log?limit=${limit}&offset=${offset}`);
  if (res.status === 403) return [];
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Admin: export clients as CSV (returns blob URL for download). */
export async function exportClientsCsv(): Promise<string> {
  const token = await getAccessToken();
  const base = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';
  const url = `${base.replace(/\/$/, '')}/api/admin/export/clients`;
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (res.status === 403 || !res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/** Admin: update review status and/or verified purchase flag. */
export async function patchAdminReview(
  id: string,
  updates: {
    status?: 'pending' | 'published' | 'rejected';
    verifiedPurchase?: boolean;
  }
): Promise<unknown> {
  const res = await apiFetch('/api/admin/reviews', {
    method: 'PATCH',
    body: { id, ...updates },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Admin: create review. */
export async function postAdminReview(body: {
  email: string;
  clientName?: string;
  rating: number;
  product?: string;
  review?: string;
  status?: string;
  verifiedPurchase?: boolean;
}): Promise<unknown> {
  const res = await apiFetch('/api/admin/reviews', { method: 'POST', body });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Admin: create meeting. */
export async function postAdminMeeting(body: { userId?: string; clientEmail?: string; clientName?: string; meetingDate: string; meetingTime?: string; type?: string; durationMinutes?: number; status?: string; notes?: string }): Promise<unknown> {
  const res = await apiFetch('/api/admin/meetings', { method: 'POST', body });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Admin: update meeting. */
export async function patchAdminMeeting(id: string, updates: Record<string, unknown>): Promise<unknown> {
  const res = await apiFetch('/api/admin/meetings', { method: 'PATCH', body: { id, ...updates } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Admin: delete meeting. */
export async function deleteAdminMeeting(id: string): Promise<void> {
  const res = await apiFetch(`/api/admin/meetings?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}

/** Booking checkout: create a pending appointment meeting row for admin calendar (authenticated user only). */
export async function postBookingAppointmentMeeting(body: {
  meetingDate: string;
  meetingTime: string;
  type?: string;
  durationMinutes?: number;
  notes?: string;
  orderNumber?: string;
  idempotencyKey?: string;
  bookingInstallKind?: string;
  bookingOrderTotalPaidUsd?: number;
  bookingLineTotalPaidUsd?: number;
  bookingInstallFeeUsd?: number;
  bookingBalancePaidUsd?: number;
  bookingFinalDueUsd?: number;
  bookingPaymentMethodLabel?: string;
  bookingBookedAtIso?: string;
  bookingStripeCustomerId?: string;
  bookingStripePaymentMethodId?: string;
  bookingAutopayConsent?: boolean;
  bookingAutopayConsentAt?: string;
}): Promise<unknown> {
  const res = await apiFetch('/api/booking/appointment-meeting', { method: 'POST', body });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Admin: list booking final-payment autopay attempts. */
export async function getAdminBookingAutopayAttempts(params?: {
  meetingId?: string;
  userId?: string;
  status?: 'succeeded' | 'failed' | 'cancelled' | 'skipped';
  limit?: number;
}): Promise<Array<Record<string, unknown>>> {
  const qs = new URLSearchParams();
  if (params?.meetingId) qs.set('meeting_id', params.meetingId);
  if (params?.userId) qs.set('user_id', params.userId);
  if (params?.status) qs.set('status', params.status);
  if (typeof params?.limit === 'number' && Number.isFinite(params.limit)) {
    qs.set('limit', String(Math.max(1, Math.min(200, Math.round(params.limit)))));
  }
  const path = qs.toString() ? `/api/admin/booking-autopay-attempts?${qs.toString()}` : '/api/admin/booking-autopay-attempts';
  const res = await apiFetch(path);
  if (res.status === 401 || res.status === 403) return [];
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { attempts?: Array<Record<string, unknown>> };
  return Array.isArray(data.attempts) ? data.attempts : [];
}

/** Booking checkout: create consultation meeting row for admin hub. */
export async function postBookingConsultMeeting(body: {
  meetingDate?: string;
  meetingTime?: string;
  tier?: string;
  hairOption?: string;
  notes?: string;
  headMeasurements?: Record<string, string>;
  orderNumber?: string;
  idempotencyKey?: string;
  inspoPhotoUrls?: string[];
  inspoFileNames?: string[];
}): Promise<unknown> {
  const res = await apiFetch('/api/booking/consult-meeting', { method: 'POST', body });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Admin: send consult quote + client alert. */
export async function postAdminConsultQuote(body: {
  clientEmail: string;
  clientFirstName?: string;
  clientLastName?: string;
  unitKey?: string;
  selections?: Record<string, unknown>;
  priceBreakdown?: unknown[];
  adminMessage?: string;
  thumbnailSrc?: string;
  /** Checkout-style order ref (e.g. `#332`) for alert copy + deep link to Orders → VIEW OFFER. */
  orderNumberFromCheckout?: string;
}): Promise<unknown> {
  let res: Response;
  try {
    res = await apiFetch('/api/admin/consult-quotes', { method: 'POST', body });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/failed to fetch|load failed|network|request failed/i.test(msg)) {
      throw new Error(
        'Network error — could not reach the server. Offer can still be saved locally when you confirm again, or check your connection and VITE_API_BASE.'
      );
    }
    throw err;
  }
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string' && j.error.trim()) detail = j.error;
    } catch {
      /* use raw text */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
}

/** Signed-in user: fetch one consult quote by id. */
export async function getConsultQuote(id: string): Promise<{ quote: Record<string, unknown> } | null> {
  const res = await apiFetch(`/api/consult-quote?id=${encodeURIComponent(id)}`);
  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ quote: Record<string, unknown> }>;
}

export type ValidateConsultCodeResult = {
  ok: boolean;
  quoteId: string;
  code: string;
  amountUsd: number;
  expiresAt: string | null;
};

/** Signed-in user: validate CONSULT-* code from admin quote (72h, not redeemed). */
export async function validateConsultDiscountCode(code: string): Promise<ValidateConsultCodeResult> {
  const res = await apiFetch('/api/checkout/validate-consult-code', {
    method: 'POST',
    body: { code: (code || '').trim() },
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string') msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error((msg || 'INVALID CODE').toUpperCase());
  }
  return JSON.parse(text) as ValidateConsultCodeResult;
}

/** Mark consult quote redeemed after a completed order (one-time $40 code). */
export async function redeemConsultQuote(quoteId: string): Promise<void> {
  const res = await apiFetch('/api/checkout/redeem-consult-code', {
    method: 'POST',
    body: { quoteId },
  });
  if (!res.ok) throw new Error(await res.text());
}

export type WigPreviewLiveNoirColorPayload = {
  color: string;
  length?: string;
  density?: string;
  lace?: string;
  texture?: string;
  hairline?: string;
  styling?: string;
  addOns?: string[];
  /** When true with a single `angle`, re-runs fal even if that WebP exists (admin regenerate). */
  forceRegenerate?: boolean;
};

export type WigPreviewLiveNoirColorResult = {
  ok: boolean;
  manifestHash: string;
  bucket: string;
  paths: { front: string; left: string; right: string };
  publicUrls: { front: string | null; left: string | null; right: string | null };
  generated: string[];
  skipped: string[];
  selections: Record<string, unknown>;
};

export async function postWigPreviewLiveNoirColorOneAngle(
  body: WigPreviewLiveNoirColorPayload & { angle: 'left' | 'front' | 'right' }
): Promise<WigPreviewLiveNoirColorResult> {
  let res: Response;
  try {
    res = await apiFetch('/api/wig-preview/live-noir-color', { method: 'POST', body });
  } catch (e) {
    rethrowWithNetworkHint(e, 'Live color preview');
  }
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string') msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg || 'Live preview failed');
  }
  return JSON.parse(text) as WigPreviewLiveNoirColorResult;
}

/** Admin: regenerate one color angle (fal again even if file exists). */
export async function postWigPreviewLiveNoirColorRegenerateAngle(
  body: WigPreviewLiveNoirColorPayload,
  angle: 'left' | 'front' | 'right'
): Promise<WigPreviewLiveNoirColorResult> {
  return postWigPreviewLiveNoirColorOneAngle({ ...body, angle, forceRegenerate: true });
}

/**
 * Admin: batch regenerate all three color angles (fal for L, M, R even if WebPs exist).
 * Same parallel one-angle strategy as `postWigPreviewLiveNoirColor`, with `forceRegenerate: true`.
 */
export async function postWigPreviewLiveNoirColorRegenerateAll(
  body: WigPreviewLiveNoirColorPayload
): Promise<WigPreviewLiveNoirColorResult> {
  const angles = ['left', 'front', 'right'] as const;
  const [ra, rb, rc] = await Promise.all(
    angles.map((angle) => postWigPreviewLiveNoirColorOneAngle({ ...body, angle, forceRegenerate: true }))
  );
  const hashes = new Set([ra.manifestHash, rb.manifestHash, rc.manifestHash]);
  if (hashes.size !== 1) {
    throw new Error('Live preview mismatch (try again)');
  }
  const mergedSkipped = [...new Set([...ra.skipped, ...rb.skipped, ...rc.skipped])];
  const mergedGenerated = [...new Set([...ra.generated, ...rb.generated, ...rc.generated])];
  /** Each request regenerates one angle — sibling URLs in a response can be stale until siblings finish; merge per angle. */
  const publicUrls = {
    left: ra.publicUrls.left,
    front: rb.publicUrls.front,
    right: rc.publicUrls.right,
  };
  return {
    ok: true,
    manifestHash: ra.manifestHash,
    bucket: ra.bucket,
    paths: ra.paths,
    publicUrls,
    generated: mergedGenerated,
    skipped: mergedSkipped,
    selections: ra.selections,
  };
}

/**
 * Admin only: ensure NOIR color preview WebPs exist in Storage (3 angles).
 * Uses **three parallel** API calls (one angle each) so each Vercel function stays within short timeouts (e.g. Hobby ~10s).
 */
export async function postWigPreviewLiveNoirColor(
  body: WigPreviewLiveNoirColorPayload
): Promise<WigPreviewLiveNoirColorResult> {
  const angles = ['left', 'front', 'right'] as const;
  const [ra, rb, rc] = await Promise.all(
    angles.map((angle) => postWigPreviewLiveNoirColorOneAngle({ ...body, angle }))
  );
  const hashes = new Set([ra.manifestHash, rb.manifestHash, rc.manifestHash]);
  if (hashes.size !== 1) {
    throw new Error('Live preview mismatch (try again)');
  }
  const mergedSkipped = [...new Set([...ra.skipped, ...rb.skipped, ...rc.skipped])];
  const mergedGenerated = [...new Set([...ra.generated, ...rb.generated, ...rc.generated])];
  return {
    ok: true,
    manifestHash: ra.manifestHash,
    bucket: ra.bucket,
    paths: ra.paths,
    publicUrls: ra.publicUrls,
    generated: mergedGenerated,
    skipped: mergedSkipped,
    selections: ra.selections,
  };
}

export type LiveWigAfterColorStylingPayload = WigPreviewLiveNoirColorPayload & {
  partSelection: string;
  forceRegenerate?: boolean;
};

export type LiveWigAfterColorStylingResult = {
  ok: boolean;
  colorTierHash: string;
  fullManifestHash: string;
  bucket: string;
  colorPaths: { front: string; left: string; right: string };
  outputPaths: { front: string; left: string; right: string };
  publicUrls: { front: string | null; left: string | null; right: string | null };
  generated: string[];
  skipped: string[];
  selections: Record<string, unknown>;
  partSelection?: 'MIDDLE' | 'LEFT' | 'RIGHT';
  stylingMode?: 'middle-layers' | 'bangs-only';
};

export async function postLiveWigAfterColorStylingOneAngle(
  body: LiveWigAfterColorStylingPayload & { angle: 'left' | 'front' | 'right' }
): Promise<LiveWigAfterColorStylingResult> {
  let res: Response;
  try {
    res = await apiFetch('/api/live-wig-after-color-styling', { method: 'POST', body });
  } catch (e) {
    rethrowWithNetworkHint(e, 'Live styling preview');
  }
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string') msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg || 'Live styling preview failed');
  }
  return JSON.parse(text) as LiveWigAfterColorStylingResult;
}

/** Admin: regenerate one after-color styling angle. */
export async function postLiveWigAfterColorStylingRegenerateAngle(
  body: LiveWigAfterColorStylingPayload,
  angle: 'left' | 'front' | 'right'
): Promise<LiveWigAfterColorStylingResult> {
  return postLiveWigAfterColorStylingOneAngle({ ...body, angle, forceRegenerate: true });
}

/**
 * Admin: middle + layers after color — **three sequential** one-angle API calls.
 * A single invocation that runs three fal jobs often exceeds Vercel limits → `FUNCTION_INVOCATION_FAILED`.
 * Pass **`forceRegenerate: true`** on `body` (or in `opts`) to re-run fal when color/styling changed but Storage still has old WebPs.
 */
export async function postLiveWigAfterColorStyling(
  body: LiveWigAfterColorStylingPayload,
  opts?: { forceRegenerate?: boolean }
): Promise<LiveWigAfterColorStylingResult> {
  const angles = ['left', 'front', 'right'] as const;
  const pauseBetweenAnglesMs = 1200;
  const force = Boolean(opts?.forceRegenerate || body.forceRegenerate);
  const b = force ? { ...body, forceRegenerate: true as const } : body;
  const ra = await postLiveWigAfterColorStylingOneAngle({ ...b, angle: angles[0] });
  await new Promise((r) => setTimeout(r, pauseBetweenAnglesMs));
  const rb = await postLiveWigAfterColorStylingOneAngle({ ...b, angle: angles[1] });
  await new Promise((r) => setTimeout(r, pauseBetweenAnglesMs));
  const rc = await postLiveWigAfterColorStylingOneAngle({ ...b, angle: angles[2] });
  const colorHashes = new Set([ra.colorTierHash, rb.colorTierHash, rc.colorTierHash]);
  if (colorHashes.size !== 1) {
    throw new Error('Live styling mismatch (try again)');
  }
  const mergedSkipped = [...new Set([...ra.skipped, ...rb.skipped, ...rc.skipped])];
  const mergedGenerated = [...new Set([...ra.generated, ...rb.generated, ...rc.generated])];
  return {
    ok: true,
    colorTierHash: ra.colorTierHash,
    fullManifestHash: ra.fullManifestHash,
    bucket: ra.bucket,
    colorPaths: ra.colorPaths,
    outputPaths: ra.outputPaths,
    publicUrls: {
      left: ra.publicUrls.left ?? rb.publicUrls.left ?? rc.publicUrls.left,
      front: ra.publicUrls.front ?? rb.publicUrls.front ?? rc.publicUrls.front,
      right: ra.publicUrls.right ?? rb.publicUrls.right ?? rc.publicUrls.right,
    },
    generated: mergedGenerated,
    skipped: mergedSkipped,
    selections: ra.selections,
  };
}

export type BuildWigUnitImagePayload = {
  unitKey: string;
  referenceImagePath?: string;
  referenceImageUrl?: string;
  backdropReferenceImagePath?: string;
  backdropReferenceImageUrl?: string;
  backdropReferenceImageUrls?: string[];
  referenceView?: string;
  length?: string;
  density?: string;
  lace?: string;
  texture?: string;
  color?: string;
  hairline?: string;
  styling?: string;
  addOns?: string[];
  partSelection?: string;
  referenceMatchesHairline?: boolean;
};

export type BuildWigUnitImageResult = {
  ok: boolean;
  imageUrl: string;
  stepsRun: string[];
  referenceImageUrl: string;
  selections: Record<string, unknown>;
};

export async function postBuildWigUnitImage(
  body: BuildWigUnitImagePayload
): Promise<BuildWigUnitImageResult> {
  let res: Response;
  try {
    res = await apiFetch('/api/build-a-wig-unit-image', { method: 'POST', body });
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    if (isLikelyBrowserFetchNetworkError(raw)) {
      throw new Error('Generate unit image failed. Check your connection and try again.');
    }
    throw e;
  }
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string' && j.error.trim()) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg || 'Generate unit image failed');
  }
  return JSON.parse(text) as BuildWigUnitImageResult;
}

/** Admin: notify client about reschedule/cancel request for an appointment. */
export async function postAdminMeetingClientAlert(body: {
  meetingId: string;
  reason: string;
  message?: string;
  action: 'reschedule' | 'cancel';
  clientEmail?: string;
  userId?: string;
}): Promise<void> {
  const res = await apiFetch('/api/admin/meeting-client-alert', { method: 'POST', body });
  if (!res.ok) {
    const t = await res.text();
    let msg = t;
    try {
      const j = JSON.parse(t) as { error?: string };
      if (typeof j?.error === 'string') msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg || 'Alert failed');
  }
}
