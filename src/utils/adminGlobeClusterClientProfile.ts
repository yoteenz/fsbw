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

function twoDigitYearToFull(yy: number): number {
  if (yy >= 100) return yy;
  return yy >= 50 ? 1900 + yy : 2000 + yy;
}

/** Parse birth year from **`registeredUsers`** row (many legacy shapes). */
function birthPartsFromProfile(u: Record<string, unknown>): { y: number; m?: number; d?: number } | null {
  const yNum = Number(u.birthYear);
  if (Number.isFinite(yNum) && yNum > 1900 && yNum < 2100) {
    const m = Number(u.birthMonth);
    const d = Number(u.birthDay);
    const hasMd = Number.isFinite(m) && m >= 1 && m <= 12 && Number.isFinite(d) && d >= 1 && d <= 31;
    return hasMd ? { y: yNum, m, d } : { y: yNum };
  }

  const bd = readStr(u, 'birthday', 'birthDate', 'birth_date');
  if (!bd) return null;

  const digits = bd.replace(/\D/g, '');
  if (digits.length === 6) {
    const mm = parseInt(digits.slice(0, 2), 10);
    const dd = parseInt(digits.slice(2, 4), 10);
    const yy = parseInt(digits.slice(4, 6), 10);
    const y = twoDigitYearToFull(yy);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && y > 1900 && y < 2100) return { y, m: mm, d: dd };
  }
  if (digits.length === 8) {
    const mm = parseInt(digits.slice(0, 2), 10);
    const dd = parseInt(digits.slice(2, 4), 10);
    const y = parseInt(digits.slice(4, 8), 10);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && y > 1900 && y < 2100) return { y, m: mm, d: dd };
  }

  const parts = bd.split(/[./-]/).map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const p0 = parseInt(parts[0]!, 10);
    const p1 = parseInt(parts[1]!, 10);
    const p2 = parseInt(parts[2]!, 10);
    if (!Number.isFinite(p0) || !Number.isFinite(p1) || !Number.isFinite(p2)) return null;
    let month: number;
    let day: number;
    let year: number;
    if (p2 > 1900) {
      if (p0 > 12) {
        day = p0;
        month = p1;
        year = p2;
      } else {
        month = p0;
        day = p1;
        year = p2;
      }
    } else {
      month = p0;
      day = p1;
      year = twoDigitYearToFull(p2);
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1900 && year < 2100) return { y: year, m: month, d: day };
  }

  if (parts.length === 1 && parts[0]!.length === 8) {
    const yy = parseInt(parts[0]!.slice(4, 8), 10);
    if (Number.isFinite(yy) && yy > 1900 && yy < 2100) return { y: yy };
  }

  return null;
}

function ageFromBirthParts(parts: { y: number; m?: number; d?: number }): number {
  const today = new Date();
  if (parts.m == null || parts.d == null) {
    return today.getFullYear() - parts.y;
  }
  let age = today.getFullYear() - parts.y;
  const tm = today.getMonth() + 1;
  const td = today.getDate();
  if (tm < parts.m || (tm === parts.m && td < parts.d)) age -= 1;
  return age;
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
    const birth = u ? birthPartsFromProfile(u) : null;
    const age = birth != null ? ageFromBirthParts(birth) : null;
    return {
      ...c,
      displayName: (u && displayNameFromProfile(u)) || c.displayName || displayNameFromEmailOnly(email),
      profileImageUrl: profileImageFromUser(u),
      age: age ?? c.age ?? null,
    };
  });
}
