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

async function apiFetch(
  path: string,
  options: RequestInit & { method?: string; body?: unknown } = {}
): Promise<Response> {
  const token = await getAccessToken();
  const url = `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const body =
    options.body !== undefined ? (JSON.stringify(options.body) as BodyInit) : undefined;
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
