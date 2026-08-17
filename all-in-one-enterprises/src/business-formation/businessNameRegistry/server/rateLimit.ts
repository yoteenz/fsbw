const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

export function checkBusinessNameRateLimit(key: string, max = 30, windowMs = 3600000): RateLimitResult {
  const bucketKey = `business_name_check:${key}`;
  const now = Date.now();
  const existing = buckets.get(bucketKey);
  if (!existing || now >= existing.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (existing.count >= max) {
    return { allowed: false, retryAfterMs: existing.resetAt - now };
  }
  existing.count += 1;
  return { allowed: true };
}

export function resetBusinessNameRateLimitBuckets(): void {
  buckets.clear();
}

export const MAX_BUSINESS_NAME_LENGTH = 200;
export const MIN_BUSINESS_NAME_LENGTH = 2;

export function validateBusinessNameCheckBody(body: unknown): {
  ok: true;
  value: { state: string; businessName: string; entityType?: string; demoMode?: boolean };
} | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body.', code: 'INVALID_BODY' };
  }
  const record = body as Record<string, unknown>;
  const state = typeof record.state === 'string' ? record.state.trim().toUpperCase() : '';
  const businessName = typeof record.businessName === 'string' ? record.businessName.trim() : '';
  const entityType = typeof record.entityType === 'string' ? record.entityType.trim() : undefined;
  const demoMode = record.demoMode === true;

  if (!/^[A-Z]{2}$/.test(state)) {
    return { ok: false, error: 'Valid two-letter US state code required.', code: 'INVALID_STATE' };
  }
  if (!businessName) {
    return { ok: false, error: 'Business name is required.', code: 'EMPTY_NAME' };
  }
  if (businessName.length > MAX_BUSINESS_NAME_LENGTH) {
    return { ok: false, error: 'Business name is too long.', code: 'NAME_TOO_LONG' };
  }
  return { ok: true, value: { state, businessName, entityType, demoMode } };
}

export function clientIpFromHeaders(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
}
