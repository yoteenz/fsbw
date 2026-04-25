/**
 * Enrich globe cluster **customer** rows with **`registeredUsers`** profile fields
 * (same localStorage source as Admin Clients / account profile) for the revenue cluster panel.
 */

import type { OrderGlobeClusterCustomer } from './adminOrderGlobeClusters';

const DEFAULT_AVATAR = '/assets/profile-thumb.png';

function readStr(o: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function readRegisteredUsers(): Record<string, unknown>[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('registeredUsers') : null;
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

function findUserByEmail(emailNorm: string): Record<string, unknown> | null {
  const list = readRegisteredUsers();
  for (const u of list) {
    const e = String(u.email ?? '')
      .trim()
      .toLowerCase();
    if (e && e === emailNorm) return u;
  }
  return null;
}

function birthYearFromProfile(u: Record<string, unknown>): number | null {
  const y = Number(u.birthYear);
  if (Number.isFinite(y) && y > 1900 && y < 2100) return y;
  const bd = readStr(u, 'birthday', 'birthDate', 'birth_date');
  if (!bd) return null;
  const parts = bd.split(/[/-]/).map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const last = parseInt(parts[parts.length - 1]!, 10);
    if (Number.isFinite(last) && last > 1900 && last < 2100) return last;
  }
  if (parts.length === 1 && parts[0]!.length === 8) {
    const yy = parseInt(parts[0]!.slice(4, 8), 10);
    if (Number.isFinite(yy) && yy > 1900 && yy < 2100) return yy;
  }
  return null;
}

function computeAgeFromBirthYear(year: number): number {
  return new Date().getFullYear() - year;
}

function displayNameFromProfile(u: Record<string, unknown>): string {
  const fn = readStr(u, 'firstName', 'first_name');
  const ln = readStr(u, 'lastName', 'last_name');
  return [fn, ln].filter(Boolean).join(' ').trim();
}

function profileImageFromUser(u: Record<string, unknown> | null): string {
  if (!u) return DEFAULT_AVATAR;
  const img = readStr(u, 'profileImage', 'profile_image');
  return img || DEFAULT_AVATAR;
}

/**
 * Merge **`registeredUsers`** name / photo / age into cluster customer rows (by email, case-insensitive).
 */
function displayNameFromEmailOnly(email: string): string {
  const at = email.indexOf('@');
  const local = (at > 0 ? email.slice(0, at) : email).replace(/[._-]+/g, ' ').trim();
  if (!local) return email.toUpperCase();
  return local
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function enrichOrderGlobeClusterCustomers(customers: OrderGlobeClusterCustomer[]): OrderGlobeClusterCustomer[] {
  return customers.map((c) => {
    const email = String(c.email ?? '').trim();
    const norm = email.toLowerCase();
    const u = norm ? findUserByEmail(norm) : null;
    const birthY = u ? birthYearFromProfile(u) : null;
    const age = birthY != null ? computeAgeFromBirthYear(birthY) : null;
    return {
      ...c,
      displayName: (u && displayNameFromProfile(u)) || c.displayName || displayNameFromEmailOnly(email),
      profileImageUrl: profileImageFromUser(u),
      age: age ?? c.age ?? null,
    };
  });
}
