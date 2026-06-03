import type { VercelRequest } from '@vercel/node';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Best-effort in-memory limiter (per serverless instance). */
export function checkRateLimit(
  key: string,
  opts: { max: number; windowMs: number }
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + opts.windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > opts.max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

export function clientIp(req: VercelRequest): string {
  const xf = req.headers['x-forwarded-for'];
  const raw = Array.isArray(xf) ? xf[0] : typeof xf === 'string' ? xf : '';
  return (raw.split(',')[0] || req.socket?.remoteAddress || 'unknown').trim();
}

export function rateLimitResponse(res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void }, retryAfterSec: number): void {
  res.statusCode = 429;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Retry-After', String(retryAfterSec));
  res.end(JSON.stringify({ error: 'Too many requests. Try again later.', retryAfterSec }));
}
