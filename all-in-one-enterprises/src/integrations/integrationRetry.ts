export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 30_000,
  jitterRatio: 0.2,
};

export function isRetryEligibleHttpStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

export function isRetryEligibleError(code: string): boolean {
  return ['TIMEOUT', 'PROVIDER_UNAVAILABLE', 'RATE_LIMITED'].includes(code);
}

export function isNonRetryableError(code: string): boolean {
  return [
    'AUTHENTICATION_FAILED',
    'PERMISSION_MISSING',
    'CONFIGURATION_INVALID',
    'VALIDATION_ERROR',
    'CUSTOMER_OPT_OUT',
    'BUSINESS_RULE_REJECTION',
  ].includes(code);
}

export function computeBackoffDelay(attempt: number, policy: RetryPolicy = DEFAULT_RETRY_POLICY): number {
  const exp = Math.min(policy.baseDelayMs * 2 ** (attempt - 1), policy.maxDelayMs);
  const jitter = exp * policy.jitterRatio * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(exp + jitter));
}

export function shouldRetry(attempt: number, errorCode: string, policy = DEFAULT_RETRY_POLICY): boolean {
  if (attempt >= policy.maxAttempts) return false;
  if (isNonRetryableError(errorCode)) return false;
  return isRetryEligibleError(errorCode);
}

export const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
