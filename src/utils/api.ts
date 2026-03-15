/**
 * API client for backend sync (profile, orders, cart, wishlist).
 * Sends the Supabase session access_token as Bearer so the API can identify the user.
 */

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

export async function patchProfile(profile: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await apiFetch('/api/profile', { method: 'PATCH', body: profile });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Record<string, unknown>;
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

/** Admin: fetch all clients (profiles) from Supabase. Requires admin session. */
export async function getAdminClients(): Promise<Record<string, unknown>[]> {
  const res = await apiFetch('/api/admin/clients');
  if (res.status === 403) return [];
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data) ? data : [];
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
  stats: { activeClients: number; referralCount: number; signUpsThisMonth?: number; totalRevenue?: number; totalOrders?: number; pendingForms?: number };
  clients: { tier: string }[];
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

/** Admin: analytics summary (empty on server until storage exists). */
export async function getAdminAnalytics(): Promise<{
  total: number;
  bySource: Record<string, number>;
  byPlatform: Record<string, number>;
  byPlatformAndSource: Record<string, Record<string, number>>;
}> {
  const res = await apiFetch('/api/admin/analytics');
  if (res.status === 403) throw new Error('Forbidden');
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
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

/** Record a user activity event (call from app when user does something). Event types: sign_in, sign_out, view_product, add_to_cart, add_to_wishlist, remove_from_cart, remove_from_wishlist, place_order, cancel_order, add_review, redeem_points, view_page, etc. */
export async function recordActivity(eventType: string, payload?: Record<string, unknown>): Promise<void> {
  try {
    await apiFetch('/api/activity', { method: 'POST', body: { eventType, payload: payload ?? {} } });
  } catch {
    /* ignore */
  }
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
