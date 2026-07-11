/**
 * Studio Institute owner access — founder-set password (enter + confirm once).
 * Password hash is stored locally and registered in Supabase app_config for API auth.
 */
import { hashInvitePin } from './invite-crypto';

const PASSWORD_HASH_KEY = 'studioInstituteOwnerPasswordHash_v1';
const SESSION_AUTH_KEY = 'studioInstituteOwnerAuth_v1';
const LEGACY_OWNER_KEY = 'studioInstituteOwnerKey_v1';

export const MIN_OWNER_PASSWORD_LENGTH = 6;

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '') as string;
}

export async function hashOwnerPassword(password: string): Promise<string> {
  return hashInvitePin(password);
}

export function getStoredOwnerPasswordHash(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(PASSWORD_HASH_KEY);
}

export function hasOwnerPasswordConfigured(): boolean {
  return Boolean(getStoredOwnerPasswordHash());
}

export function getOwnerAuthToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(SESSION_AUTH_KEY);
}

export function setOwnerAuthToken(hash: string): void {
  sessionStorage.setItem(SESSION_AUTH_KEY, hash);
  sessionStorage.removeItem(LEGACY_OWNER_KEY);
}

export function clearOwnerSession(): void {
  sessionStorage.removeItem(SESSION_AUTH_KEY);
  sessionStorage.removeItem(LEGACY_OWNER_KEY);
}

export async function verifyOwnerPassword(password: string): Promise<boolean> {
  const stored = getStoredOwnerPasswordHash();
  if (!stored) return false;
  const hash = await hashOwnerPassword(password);
  return hash === stored;
}

export async function saveOwnerPassword(password: string): Promise<string> {
  const hash = await hashOwnerPassword(password);
  localStorage.setItem(PASSWORD_HASH_KEY, hash);
  setOwnerAuthToken(hash);
  return hash;
}

export async function bootstrapOwnerPasswordOnServer(passwordHash: string): Promise<'ok' | 'exists' | 'offline' | 'failed'> {
  try {
    const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setup_owner_password', passwordHash }),
    });
    if (res.status === 201 || res.status === 200) return 'ok';
    if (res.status === 409) return 'exists';
    return 'failed';
  } catch {
    return 'offline';
  }
}

export async function checkOwnerPasswordConfiguredOnServer(): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/api/studio-institute/invites?owner_auth_status=1`);
    if (!res.ok) return false;
    const data = (await res.json()) as { configured?: boolean };
    return Boolean(data.configured);
  } catch {
    return false;
  }
}

export async function verifyOwnerAuthOnServer(passwordHash: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
      headers: { 'X-Studio-Institute-Owner-Key': passwordHash },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function unlockWithOwnerPassword(password: string): Promise<'ok' | 'wrong' | 'offline'> {
  const hash = await hashOwnerPassword(password);
  const stored = getStoredOwnerPasswordHash();

  if (stored) {
    if (hash !== stored) return 'wrong';
    setOwnerAuthToken(hash);
    return 'ok';
  }

  const authed = await verifyOwnerAuthOnServer(hash);
  if (authed) {
    localStorage.setItem(PASSWORD_HASH_KEY, hash);
    setOwnerAuthToken(hash);
    return 'ok';
  }

  const serverConfigured = await checkOwnerPasswordConfiguredOnServer();
  if (serverConfigured) return 'wrong';
  return 'offline';
}

export function ownerAuthHeaders(): Record<string, string> {
  const token = getOwnerAuthToken();
  return token ? { 'X-Studio-Institute-Owner-Key': token } : {};
}
