/** PII redaction and safe export formatting. */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
const BEARER_RE = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const API_KEY_RE = /(?:api[_-]?key|token|secret|password)\s*[:=]\s*\S+/gi;

export function redactPii(text: string): string {
  return text
    .replace(BEARER_RE, 'Bearer [REDACTED]')
    .replace(API_KEY_RE, '[REDACTED]')
    .replace(EMAIL_RE, (m) => maskEmail(m))
    .replace(PHONE_RE, '***-***-****');
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

/** Neutralize CSV/spreadsheet formula injection. */
export function neutralizeCsvCell(value: string | number): string {
  const s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) return `'${s}`;
  return s;
}

export function escapeCsvCell(value: string | number): string {
  const neutral = neutralizeCsvCell(value);
  if (neutral.includes(',') || neutral.includes('"') || neutral.includes('\n')) {
    return `"${neutral.replace(/"/g, '""')}"`;
  }
  return neutral;
}

export function safeErrorMessage(err: unknown, correlationId?: string): string {
  const ref = correlationId ? ` Reference: ${correlationId}.` : '';
  if (err instanceof Error && err.message && !looksLikeSecret(err.message)) {
    return `${err.message}${ref}`;
  }
  return `Something went wrong.${ref}`;
}

function looksLikeSecret(msg: string): boolean {
  return SECRET_KEYS.test(msg) || msg.includes('supabase') && msg.includes('key');
}

const SECRET_KEYS = /password|secret|token|api_key|service_role/i;

export function sanitizeForClient<T extends Record<string, unknown>>(obj: T, hiddenKeys: string[] = []): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SECRET_KEYS.test(k) || hiddenKeys.includes(k)) continue;
    out[k as keyof T] = v as T[keyof T];
  }
  return out;
}
