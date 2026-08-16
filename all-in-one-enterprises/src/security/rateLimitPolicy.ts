/** Centralized rate-limit policy (in-memory demo counters). */

export type RateLimitDimension = 'ip' | 'account' | 'organization' | 'endpoint' | 'operation';

export interface RateLimitRule {
  id: string;
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  dimensions: RateLimitDimension[];
}

export const RATE_LIMIT_RULES: RateLimitRule[] = [
  { id: 'login', endpoint: 'auth/login', maxRequests: 20, windowMs: 3600000, dimensions: ['ip', 'account'] },
  { id: 'password_reset', endpoint: 'auth/password-reset', maxRequests: 10, windowMs: 3600000, dimensions: ['ip', 'account'] },
  { id: 'intake', endpoint: 'public/intake', maxRequests: 30, windowMs: 3600000, dimensions: ['ip'] },
  { id: 'upload', endpoint: 'vault/upload', maxRequests: 50, windowMs: 3600000, dimensions: ['organization'] },
  { id: 'export', endpoint: 'reports/export', maxRequests: 20, windowMs: 3600000, dimensions: ['account', 'operation'] },
  { id: 'search', endpoint: 'search', maxRequests: 120, windowMs: 60000, dimensions: ['account'] },
  { id: 'webhook', endpoint: 'integrations/webhook', maxRequests: 200, windowMs: 60000, dimensions: ['endpoint'] },
];

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ruleId: string, key: string): { allowed: boolean; retryAfterMs?: number } {
  const rule = RATE_LIMIT_RULES.find((r) => r.id === ruleId);
  if (!rule) return { allowed: true };
  const bucketKey = `${ruleId}:${key}`;
  const now = Date.now();
  const existing = buckets.get(bucketKey);
  if (!existing || now >= existing.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + rule.windowMs });
    return { allowed: true };
  }
  if (existing.count >= rule.maxRequests) {
    return { allowed: false, retryAfterMs: existing.resetAt - now };
  }
  existing.count += 1;
  return { allowed: true };
}

export function resetRateLimitBuckets(): void {
  buckets.clear();
}

export const PAGINATION_MAX = 100;

export function clampPagination(limit: number | undefined, max = PAGINATION_MAX): number {
  if (!limit || limit < 1) return 25;
  return Math.min(limit, max);
}

export const MAX_JSON_BODY_BYTES = 512 * 1024;
