/**
 * Sync user data from the backend API into localStorage so the existing app
 * (currentUser, registeredUsers, userOrders_*, cartItems, wishlistItems) keeps working.
 * Call after Supabase sign-in or on app load when session exists.
 */
import { getProfile, getOrders, getCart, getWishlist } from './api';
import { isAdminEmail } from './adminAuth';

export async function syncProfileFromApi(): Promise<Record<string, unknown> | null> {
  try {
    const profile = await getProfile();
    if (!profile || typeof profile !== 'object') return null;
    const email = (profile.email as string) || '';
    if (!email) return null;

    const merged = {
      ...profile,
      email,
      role: isAdminEmail(email) ? 'admin' : (profile.role as string),
    } as Record<string, unknown>;

    localStorage.setItem('currentUser', JSON.stringify(merged));
    const img = merged.profileImage && typeof merged.profileImage === 'string' && String(merged.profileImage).trim();
    localStorage.setItem('profileImage', img ? String(merged.profileImage) : '/assets/profile-thumb.png');

    const registeredUsers: unknown[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const idx = registeredUsers.findIndex(
      (u: unknown) => ((u as { email?: string }).email || '').toLowerCase() === email.toLowerCase()
    );
    if (idx !== -1) {
      registeredUsers[idx] = merged;
    } else {
      registeredUsers.push(merged);
    }
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    localStorage.setItem('isSignedIn', 'true');
    return merged;
  } catch {
    return null;
  }
}

export async function syncOrdersFromApi(): Promise<void> {
  try {
    const { activeOrders, pastOrders } = await getOrders();
    const profile = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const email = (profile.email as string) || '';
    if (!email) return;
    const key = `userOrders_${email}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        activeOrders: Array.isArray(activeOrders) ? activeOrders : [],
        pastOrders: Array.isArray(pastOrders) ? pastOrders : [],
      })
    );
  } catch {
    // ignore
  }
}

export async function syncCartFromApi(): Promise<void> {
  try {
    const { items } = await getCart();
    const arr = Array.isArray(items) ? items : [];
    localStorage.setItem('cartItems', JSON.stringify(arr));
    localStorage.setItem('cartCount', String(arr.length));
  } catch {
    // ignore
  }
}

export async function syncWishlistFromApi(): Promise<void> {
  try {
    const { items } = await getWishlist();
    const arr = Array.isArray(items) ? items : [];
    localStorage.setItem('wishlistItems', JSON.stringify(arr));
  } catch {
    // ignore
  }
}

/** Run all syncs (profile, orders, cart, wishlist). Call after sign-in. */
export async function syncAllFromApi(): Promise<Record<string, unknown> | null> {
  const profile = await syncProfileFromApi();
  if (!profile) return null;
  await Promise.all([syncOrdersFromApi(), syncCartFromApi(), syncWishlistFromApi()]);
  return profile;
}

/**
 * Build minimal currentUser from Supabase session when getProfile() fails (e.g. no API or profile not ready).
 * Call after email confirm or sign-in so the user is signed in and not shown "create account on this device first".
 */
export function buildMinimalUserFromSupabaseSession(sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Record<string, unknown> {
  const email = (sessionUser.email || '').trim().toLowerCase();
  const meta = sessionUser.user_metadata || {};
  const firstName = (meta.first_name as string) || (meta.firstName as string) || '';
  const lastName = (meta.last_name as string) || (meta.lastName as string) || '';
  const phoneNumber = (meta.phone_number as string) || (meta.phoneNumber as string) || '';
  const birthday = (meta.birthday as string) || '';
  const merged = {
    id: sessionUser.id,
    email: sessionUser.email || '',
    firstName: firstName || email.split('@')[0] || 'User',
    lastName: lastName || '',
    first_name: firstName,
    last_name: lastName,
    phoneNumber,
    phone_number: phoneNumber,
    birthday,
    membershipType: 'STANDARD',
    role: isAdminEmail(email) ? 'admin' : undefined,
    giftCardBalance: 10, // Welcome discount Standard: $10 digital cash per subscription chart
  } as Record<string, unknown>;
  return merged;
}

/**
 * Apply minimal user to localStorage and registeredUsers so the app treats them as signed in.
 * Use when we have a Supabase session but syncProfileFromApi() failed.
 */
export function applyMinimalUserToStorage(merged: Record<string, unknown>): void {
  const email = (merged.email as string) || '';
  if (!email) return;
  localStorage.setItem('currentUser', JSON.stringify(merged));
  localStorage.setItem('profileImage', '/assets/profile-thumb.png');
  localStorage.setItem('isSignedIn', 'true');
  const registeredUsers: unknown[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const idx = registeredUsers.findIndex((u: unknown) => ((u as { email?: string }).email || '').toLowerCase() === email.toLowerCase());
  if (idx !== -1) (registeredUsers as Record<string, unknown>[])[idx] = { ...(registeredUsers[idx] as object), ...merged } as Record<string, unknown>;
  else registeredUsers.push(merged);
  localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
}

/**
 * Build a profile payload for PATCH /api/profile so the backend creates/upserts a profile row.
 * Call this when we have a session but getProfile() failed (e.g. after email confirm), so the
 * user appears in the admin clients list and future getProfile() works.
 */
export function buildProfilePayloadForBackend(minimal: Record<string, unknown>): Record<string, unknown> {
  const email = (minimal.email as string) || '';
  return {
    email,
    firstName: (minimal.firstName as string) || email.split('@')[0] || 'User',
    lastName: (minimal.lastName as string) || '',
    phoneNumber: (minimal.phoneNumber as string) || (minimal.phone_number as string) || '',
    birthday: (minimal.birthday as string) || '',
    membershipType: 'STANDARD',
    profileImage: '/assets/profile-thumb.png',
    giftCardBalance: 10, // Welcome discount Standard: $10 digital cash per subscription chart
  };
}
