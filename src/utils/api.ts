/**
 * API client for backend sync (profile, orders, cart, wishlist).
 * Sends the Supabase session access_token as Bearer so the API can identify the user.
 */

import type { MembershipPaymentRecord } from './membershipPayments';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

export async function getAccessToken(): Promise<string | null> {
  const supabase = (await import('./supabase')).getSupabase();
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
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
): Promise<string> {
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
  const data = JSON.parse(text) as { url?: string };
  if (!data?.url) throw new Error('No checkout URL returned');
  return data.url;
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

export async function getCart(): Promise<{ items: unknown[] }> {
  const res = await apiFetch('/api/cart');
  if (res.status === 401) return { items: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { items: Array.isArray(data.items) ? data.items : [] };
}

export async function putCart(items: unknown[]): Promise<{ items: unknown[] }> {
  const res = await apiFetch('/api/cart', { method: 'PUT', body: { items } });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { items: unknown[] };
}

export async function getWishlist(): Promise<{ items: unknown[] }> {
  const res = await apiFetch('/api/wishlist');
  if (res.status === 401) return { items: [] };
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
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

/** Admin: pending counts. */
export async function getAdminPending(): Promise<{ pendingReviews: number; orderForms: number; pendingItems: { label: string; value: string }[] }> {
  const res = await apiFetch('/api/admin/pending');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    pendingReviews: Number(data.pendingReviews) || 0,
    orderForms: Number(data.orderForms) || 0,
    pendingItems: Array.isArray(data.pendingItems) ? data.pendingItems : [],
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

/** Admin: reviews list (empty until table exists). */
export async function getAdminReviews(): Promise<{ reviews: unknown[]; averageRating: number; totalReviews: number }> {
  const res = await apiFetch('/api/admin/reviews');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    averageRating: Number(data.averageRating) || 0,
    totalReviews: Number(data.totalReviews) || 0,
  };
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

/** Admin: update review status. */
export async function patchAdminReview(id: string, status: 'pending' | 'published' | 'rejected'): Promise<unknown> {
  const res = await apiFetch('/api/admin/reviews', { method: 'PATCH', body: { id, status } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Admin: create review. */
export async function postAdminReview(body: { email: string; clientName?: string; rating: number; product?: string; review?: string; status?: string }): Promise<unknown> {
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
}): Promise<unknown> {
  const res = await apiFetch('/api/booking/appointment-meeting', { method: 'POST', body });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Booking checkout: create consultation meeting row for admin hub. */
export async function postBookingConsultMeeting(body: {
  meetingDate?: string;
  meetingTime?: string;
  tier?: string;
  hairOption?: string;
  notes?: string;
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
}): Promise<unknown> {
  const res = await apiFetch('/api/admin/consult-quotes', { method: 'POST', body });
  if (!res.ok) throw new Error(await res.text());
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
