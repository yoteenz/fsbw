/**
 * Blocked clients utility – for spam/fraud prevention.
 * Blocks clients by credentials (name, phone, address, socials) so that
 * similar accounts or future signups with same credentials are also blocked.
 *
 * To prevent blocked clients from making purchases (including guest checkout),
 * call isClientBlocked({ email, phone, firstName, lastName, address, ... }) before
 * allowing checkout.
 */

const BLOCKED_CREDENTIALS_KEY = 'blockedCredentials';
const DELETED_USERS_KEY = 'deletedUsers';
const REGISTERED_USERS_KEY = 'registeredUsers';

export type BlockedCredential = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
};

function normalize(s: string | undefined): string {
  if (!s || typeof s !== 'string') return '';
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizePhone(s: string | undefined): string {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/\D/g, '');
}

/** Extract credential fingerprint from a client/user object */
export function getCredentialFingerprint(u: Record<string, unknown>): BlockedCredential {
  return {
    email: normalize((u.email as string) || ''),
    firstName: normalize((u.firstName as string) || ''),
    lastName: normalize((u.lastName as string) || ''),
    phone: normalizePhone((u.phone as string) || ''),
    address: normalize((u.address as string) || ''),
    facebook: normalize((u.facebook as string) || ''),
    instagram: normalize((u.instagram as string) || ''),
    twitter: normalize((u.twitter as string) || ''),
    tiktok: normalize((u.tiktok as string) || ''),
    youtube: normalize((u.youtube as string) || ''),
    linkedin: normalize((u.linkedin as string) || ''),
  };
}

/** Minimum matching credential fields required to consider two clients "similar" (avoids banning on name alone) */
const MIN_MATCHING_CREDENTIALS = 2;

/** Count how many credential fields match between two fingerprints */
function countMatchingCredentials(a: BlockedCredential, b: BlockedCredential): number {
  let count = 0;
  if (a.email && b.email && a.email === b.email) count++;
  const nameA = `${a.firstName} ${a.lastName}`.trim();
  const nameB = `${b.firstName} ${b.lastName}`.trim();
  if (nameA && nameB && nameA === nameB) count++;
  if (a.phone && b.phone && a.phone === b.phone) count++;
  if (a.address && b.address && a.address === b.address) count++;
  const socials: (keyof BlockedCredential)[] = ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin'];
  for (const k of socials) {
    const va = a[k];
    const vb = b[k];
    if (va && vb && va === vb) count++;
  }
  return count;
}

/** Two credentials match if at least MIN_MATCHING_CREDENTIALS fields match (avoids banning on same name alone) */
function credentialsMatch(a: BlockedCredential, b: BlockedCredential): boolean {
  return countMatchingCredentials(a, b) >= MIN_MATCHING_CREDENTIALS;
}

/** Get all blocked credential fingerprints from localStorage */
export function getBlockedCredentials(): BlockedCredential[] {
  try {
    const raw = localStorage.getItem(BLOCKED_CREDENTIALS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Check if a client matches any blocked credential */
export function isClientBlocked(client: Record<string, unknown>): boolean {
  const fp = getCredentialFingerprint(client);
  const blocked = getBlockedCredentials();
  return blocked.some((b) => credentialsMatch(b, fp));
}

/** Find all clients (from a list) that match the given client's credentials */
export function findSimilarClients(client: Record<string, unknown>, allClients: Record<string, unknown>[]): Record<string, unknown>[] {
  const fp = getCredentialFingerprint(client);
  return allClients.filter((u) => credentialsMatch(fp, getCredentialFingerprint(u)));
}

/** Block a client and all similar clients. Adds to deletedUsers and blockedCredentials. */
export function blockClient(client: Record<string, unknown>, allClients: Record<string, unknown>[]): void {
  const similar = findSimilarClients(client, allClients);
  const now = new Date().toISOString();

  // Add all similar to deletedUsers with blocked marker
  const deleted: any[] = JSON.parse(localStorage.getItem(DELETED_USERS_KEY) || '[]');
  const existingEmails = new Set((deleted || []).map((u: any) => (u.email || '').toLowerCase()));

  for (const u of similar) {
    const email = (u.email as string) || '';
    if (!email || existingEmails.has(email.toLowerCase())) continue;
    const record = {
      ...u,
      blocked: true,
      deletedAt: now,
      deletedFrom: 'admin-blocked',
    };
    deleted.push(record);
    existingEmails.add(email.toLowerCase());
  }

  // Add credential fingerprints to blockedCredentials
  const blocked = getBlockedCredentials();
  for (const u of similar) {
    const fp = getCredentialFingerprint(u);
    if (!blocked.some((b) => credentialsMatch(b, fp))) {
      blocked.push(fp);
    }
  }

  // Remove blocked clients from registeredUsers
  const reg: any[] = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
  const blockedEmails = new Set(similar.map((u) => ((u.email as string) || '').toLowerCase()));
  const filtered = reg.filter((u: any) => !blockedEmails.has((u.email || '').toLowerCase()));
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(filtered));
  localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(deleted));
  localStorage.setItem(BLOCKED_CREDENTIALS_KEY, JSON.stringify(blocked));
}

/** Unblock a client (restore). Removes from deletedUsers and blockedCredentials. */
export function unblockClient(email: string): void {
  const em = (email || '').trim().toLowerCase();
  if (!em) return;

  const deleted: any[] = JSON.parse(localStorage.getItem(DELETED_USERS_KEY) || '[]');
  const reg: any[] = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');

  const restored = deleted.find((u: any) => (u.email || '').toLowerCase() === em && u.blocked);
  if (!restored) return;

  const { blocked: _, deletedAt: __, deletedFrom: ___, ...userWithoutMeta } = restored;
  if (!reg.some((u: any) => (u.email || '').toLowerCase() === em)) {
    reg.push(userWithoutMeta);
  }

  const newDeleted = deleted.filter((u: any) => (u.email || '').toLowerCase() !== em);
  const blocked = getBlockedCredentials().filter((b) => b.email !== em);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(reg));
  localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(newDeleted));
  localStorage.setItem(BLOCKED_CREDENTIALS_KEY, JSON.stringify(blocked));
}
