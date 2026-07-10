import {
  EXPERT_CAPTURE_DEVICE_ID_KEY,
  EXPERT_CAPTURE_GUEST_ID_KEY,
  EXPERT_CAPTURE_RESUME_TOKEN_PREFIX,
} from './types';

function randomId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateGuestSessionId(): string {
  if (typeof window === 'undefined') return randomId('guest');
  const existing = localStorage.getItem(EXPERT_CAPTURE_GUEST_ID_KEY);
  if (existing) return existing;
  const id = randomId('guest');
  localStorage.setItem(EXPERT_CAPTURE_GUEST_ID_KEY, id);
  return id;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return randomId('device');
  const existing = localStorage.getItem(EXPERT_CAPTURE_DEVICE_ID_KEY);
  if (existing) return existing;
  const id = randomId('device');
  localStorage.setItem(EXPERT_CAPTURE_DEVICE_ID_KEY, id);
  return id;
}

export function storeResumeToken(sessionId: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${EXPERT_CAPTURE_RESUME_TOKEN_PREFIX}${sessionId}`, token);
}

export function readResumeToken(sessionId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${EXPERT_CAPTURE_RESUME_TOKEN_PREFIX}${sessionId}`);
}

export function clearResumeToken(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${EXPERT_CAPTURE_RESUME_TOKEN_PREFIX}${sessionId}`);
}

export function buildResumeLink(sessionId: string, profileRoute: string): string {
  const token = readResumeToken(sessionId);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fsbw.vercel.app';
  if (token) {
    return `${origin}/expert-capture/resume?token=${encodeURIComponent(token)}`;
  }
  return `${origin}${profileRoute}?sessionId=${encodeURIComponent(sessionId)}`;
}

export function readDeviceMetadata() {
  return {
    deviceId: getOrCreateDeviceId(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    platform: typeof navigator !== 'undefined' ? navigator.platform : '',
    language: typeof navigator !== 'undefined' ? navigator.language : 'en',
    lastSeenAt: new Date().toISOString(),
  };
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}
