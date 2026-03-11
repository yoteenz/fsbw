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
    if (merged.profileImage && typeof merged.profileImage === 'string') {
      localStorage.setItem('profileImage', merged.profileImage);
    }

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
