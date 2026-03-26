import { patchProfile } from './api';

const PROFILE_PATCH_QUEUE_KEY = 'pendingProfilePatch_v1';
let flushInFlight = false;

function isDataImageUrl(value: unknown): boolean {
  return typeof value === 'string' && value.trim().toLowerCase().startsWith('data:image/');
}

/**
 * Hardening: never persist base64 image blobs to profile PATCH queue/cloud path.
 * Profile photo must be persisted as a Storage URL from /api/profile-image.
 */
function sanitizeProfilePatch(patch: Record<string, unknown>): Record<string, unknown> {
  const clean = Object.fromEntries(Object.entries(patch).filter(([_, v]) => v !== undefined));
  if (isDataImageUrl(clean.profileImage)) delete clean.profileImage;
  if (isDataImageUrl(clean.profile_image)) delete clean.profile_image;
  return clean;
}

function readPendingPatch(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(PROFILE_PATCH_QUEUE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function writePendingPatch(patch: Record<string, unknown> | null): void {
  try {
    if (!patch || Object.keys(patch).length === 0) {
      localStorage.removeItem(PROFILE_PATCH_QUEUE_KEY);
      return;
    }
    localStorage.setItem(PROFILE_PATCH_QUEUE_KEY, JSON.stringify(patch));
  } catch {
    // ignore
  }
}

/** Queue profile fields for retry when network/session is unavailable. */
export function queueProfilePatch(patch: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const clean = sanitizeProfilePatch(patch);
  if (Object.keys(clean).length === 0) return;
  const existing = readPendingPatch() ?? {};
  writePendingPatch({ ...existing, ...clean });
}

/**
 * Try PATCH /api/profile immediately.
 * If it fails, store in queue for a future flush.
 */
export async function patchProfileWithRetryQueue(patch: Record<string, unknown>): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const clean = sanitizeProfilePatch(patch);
  if (Object.keys(clean).length === 0) return false;
  try {
    await patchProfile(clean);
    return true;
  } catch {
    queueProfilePatch(clean);
    return false;
  }
}

/** Flush queued profile updates. Safe to call often (navigation/focus/sign-in). */
export async function flushQueuedProfilePatch(): Promise<boolean> {
  if (typeof window === 'undefined' || flushInFlight) return false;
  const pending = readPendingPatch();
  if (!pending || Object.keys(pending).length === 0) return true;
  flushInFlight = true;
  try {
    await patchProfile(pending);
    writePendingPatch(null);
    return true;
  } catch {
    return false;
  } finally {
    flushInFlight = false;
  }
}
